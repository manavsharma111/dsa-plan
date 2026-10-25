// Background Service Worker for DSA Tracker Auto-Sync Extension

const DEFAULT_BACKEND = 'https://dsa-plan-backend.onrender.com'

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CODE_SUBMITTED') {
    handleSubmission(message.payload, sender)
      .then((res) => sendResponse({ success: true, data: res }))
      .catch((err) => sendResponse({ success: false, error: err.message }))
    return true // Keep sendResponse asynchronous
  }
})

async function handleSubmission(payload, sender) {
  const config = await chrome.storage.local.get([
    'syncKey',
    'backendUrl',
    'autoSyncEnabled',
  ])

  if (config.autoSyncEnabled === false) {
    console.log('[DSA Tracker] Auto-sync is paused in settings.')
    return { status: 'skipped' }
  }

  const syncKey = config.syncKey?.trim()
  if (!syncKey) {
    console.warn('[DSA Tracker] No Sync Key configured in extension popup.')
    throw new Error('Sync Key not configured. Please open extension and enter Sync Key.')
  }

  // Use Chrome native chrome.scripting API to extract 100% full unvirtualized Monaco code from MAIN world
  if (sender && sender.tab && sender.tab.id && chrome.scripting) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        world: 'MAIN',
        func: () => {
          // 1. Monaco Editor in-memory models (100% full buffer, immune to DOM scroll virtualization)
          try {
            if (window.monaco && window.monaco.editor) {
              const models = window.monaco.editor.getModels()
              if (models && models.length > 0) {
                let best = ''
                for (const m of models) {
                  const val = m.getValue() || ''
                  if (val.length > best.length) best = val
                }
                if (best.trim().length > 15) return best.trim()
              }
            }
          } catch (_) {}

          // 2. Global captured code from network interceptor
          try {
            if (
              window.__DSA_TRACKER_LATEST_CODE__ &&
              window.__DSA_TRACKER_LATEST_CODE__.trim().length > 15
            ) {
              return window.__DSA_TRACKER_LATEST_CODE__.trim()
            }
          } catch (_) {}

          // 3. Ace Editor (GeeksForGeeks)
          try {
            const aceElem = document.querySelector('.ace_editor')
            if (aceElem && window.ace) {
              const editor = window.ace.edit(aceElem)
              if (editor) {
                const val = editor.getValue()
                if (val && val.trim().length > 10) return val.trim()
              }
            }
          } catch (_) {}

          // 4. CodeMirror
          try {
            const cmElem = document.querySelector('.CodeMirror')
            if (cmElem && cmElem.CodeMirror) {
              const val = cmElem.CodeMirror.getValue()
              if (val && val.trim().length > 10) return val.trim()
            }
          } catch (_) {}

          return null
        },
      })

      const fullCode = results?.[0]?.result
      if (fullCode && fullCode.length > (payload.code || '').length) {
        console.log(
          `[DSA Tracker Background] Upgraded to 100% full unvirtualized code via MAIN world (length: ${fullCode.length} vs ${payload.code?.length || 0})`
        )
        payload.code = fullCode
      }
    } catch (err) {
      console.warn('[DSA Tracker Background] Main world script execution notice:', err)
    }
  }

  const backendUrl = (config.backendUrl || DEFAULT_BACKEND).replace(/\/$/, '')

  console.log(`[DSA Tracker] Sending ${payload.problemTitle} to ${backendUrl}... (Code length: ${payload.code?.length || 0})`)

  const response = await fetch(`${backendUrl}/api/sync/extension-submission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      syncKey,
      ...payload,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Server returned error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  console.log('[DSA Tracker] Successfully synced submission:', result)

  // Save last synced history in extension storage
  const history = (await chrome.storage.local.get(['syncHistory'])).syncHistory || []
  history.unshift({
    title: payload.problemTitle,
    platform: payload.platform,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    runtime: payload.runtime,
  })
  await chrome.storage.local.set({ syncHistory: history.slice(0, 10) })

  return result
}
