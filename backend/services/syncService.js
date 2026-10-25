const Progress = require('../models/Progress')
const Interview = require('../models/Interview')
const PatternAnalytics = require('../models/PatternAnalytics')
const { APP_CONSTANTS } = require('../config/constants')
const { resolveProblem, resolveAllProblems } = require('../config/problemCatalog')

class SyncService {
  async pullUserProgress(syncKey) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey is required and must be a string')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()

    // 1. Fetch or initialize progress record
    let progress = await Progress.findOne({ syncKey: cleanKey })
    if (!progress) {
      progress = await Progress.create({
        syncKey: cleanKey,
        solved: {},
        mastery: {},
        revision: {},
        lastSyncTime: new Date().toISOString(),
      })
    }

    // 2. Fetch interviews history (newest first, up to max limit)
    const interviews = await Interview.find({ syncKey: cleanKey })
      .sort({ startedAt: -1 })
      .limit(APP_CONSTANTS.MAX_HISTORY_LIMIT)
      .lean()

    // 3. Fetch pattern analytics
    const analytics = await PatternAnalytics.findOne({
      syncKey: cleanKey,
    }).lean()

    return {
      syncKey: cleanKey,
      solved: progress.solved || {},
      mastery: progress.mastery || {},
      revision: progress.revision || {},
      lastSyncTime: progress.lastSyncTime || progress.updatedAt,
      interviews: interviews || [],
      patternAnalytics: analytics || null,
    }
  }


  async pushUserProgress(
    syncKey,
    { solved = {}, mastery = {}, revision = {} }
  ) {
    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey is required and must be a string')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const updated = await Progress.findOneAndUpdate(
      { syncKey: cleanKey },
      {
        $set: {
          solved: solved || {},
          mastery: mastery || {},
          revision: revision || {},
          lastSyncTime: nowTime,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )

    return {
      success: true,
      syncKey: cleanKey,
      lastSyncTime: nowTime,
      updatedAt: updated.updatedAt,
    }
  }

  async handleExtensionSubmission(payload = {}) {
    const {
      syncKey,
      problemSlug = '',
      problemTitle = '',
      code = '',
      language = '',
      runtime = '',
      memory = '',
      beatsPercentile = '',
      platform = 'LeetCode',
      problemId = null,
    } = payload

    if (!syncKey || typeof syncKey !== 'string') {
      const err = new Error('syncKey is required')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const cleanKey = syncKey.trim().toLowerCase()
    const now = Date.now()

    let progress = await Progress.findOne({ syncKey: cleanKey })
    if (!progress) {
      progress = await Progress.create({
        syncKey: cleanKey,
        solved: {},
        mastery: {},
        revision: {},
      })
    }

    const solved = { ...(progress.solved || {}) }
    const mastery = { ...(progress.mastery || {}) }
    const revision = { ...(progress.revision || {}) }

    // Resolve canonical problem IDs if matched with 260 curated problems across all patterns
    const matches = resolveAllProblems(problemSlug)
    const titleMatches = matches.length > 0 ? [] : resolveAllProblems(problemTitle)
    const allMatches = matches.length > 0 ? matches : titleMatches

    const canonicalIds = allMatches.map((m) => m.id)
    if (problemId && !canonicalIds.includes(String(problemId))) {
      canonicalIds.push(String(problemId))
    }
    if (canonicalIds.length === 0 && problemSlug) {
      canonicalIds.push(problemSlug)
    }

    const cleanCode = code && typeof code === 'string' ? code.trim() : ''

    // Update solved and mastery for all canonical IDs and slug
    canonicalIds.forEach((id) => {
      solved[id] = true
      if (!mastery[id]) {
        mastery[id] = 'unverified'
      }
    })
    if (problemSlug) {
      solved[problemSlug] = true
      if (!mastery[problemSlug]) mastery[problemSlug] = 'unverified'
    }

    // Find previous revision across any of the matching IDs or slug
    let currentRev = null
    for (const id of canonicalIds) {
      if (revision[id] && (revision[id].stage || revision[id].codeSnippet)) {
        currentRev = revision[id]
        break
      }
    }
    if (!currentRev && problemSlug && revision[problemSlug]) {
      currentRev = revision[problemSlug]
    }
    if (!currentRev) {
      currentRev = { stage: 0, count: 0 }
    }

    const previousHistory = Array.isArray(currentRev.history) ? currentRev.history : []

    // Deduplication strategy: if same problem was submitted within the last 60 seconds, treat as duplicate attempt
    const lastEntry = previousHistory[previousHistory.length - 1]
    const isDuplicateRecent = lastEntry && (now - (lastEntry.date || 0) < 60000)

    const nextStage = isDuplicateRecent ? (currentRev.stage || 1) : Math.min((currentRev.stage || 0) + 1, 5)
    const daysToAdd = [1, 3, 7, 14, 28][nextStage - 1] || 7

    // Keep existing code snippet if incoming code is blank or shorter fragment
    const existingSnippet = currentRev.codeSnippet || ''
    const resolvedCodeSnippet =
      cleanCode && cleanCode.length >= existingSnippet.length
        ? cleanCode.slice(0, 10000)
        : (existingSnippet || cleanCode.slice(0, 10000))

    const historyEntry = {
      date: now,
      stage: nextStage,
      outcome: 'extension_auto_capture',
      timeSpent: runtime || 'Accepted',
      notes: `Auto-captured from ${platform} (External Judge Accepted). Runtime: ${runtime || 'N/A'}${beatsPercentile ? ` (${beatsPercentile})` : ''}. Memory: ${memory || 'N/A'}.`,
      codeSnippet: resolvedCodeSnippet,
      platform,
    }

    const updatedHistory = isDuplicateRecent
      ? [...previousHistory.slice(0, -1), historyEntry]
      : [...previousHistory.slice(-9), historyEntry]

    const revPayload = {
      stage: nextStage,
      count: isDuplicateRecent ? currentRev.count : (currentRev.count || 0) + 1,
      lastRevised: now,
      nextDue: now + daysToAdd * 86400000,
      lastOutcome: 'extension_auto',
      codeSnippet: resolvedCodeSnippet,
      notes: historyEntry.notes,
      history: updatedHistory,
    }

    // Store revision under all matching IDs and problemSlug
    canonicalIds.forEach((id) => {
      revision[id] = revPayload
    })
    if (problemSlug) {
      revision[problemSlug] = revPayload
    }

    await Progress.findOneAndUpdate(
      { syncKey: cleanKey },
      {
        $set: {
          solved,
          mastery,
          revision,
          lastSyncTime: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
      },
      { upsert: true, returnDocument: 'after' }
    )

    const primaryKey = canonicalIds[0] || problemSlug || String(now)

    return {
      success: true,
      syncKey: cleanKey,
      problemTitle: problemTitle || problemSlug,
      targetKey: primaryKey,
      canonicalIds,
      stage: nextStage,
      nextDue: revPayload.nextDue,
    }
  }
}

module.exports = new SyncService()
