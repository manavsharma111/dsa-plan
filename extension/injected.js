// Injected script running in the webpage's MAIN world context
// Intercepts LeetCode submissions & extracts full untruncated code directly from network & editor models

(function () {
  function saveCodeToBridge(code) {
    if (!code || typeof code !== 'string' || code.trim().length < 10) return
    let bridge = document.getElementById('__dsa_tracker_code_bridge__')
    if (!bridge) {
      bridge = document.createElement('textarea')
      bridge.id = '__dsa_tracker_code_bridge__'
      bridge.style.display = 'none'
      bridge.setAttribute('data-dsa-bridge', 'true')
      ;(document.body || document.documentElement).appendChild(bridge)
    }
    bridge.value = code.trim()
  }

  // 1. Intercept window.fetch to capture exact "typed_code" sent to LeetCode judge on Submit / Run
  try {
    const originalFetch = window.fetch
    window.fetch = async function (...args) {
      try {
        const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '')
        if (
          url &&
          (url.includes('/submit') ||
            url.includes('/problems/') ||
            url.includes('interpret_solution'))
        ) {
          const options = args[1]
          if (options && options.body && typeof options.body === 'string') {
            try {
              const parsed = JSON.parse(options.body)
              if (parsed.typed_code) {
                saveCodeToBridge(parsed.typed_code)
              } else if (parsed.code) {
                saveCodeToBridge(parsed.code)
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
      return originalFetch.apply(this, args)
    }
  } catch (e) {}

  // 2. Intercept XMLHttpRequest.prototype.send for LeetCode / GFG AJAX submissions
  try {
    const originalSend = window.XMLHttpRequest.prototype.send
    window.XMLHttpRequest.prototype.send = function (body) {
      try {
        if (body && typeof body === 'string') {
          if (body.includes('typed_code') || body.includes('code')) {
            try {
              const parsed = JSON.parse(body)
              if (parsed.typed_code) {
                saveCodeToBridge(parsed.typed_code)
              } else if (parsed.code) {
                saveCodeToBridge(parsed.code)
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
      return originalSend.apply(this, arguments)
    }
  } catch (e) {}

  // 3. Extract from Monaco Editor in-memory models (LeetCode)
  function extractFromMonaco() {
    try {
      if (window.monaco && window.monaco.editor) {
        const models = window.monaco.editor.getModels()
        if (models && models.length > 0) {
          let bestModel = models[0]
          let maxLen = 0
          for (const m of models) {
            const val = m.getValue() || ''
            if (val.length > maxLen) {
              maxLen = val.length
              bestModel = m
            }
          }
          if (bestModel && bestModel.getValue().trim().length > 10) {
            saveCodeToBridge(bestModel.getValue())
            return true
          }
        }
      }
    } catch (e) {}
    return false
  }

  // 4. Extract from Ace Editor (GeeksForGeeks)
  function extractFromAce() {
    try {
      const aceElem = document.querySelector('.ace_editor')
      if (aceElem && window.ace) {
        const editor = window.ace.edit(aceElem)
        if (editor) {
          const code = editor.getValue()
          if (code && code.trim().length > 10) {
            saveCodeToBridge(code)
            return true
          }
        }
      }
    } catch (e) {}
    return false
  }

  function syncAll() {
    extractFromMonaco()
    extractFromAce()
  }

  // Answer on-demand request from content.js
  window.addEventListener('DSA_TRACKER_REQUEST_CODE', () => {
    syncAll()
    const bridge = document.getElementById('__dsa_tracker_code_bridge__')
    const code = bridge ? bridge.value : ''
    window.dispatchEvent(new CustomEvent('DSA_TRACKER_RESPONSE_CODE', { detail: { code } }))
  })

  // Sync on editor keyup, click, and periodic heartbeat
  document.addEventListener('keyup', syncAll, { passive: true })
  document.addEventListener('click', syncAll, { passive: true })
  setInterval(syncAll, 1000)

  // Immediate sync
  setTimeout(syncAll, 800)
})()
