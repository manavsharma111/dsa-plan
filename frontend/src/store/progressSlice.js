import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import { encodeState, decodeState, sanitizeKey } from '../utils/codec'
import { patternsData } from '../data/patternsData'

const canonicalProblemIds = new Set()
const slugToCanonicalId = {}
patternsData.forEach((pat) => {
  pat.problems.forEach((p) => {
    canonicalProblemIds.add(p.id)
    if (p.slug) slugToCanonicalId[p.slug.toLowerCase().trim()] = p.id
    if (p.name) {
      const clean = p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      slugToCanonicalId[clean] = p.id
    }
  })
})

const KEY = 'dsa-master-v1'
const KEY_MASTERY = 'dsa_mastery_v1'
const KEY_REVISION = 'dsa_revision_v1'
const KEY_INTERVIEW = 'dsa_interview_v1'
const KEY_INTERVIEW_HISTORY = 'dsa_interview_history_v1'
const SYNC_KEY_STORAGE = 'dsa_sync_key'
const APP_ID = 'igz1gl8v'

export const REVISION_INTERVALS_DAYS = [1, 3, 7, 14, 28]

export const REVISION_STAGES_INFO = [
  { stage: 1, days: 1, title: 'Day 1: Revision 1', desc: 'Bina solution dekhe solve & recall' },
  { stage: 2, days: 3, title: 'Day 3: Revision 2', desc: 'Pattern recall & optimized approach' },
  { stage: 3, days: 7, title: 'Day 7: Revision 3', desc: 'Independent coding & edge cases' },
  { stage: 4, days: 14, title: 'Day 14: Revision 4', desc: 'Interview-style timed attempt' },
  { stage: 5, days: 28, title: 'Day 28: Revision 5', desc: 'Long-term retention test -> Mastered' },
]

