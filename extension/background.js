// Background Service Worker for DSA Tracker Auto-Sync Extension

const DEFAULT_BACKEND = 'https://dsa-plan-backend.onrender.com'

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CODE_SUBMITTED') {
    handleSubmission(message.payload)
      .then((res) => sendResponse({ success: true, data: res }))
      .catch((err) => sendResponse({ success: false, error: err.message }))
    return true // Keep sendResponse asynchronous
  }
})

async function handleSubmission(payload) {
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

  const backendUrl = (config.backendUrl || DEFAULT_BACKEND).replace(/\/$/, '')

  console.log(`[DSA Tracker] Sending ${payload.problemTitle} to ${backendUrl}...`)

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
