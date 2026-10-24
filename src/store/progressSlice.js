import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import { encodeState, decodeState, sanitizeKey } from '../utils/codec'

const KEY = 'dsa-master-v1'
const SYNC_KEY_STORAGE = 'dsa_sync_key'
const APP_ID = 'igz1gl8v'

// Load initial stored values
function getInitialSolved() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
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

// Async Thunk: Connect & Initial Merge
export const connectAndSync = createAsyncThunk(
  'progress/connectAndSync',
  async ({ key, isSilent = false }, { getState, dispatch }) => {
    const cleanKey = sanitizeKey(key)
    if (!cleanKey) throw new Error('Please enter a valid sync key')

    // Save key locally
    localStorage.setItem(SYNC_KEY_STORAGE, cleanKey)

    // Pull from cloud
    let cloudState = {}
    try {
      const res = await fetch(
        `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${APP_ID}/dsakey_${cleanKey}`
      )
      if (res.ok) {
        const text = await res.text()
        const val = text ? JSON.parse(text) : ''
        cloudState = decodeState(val)
      }
    } catch (err) {
      console.warn('Initial cloud pull failed:', err)
    }

    // Merge: union of local solved and cloud solved
    const localSolved = getState().progress.solved
    const merged = { ...localSolved, ...cloudState }

    // Save merged to localStorage
    try {
      localStorage.setItem(KEY, JSON.stringify(merged))
    } catch (e) {}

    // Push merged state back to cloud
    const encoded = encodeState(merged)
    try {
      await fetch(
        `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${APP_ID}/dsakey_${cleanKey}/${encoded}`,
        {
          method: 'POST',
        }
      )
    } catch (err) {
      console.warn('Initial cloud push failed:', err)
    }

    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    if (!isSilent) {
      dispatch(showToastNotification(`🟢 Connected to "${cleanKey}"! Live sync active.`))
    }

    return {
      syncKey: cleanKey,
      merged,
      lastSyncTime: time,
    }
  }
)

// Async Thunk: Force Sync Now
export const manualSync = createAsyncThunk(
  'progress/manualSync',
  async (_, { getState, dispatch }) => {
    const { syncKey, solved } = getState().progress
    if (!syncKey) return

    let cloudState = {}
    try {
      const res = await fetch(
        `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${APP_ID}/dsakey_${syncKey}`
      )
      if (res.ok) {
        const text = await res.text()
        const val = text ? JSON.parse(text) : ''
        cloudState = decodeState(val)
      }
    } catch (err) {
      console.warn('Manual pull failed:', err)
    }

    const merged = { ...solved, ...cloudState }
    try {
      localStorage.setItem(KEY, JSON.stringify(merged))
    } catch (e) {}

    const encoded = encodeState(merged)
    try {
      await fetch(
        `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${APP_ID}/dsakey_${syncKey}/${encoded}`,
        {
          method: 'POST',
        }
      )
    } catch (err) {
      console.warn('Manual push failed:', err)
    }

    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    dispatch(showToastNotification('🔄 Synced with cloud successfully!'))

    return {
      merged,
      lastSyncTime: time,
    }
  }
)

// Async Thunk: Debounced Auto-Save to Cloud
let autoSaveTimer = null
export const autoSaveToCloud = createAsyncThunk(
  'progress/autoSaveToCloud',
  async (_, { getState }) => {
    const { syncKey, solved } = getState().progress
    if (!syncKey) return

    return new Promise((resolve, reject) => {
      clearTimeout(autoSaveTimer)
      autoSaveTimer = setTimeout(async () => {
        try {
          const encoded = encodeState(solved)
          const res = await fetch(
            `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${APP_ID}/dsakey_${syncKey}/${encoded}`,
            {
              method: 'POST',
            }
          )
          if (!res.ok) throw new Error('Auto-save failed')
          const time = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
          resolve(time)
        } catch (err) {
          reject(err)
        }
      }, 500)
    })
  }
)

export const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    solved: getInitialSolved(),
    syncKey: getInitialSyncKey(),
    syncStatus: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'
    lastSyncTime: null,
    toastMessage: null,
  },
  reducers: {
    toggleProblem: (state, action) => {
      const id = action.payload
      if (state.solved[id]) {
        delete state.solved[id]
      } else {
        state.solved[id] = true
      }
      try {
        localStorage.setItem(KEY, JSON.stringify(state.solved))
      } catch (e) {}
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
      try {
        localStorage.setItem(KEY, JSON.stringify(state.solved))
      } catch (e) {}
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

export const { toggleProblem, setToast, clearToast, disconnectSync, mergeCloudState } =
  progressSlice.actions

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
export const selectIsSolved = (id) => (state) => !!state.progress.solved[id]
export const selectTotalSolved = (state) => Object.keys(state.progress.solved).length
export const selectSyncKey = (state) => state.progress.syncKey
export const selectSyncStatus = (state) => state.progress.syncStatus
export const selectLastSyncTime = (state) => state.progress.lastSyncTime
export const selectToast = (state) => state.progress.toastMessage

export default progressSlice.reducer