// Load initial stored values
function getInitialSolved() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function getInitialMastery() {
  try {
    const raw = localStorage.getItem(KEY_MASTERY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function getInitialRevision() {
  try {
    const raw = localStorage.getItem(KEY_REVISION)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function getInitialInterview() {
  try {
    const raw = localStorage.getItem(KEY_INTERVIEW)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

function getInitialInterviewHistory() {
  try {
    const raw = localStorage.getItem(KEY_INTERVIEW_HISTORY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function getInitialSyncKey() {
  if (typeof window === 'undefined') return ''
  const hashMatch = window.location.hash.match(/[#&]sync=([^&]+)/)
  const queryMatch = window.location.search.match(/[?&]sync=([^&]+)/)
  const urlKey = (hashMatch && hashMatch[1]) || (queryMatch && queryMatch[1])
  if (urlKey) return decodeURIComponent(urlKey)
  return localStorage.getItem(SYNC_KEY_STORAGE) || ''
}

// Helper to save to localStorage safely
function persistState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state.solved))
    localStorage.setItem(KEY_MASTERY, JSON.stringify(state.mastery))
    localStorage.setItem(KEY_REVISION, JSON.stringify(state.revision))
    localStorage.setItem(KEY_INTERVIEW_HISTORY, JSON.stringify(state.interviewHistory || []))
    if (state.interviewSession) {
      localStorage.setItem(KEY_INTERVIEW, JSON.stringify(state.interviewSession))
    } else {
      localStorage.removeItem(KEY_INTERVIEW)
    }
  } catch (e) {}
}

// Async Thunk: Connect & Initial Merge with MongoDB + KV fallback
export const connectAndSync = createAsyncThunk(
  'progress/connectAndSync',
  async ({ key, isSilent = false }, { getState, dispatch }) => {
    const cleanKey = sanitizeKey(key)
    if (!cleanKey) throw new Error('Please enter a valid sync key')

    // Save key locally
    localStorage.setItem(SYNC_KEY_STORAGE, cleanKey)

    let cloudSolved = {}
    let cloudMastery = {}
    let cloudRevision = {}
    let cloudInterviews = []
    let mongoSuccess = false

    // 1. Try MongoDB Backend API first
    try {
      const res = await fetch('/api/sync/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncKey: cleanKey }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          mongoSuccess = true
          cloudSolved = json.data.solved || {}
          cloudMastery = json.data.mastery || {}
          cloudRevision = json.data.revision || {}
          cloudInterviews = json.data.interviews || []
        }
      }
    } catch (e) {
      console.warn('MongoDB API pull failed, falling back to KV:', e)
    }

    // 2. If MongoDB was not reached, rely on localStorage state (soft offline fallback)
    if (!mongoSuccess) {
      console.warn('MongoDB sync offline or unreachable, using local device storage.')
    }

    // 3. Union Merge with local state
    const currentState = getState().progress
    const localSolved = currentState.solved || {}
    const localMastery = currentState.mastery || {}
    const localRevision = currentState.revision || {}
    const localInterviews = currentState.interviewHistory || []

    const mergedSolved = { ...localSolved, ...cloudSolved }
    const mergedMastery = { ...localMastery, ...cloudMastery }
    const mergedRevision = { ...localRevision, ...cloudRevision }

    // Merge interview sessions by unique ID
    const interviewMap = {}
    ;[...localInterviews, ...cloudInterviews].forEach((inv) => {
      if (inv && inv.id) interviewMap[inv.id] = inv
    })
    const mergedInterviews = Object.values(interviewMap).sort(
      (a, b) => (b.startedAt || 0) - (a.startedAt || 0)
    )

    // 4. Save merged to localStorage
    try {
      localStorage.setItem(KEY, JSON.stringify(mergedSolved))
      localStorage.setItem(KEY_MASTERY, JSON.stringify(mergedMastery))
      localStorage.setItem(KEY_REVISION, JSON.stringify(mergedRevision))
      localStorage.setItem(KEY_INTERVIEW_HISTORY, JSON.stringify(mergedInterviews))
    } catch (e) {}

    // 5. Push union back to MongoDB backend
    if (mongoSuccess) {
      try {
        await fetch('/api/sync/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            syncKey: cleanKey,
            solved: mergedSolved,
            mastery: mergedMastery,
            revision: mergedRevision,
          }),
        })
      } catch (e) {}
    }

    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    if (!isSilent) {
      dispatch(
        showToastNotification(
          `Connected to "${cleanKey}"! ${mongoSuccess ? 'MongoDB Atlas' : 'Local'} sync active.`
        )
      )
    }

    return {
      syncKey: cleanKey,
      merged: mergedSolved,
      mergedMastery,
      mergedRevision,
      mergedInterviews,
      lastSyncTime: time,
    }
  }
)

// Async Thunk: Force Sync Now
export const manualSync = createAsyncThunk(
  'progress/manualSync',
  async (_, { getState, dispatch }) => {
    const { syncKey, solved, mastery, revision } = getState().progress
    if (!syncKey) {
      dispatch(showToastNotification('Please enter a sync key first!'))
      return null
    }

    try {
      // 1. Fetch latest from MongoDB
      let cloudSolved = {}
      let cloudMastery = {}
      let cloudRevision = {}
      try {
        const fetchRes = await fetch(`/api/sync/fetch?syncKey=${encodeURIComponent(syncKey)}`)
        if (fetchRes.ok) {
          const json = await fetchRes.json()
          if (json.success && json.data) {
            cloudSolved = json.data.solved || {}
            cloudMastery = json.data.mastery || {}
            cloudRevision = json.data.revision || {}
          }
        }
      } catch (e) {}

      // 2. Union Merge
      const merged = { ...cloudSolved, ...solved }
      const mergedMastery = { ...cloudMastery, ...mastery }
      const mergedRevision = { ...cloudRevision, ...revision }

      // 3. Save to localStorage
      try {
        localStorage.setItem(KEY, JSON.stringify(merged))
        localStorage.setItem(KEY_MASTERY, JSON.stringify(mergedMastery))
        localStorage.setItem(KEY_REVISION, JSON.stringify(mergedRevision))
      } catch (e) {}

      // 4. Push to MongoDB
      await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncKey,
          solved: merged,
          mastery: mergedMastery,
          revision: mergedRevision,
        }),
      })

      const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      dispatch(showToastNotification('Synced with MongoDB Atlas successfully!'))

      return {
        merged,
        mergedMastery,
        mergedRevision,
        lastSyncTime: time,
      }
    } catch (err) {
      dispatch(showToastNotification(`Sync note: ${err.message}`))
      throw err
    }
  }
)

