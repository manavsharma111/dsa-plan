import Progress from '../models/Progress.js'
import Interview from '../models/Interview.js'
import PatternAnalytics from '../models/PatternAnalytics.js'
import { APP_CONSTANTS } from '../config/constants.js'
import { resolveProblem } from '../config/problemCatalog.js'

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

    // Resolve canonical problem ID if matched with 260 curated problems
    const matched = resolveProblem(problemSlug) || resolveProblem(problemTitle)
    const canonicalId = matched ? matched.id : null
    const targetKey = problemId ? String(problemId) : (canonicalId || problemSlug || String(now))

    solved[targetKey] = true
    if (canonicalId) solved[canonicalId] = true
    if (problemSlug) solved[problemSlug] = true

    if (!mastery[targetKey]) {
      mastery[targetKey] = 'independent'
    }
    if (canonicalId && !mastery[canonicalId]) {
      mastery[canonicalId] = 'independent'
    }

    const currentRev = (canonicalId && revision[canonicalId]) || revision[targetKey] || { stage: 1, count: 0 }
    const nextStage = Math.min((currentRev.stage || 0) + 1, 5)
    const daysToAdd = [1, 3, 7, 14, 28][nextStage - 1] || 7

    const historyEntry = {
      date: now,
      stage: currentRev.stage || 1,
      outcome: 'extension_auto_capture',
      timeSpent: runtime,
      notes: `Auto-captured from ${platform}. Runtime: ${runtime} (${beatsPercentile}). Memory: ${memory}.`,
      codeSnippet: code ? code.slice(0, 10000) : '',
      platform,
    }

    const revPayload = {
      stage: nextStage,
      count: (currentRev.count || 0) + 1,
      lastRevised: now,
      nextDue: now + daysToAdd * 86400000,
      lastOutcome: 'extension_auto',
      codeSnippet: code ? code.slice(0, 10000) : currentRev.codeSnippet || '',
      notes: historyEntry.notes,
      history: [...(currentRev.history || []).slice(-9), historyEntry],
    }

    revision[targetKey] = revPayload
    if (canonicalId) revision[canonicalId] = revPayload

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

    return {
      success: true,
      syncKey: cleanKey,
      problemTitle: problemTitle || problemSlug,
      targetKey,
      stage: nextStage,
      nextDue: revision[targetKey].nextDue,
    }
  }
}

export default new SyncService()