// Debounced Auto Save Thunk
let autoSaveTimer = null
export const autoSaveToCloud = createAsyncThunk(
  'progress/autoSaveToCloud',
  async (_, { getState }) => {
    const { syncKey, solved, mastery, revision } = getState().progress
    if (!syncKey) return

    return new Promise((resolve) => {
      clearTimeout(autoSaveTimer)
      autoSaveTimer = setTimeout(async () => {
        try {
          const res = await fetch('/api/sync/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              syncKey,
              solved,
              mastery,
              revision,
            }),
          })
          if (!res.ok) throw new Error('Auto-save to MongoDB returned non-ok')
          const time = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
          resolve(time)
        } catch (err) {
          // Soft fail without throwing red console crashes
          console.warn('[AutoSave] Cloud sync saved locally:', err.message)
          resolve(null)
        }
      }, 500)
    })
  }
)

// Async Thunk: Save Interview to MongoDB Backend
export const saveInterviewToBackend = createAsyncThunk(
  'progress/saveInterviewToBackend',
  async (interview, { getState }) => {
    const { syncKey } = getState().progress
    if (!syncKey || !interview) return
    try {
      await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncKey, interview }),
      })
    } catch (e) {
      console.warn('Could not post interview to MongoDB:', e)
    }
  }
)

export const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    solved: getInitialSolved(),
    mastery: getInitialMastery(), // { [id]: 'hint' | 'independent' | 'mastered' }
    revision: getInitialRevision(), // { [id]: { stage: 1..4, count: number, lastRevised: timestamp, nextDue: timestamp } }
    interviewSession: getInitialInterview(),
    interviewHistory: getInitialInterviewHistory(),
    selectedInterviewDetailId: null,
    activeTab: 'all', // 'all' | 'revision' | 'analytics' | 'interviews'
    interviewModalOpen: false,
    extensionModalOpen: false,
    revisionModalProblem: null, // Problem object currently opened in 5-Point Revision Checklist
    syncKey: getInitialSyncKey(),
    syncStatus: 'idle',
    lastSyncTime: null,
    toastMessage: null,
  },
  reducers: {
    toggleProblem: (state, action) => {
      const id = action.payload
      if (state.solved[id]) {
        delete state.solved[id]
        delete state.mastery[id]
        delete state.revision[id]
      } else {
        state.solved[id] = true
        if (!state.mastery[id]) {
          state.mastery[id] = 'independent'
        }
        const now = Date.now()
        state.revision[id] = {
          stage: 1,
          count: 1,
          lastRevised: now,
          nextDue: now + 1 * 86400000,
          lastOutcome: 'initial',
        }
      }
      persistState(state)
    },

    setMastery: (state, action) => {
      const { id, level } = action.payload // level: 'hint' | 'independent' | 'mastered' | 'none'
      if (level === 'none') {
        delete state.solved[id]
        delete state.mastery[id]
        delete state.revision[id]
      } else {
        state.solved[id] = true
        state.mastery[id] = level
        const now = Date.now()
        let days = 3
        let stg = 2
        if (level === 'hint') {
          days = 1
          stg = 1
        } else if (level === 'mastered') {
          days = 28
          stg = 5
        }

        if (!state.revision[id]) {
          state.revision[id] = {
            stage: stg,
            count: 1,
            lastRevised: now,
            nextDue: now + days * 86400000,
            lastOutcome: 'manual',
          }
        } else {
          state.revision[id].stage = stg
          state.revision[id].nextDue = now + days * 86400000
          state.revision[id].lastOutcome = 'manual'
        }
      }
      persistState(state)
    },

    recordRevision: (state, action) => {
      const {
        id,
        outcome,
        checklistCount = 0,
        checklist = {},
        timeSpent = '',
        mistakeTags = [],
        notes = '',
        codeSnippet = '',
        codeAnalysis = null,
        aiReview = null,
      } = action.payload

      const now = Date.now()
      const current = state.revision[id] || { stage: 0, count: 0 }

      let nextStage = (current.stage || 0) + 1
      let daysToAdd = 1
      let newMastery = state.mastery[id] || 'independent'

      if (outcome === 'efficient') {
        // Solved efficiently without hints -> 7 days or next higher stage
        nextStage = Math.min((current.stage || 0) + 1, 5)
        daysToAdd = Math.max(7, REVISION_INTERVALS_DAYS[nextStage - 1] || 7)
        newMastery = nextStage >= 5 ? 'mastered' : 'independent'
      } else if (outcome === 'slow') {
        // Solved, but took too much time -> In 3 days
        nextStage = Math.max(2, current.stage || 2)
        daysToAdd = 3
        newMastery = 'independent'
      } else if (outcome === 'hint') {
        // Needed a hint -> Next day (1 day)
        nextStage = 1
        daysToAdd = 1
        newMastery = 'hint'
      } else if (outcome === 'solution') {
        // Had to view solution -> Next day independently
        nextStage = 1
        daysToAdd = 1
        newMastery = 'hint'
      } else if (outcome === 'repeat_mistake') {
        // Repeated same mistake -> Next day, then in 3 days (Reset stage to 1)
        nextStage = 1
        daysToAdd = 1
        newMastery = 'hint'
      } else {
        // Normal progression
        nextStage = Math.min((current.stage || 0) + 1, 5)
        daysToAdd = REVISION_INTERVALS_DAYS[nextStage - 1] || 28
        if (nextStage >= 5) {
          newMastery = 'mastered'
        }
      }

      state.solved[id] = true
      state.mastery[id] = newMastery

      const previousHistory = Array.isArray(current.history) ? current.history : []
      const newHistoryEntry = {
        date: now,
        stage: current.stage || 1,
        outcome: outcome || 'normal',
        checklistCount,
        timeSpent,
        mistakeTags,
        notes,
        codeSnippet: codeSnippet ? codeSnippet.slice(0, 15000) : '',
        codeAnalysis,
        aiReview: aiReview || current.aiReview || null,
      }

      state.revision[id] = {
        stage: nextStage,
        count: (current.count || 0) + 1,
        lastRevised: now,
        nextDue: now + daysToAdd * 86400000,
        lastOutcome: outcome || 'normal',
        checklistCount,
        checklist,
        timeSpent,
        mistakeTags,
        notes,
        codeSnippet: codeSnippet ? codeSnippet.slice(0, 15000) : current.codeSnippet || '',
        codeAnalysis: codeAnalysis || current.codeAnalysis || null,
        aiReview: aiReview !== undefined && aiReview !== null ? aiReview : current.aiReview || null,
        history: [...previousHistory.slice(-9), newHistoryEntry],
      }
      persistState(state)
    },

    saveProblemSolution: (state, action) => {
      const {
        id,
        codeSnippet = '',
        codeAnalysis = null,
        notes = '',
        aiReview = null,
      } = action.payload

      if (!id) return

      const current = state.revision[id] || {
        stage: 1,
        count: 1,
        lastRevised: Date.now(),
        nextDue: Date.now() + 86400000,
        lastOutcome: 'manual',
        checklistCount: 0,
        checklist: {},
        timeSpent: '',
        mistakeTags: [],
        notes: '',
        codeSnippet: '',
        codeAnalysis: null,
        history: [],
      }

      state.solved[id] = true
      if (!state.mastery[id]) {
        state.mastery[id] = 'independent'
      }

      state.revision[id] = {
        ...current,
        codeSnippet: codeSnippet !== undefined ? (codeSnippet ? codeSnippet.slice(0, 15000) : '') : current.codeSnippet || '',
        codeAnalysis: codeAnalysis !== undefined ? codeAnalysis : current.codeAnalysis || null,
        notes: notes !== undefined ? notes : current.notes || '',
        aiReview: aiReview !== undefined && aiReview !== null ? aiReview : current.aiReview || null,
      }
      persistState(state)
    },

    setRevisionModalProblem: (state, action) => {
      state.revisionModalProblem = action.payload
    },

    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },

    setInterviewModalOpen: (state, action) => {
      state.interviewModalOpen = action.payload
    },

    setExtensionModalOpen: (state, action) => {
      state.extensionModalOpen = action.payload
    },

    startInterviewSession: (state, action) => {
      const { problems, durationMinutes, title } = action.payload
      state.interviewSession = {
        id: Date.now(),
        title: title || 'Mock Interview',
        problems, // array of problem objects or IDs
        durationMinutes,
        timeRemaining: durationMinutes * 60,
        status: 'running',
        startedAt: Date.now(),
        solved: {},
      }
      state.interviewModalOpen = true
      persistState(state)
    },

    tickInterviewTimer: (state) => {
      if (state.interviewSession && state.interviewSession.status === 'running') {
        const nextTime = Math.max(0, state.interviewSession.timeRemaining - 1)
        state.interviewSession.timeRemaining = nextTime
        if (nextTime === 0) {
          state.interviewSession.status = 'completed'
        }
        persistState(state)
      }
    },

    toggleInterviewTimer: (state) => {
      if (state.interviewSession) {
        state.interviewSession.status =
          state.interviewSession.status === 'running' ? 'paused' : 'running'
        persistState(state)
      }
    },

    toggleInterviewProblem: (state, action) => {
      const id = action.payload
      if (state.interviewSession) {
        const isNowSolved = !state.interviewSession.solved[id]
        state.interviewSession.solved[id] = isNowSolved
        if (isNowSolved) {
          state.solved[id] = true
          state.mastery[id] = 'mastered'
          const now = Date.now()
          state.revision[id] = {
            stage: 1,
            count: 1,
            lastRevised: now,
            nextDue: now + 1 * 86400000,
          }
        }
        persistState(state)
      }
    },

    endInterviewSession: (state, action) => {
      if (state.interviewSession) {
        state.interviewSession.status = 'completed'
        const session = state.interviewSession
        const notes = action.payload?.notes || ''
        const timeTaken = session.durationMinutes * 60 - session.timeRemaining
        const total = session.problems?.length || 0
        const solvedCount = Object.values(session.solved || {}).filter(Boolean).length

        const historyEntry = {
          id: session.id || Date.now(),
          title: session.title,
          startedAt: session.startedAt,
          completedAt: Date.now(),
          durationMinutes: session.durationMinutes,
          timeTakenSeconds: Math.max(0, timeTaken),
          totalProblems: total,
          solvedProblems: solvedCount,
          scorePercent: total > 0 ? Math.round((solvedCount / total) * 100) : 0,
          notes,
          problems: (session.problems || []).map((p) => ({
            id: p.id,
            name: p.name,
            difficulty: p.difficulty,
            lc: p.lc,
            url: p.url,
            slug: p.slug,
            platform: p.platform,
            patternTitle: p.patternTitle,
            solved: !!session.solved?.[p.id],
          })),
        }

        // Avoid duplicate ID
        const existingIdx = (state.interviewHistory || []).findIndex(
          (h) => h.id === historyEntry.id
        )
        if (existingIdx >= 0) {
          state.interviewHistory[existingIdx] = historyEntry
        } else {
          state.interviewHistory = [historyEntry, ...(state.interviewHistory || [])]
        }
        persistState(state)
      }
    },

    deleteInterviewRecord: (state, action) => {
      const id = action.payload
      state.interviewHistory = (state.interviewHistory || []).filter((h) => h.id !== id)
      if (state.selectedInterviewDetailId === id) {
        state.selectedInterviewDetailId = null
      }
      persistState(state)
    },

    clearInterviewHistory: (state) => {
      state.interviewHistory = []
      state.selectedInterviewDetailId = null
      persistState(state)
    },

    setSelectedInterviewDetailId: (state, action) => {
      state.selectedInterviewDetailId = action.payload
    },

    resetInterviewSession: (state) => {
      state.interviewSession = null
      persistState(state)
    },

    setToast: (state, action) => {
      state.toastMessage = action.payload
    },

    clearToast: (state) => {
      state.toastMessage = null
    },

    disconnectSync: (state) => {
      state.syncKey = ''
      state.syncStatus = 'idle'
      state.lastSyncTime = null
      localStorage.removeItem(SYNC_KEY_STORAGE)
      state.toastMessage = 'Cloud sync disconnected (progress kept locally)'
    },

    mergeCloudState: (state, action) => {
      state.solved = { ...state.solved, ...action.payload }
      // default any new question to independent
      Object.keys(action.payload).forEach((id) => {
        if (!state.mastery[id]) state.mastery[id] = 'independent'
      })
      persistState(state)
    },
  },
  extraReducers: (builder) => {
    // connectAndSync
    builder.addCase(connectAndSync.pending, (state) => {
      state.syncStatus = 'syncing'
    })
    builder.addCase(connectAndSync.fulfilled, (state, action) => {
      state.syncKey = action.payload.syncKey
      state.solved = action.payload.merged
      if (action.payload.mergedMastery) state.mastery = action.payload.mergedMastery
      if (action.payload.mergedRevision) state.revision = action.payload.mergedRevision
      if (action.payload.mergedInterviews) state.interviewHistory = action.payload.mergedInterviews
      state.lastSyncTime = action.payload.lastSyncTime
      state.syncStatus = 'synced'
    })
    builder.addCase(connectAndSync.rejected, (state) => {
      state.syncStatus = 'error'
    })

    // manualSync
    builder.addCase(manualSync.pending, (state) => {
      state.syncStatus = 'syncing'
    })
    builder.addCase(manualSync.fulfilled, (state, action) => {
      if (action.payload) {
        state.solved = action.payload.merged
        state.lastSyncTime = action.payload.lastSyncTime
        state.syncStatus = 'synced'
      }
    })
    builder.addCase(manualSync.rejected, (state) => {
      state.syncStatus = 'error'
    })

    // autoSaveToCloud
    builder.addCase(autoSaveToCloud.pending, (state) => {
      if (state.syncKey) state.syncStatus = 'syncing'
    })
    builder.addCase(autoSaveToCloud.fulfilled, (state, action) => {
      state.syncStatus = 'synced'
      state.lastSyncTime = action.payload
    })
    builder.addCase(autoSaveToCloud.rejected, (state) => {
      state.syncStatus = 'error'
    })
  },
})

export const {
  toggleProblem,
  setMastery,
  recordRevision,
  saveProblemSolution,
  setRevisionModalProblem,
  setActiveTab,
  setInterviewModalOpen,
  setExtensionModalOpen,
  startInterviewSession,
  tickInterviewTimer,
  toggleInterviewTimer,
  toggleInterviewProblem,
  endInterviewSession,
  resetInterviewSession,
  deleteInterviewRecord,
  clearInterviewHistory,
  setSelectedInterviewDetailId,
  setToast,
  clearToast,
  disconnectSync,
  mergeCloudState,
} = progressSlice.actions

// Toast helper routed via react-toastify
export const showToastNotification = (msg, type) => () => {
  if (type && toast[type]) {
    toast[type](msg)
  } else if (msg.includes('⚠️') || msg.includes('warning') || msg.includes('Please enter')) {
    toast.warning(msg.replace(/^⚠️\s*/, ''))
  } else if (
    msg.includes('🟢') ||
    msg.includes('🔄') ||
    msg.includes('success') ||
    msg.includes('Synced')
  ) {
    toast.success(msg.replace(/^[🟢🔄]\s*/, ''))
  } else if (msg.includes('📋') || msg.includes('copied')) {
    toast.info(msg.replace(/^📋\s*/, ''))
  } else {
    toast.info(msg)
  }
}

// Selectors
export const selectSolved = (state) => state.progress.solved
export const selectIsSolved = (id, slug) => (state) =>
  !!state.progress.solved[id] || (slug ? !!state.progress.solved[slug] : false)
export const selectTotalSolved = (state) => {
  const solved = state.progress.solved || {}
  const counted = new Set()
  for (const key of Object.keys(solved)) {
    if (!solved[key]) continue
    if (canonicalProblemIds.has(key)) {
      counted.add(key)
    } else if (slugToCanonicalId[key]) {
      counted.add(slugToCanonicalId[key])
    } else {
      counted.add(key)
    }
  }
  return counted.size
}
export const selectMastery = (state) => state.progress.mastery || {}
export const selectProblemMastery = (id, slug) => (state) =>
  (state.progress.mastery && (state.progress.mastery[id] || (slug && state.progress.mastery[slug]))) ||
  (state.progress.solved[id] || (slug && state.progress.solved[slug]) ? 'independent' : 'none')
export const selectRevision = (state) => state.progress.revision || {}
export const selectActiveTab = (state) => state.progress.activeTab || 'all'
export const selectInterviewModalOpen = (state) => state.progress.interviewModalOpen
export const selectExtensionModalOpen = (state) => state.progress.extensionModalOpen
export const selectInterviewSession = (state) => state.progress.interviewSession
export const selectInterviewHistory = (state) => state.progress.interviewHistory || []
export const selectSelectedInterviewDetailId = (state) => state.progress.selectedInterviewDetailId
export const selectRevisionModalProblem = (state) => state.progress.revisionModalProblem
export const selectSyncKey = (state) => state.progress.syncKey
export const selectSyncStatus = (state) => state.progress.syncStatus
export const selectLastSyncTime = (state) => state.progress.lastSyncTime
export const selectToast = (state) => state.progress.toastMessage

export default progressSlice.reducer
