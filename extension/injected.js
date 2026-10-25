// Injected script running in the webpage's MAIN world context
// Intercepts LeetCode & GFG submissions & extracts full untruncated code directly from network & editor models

(function () {
  console.log('[DSA Tracker MAIN World] Interceptors active & listening.')

  function saveCodeToBridge(code) {
    if (!code || typeof code !== 'string') return
    const trimmed = code.trim()
    if (trimmed.length < 10) return

    window.__DSA_TRACKER_LATEST_CODE__ = trimmed

    // 1. Post message to ISOLATED world (Chrome cross-world channel)
    try {
      window.postMessage(
        {
          type: '__DSA_TRACKER_CODE_SYNC__',
          code: trimmed,
          timestamp: Date.now(),
        },
        '*'
      )
    } catch (_) {}

    // 2. Write to DOM attribute & textContent (DOM tree is shared across worlds)
    try {
      let bridge = document.getElementById('__dsa_tracker_code_bridge__')
      if (!bridge) {
        bridge = document.createElement('textarea')
        bridge.id = '__dsa_tracker_code_bridge__'
        bridge.style.display = 'none'
        bridge.setAttribute('data-dsa-bridge', 'true')
        ;(document.body || document.documentElement).appendChild(bridge)
      }
      bridge.value = trimmed
      bridge.textContent = trimmed
      bridge.setAttribute('data-code', trimmed)
      bridge.setAttribute('data-updated', String(Date.now()))
    } catch (_) {}

    // 3. Dispatch custom event
    try {
      window.dispatchEvent(
        new CustomEvent('DSA_TRACKER_CODE_CAPTURED', { detail: { code: trimmed } })
      )
    } catch (_) {}
  }

  function extractCodeFromRaw(body) {
    if (!body) return null
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body)
        const code =
          parsed.typed_code ||
          parsed.typedCode ||
          parsed.code ||
          parsed.variables?.typedCode ||
          parsed.variables?.code ||
          parsed.variables?.submissionCode ||
          parsed.variables?.solution ||
          parsed.submission?.code ||
          null
        if (code && typeof code === 'string' && code.trim().length > 10) {
          return code.trim()
        }
      } catch (e) {
        // Handle URL-encoded or raw JSON strings
        const match =
          body.match(/"typed_code"\s*:\s*"((?:\\.|[^"\\])*)"/) ||
          body.match(/"typedCode"\s*:\s*"((?:\\.|[^"\\])*)"/) ||
          body.match(/typed_code=([^&]+)/)
        if (match && match[1]) {
          try {
            return JSON.parse(`"${match[1]}"`)
          } catch (_) {
            return decodeURIComponent(match[1])
          }
        }
      }
    } else if (typeof body === 'object') {
      const code =
        body.typed_code ||
        body.typedCode ||
        body.code ||
        body.variables?.typedCode ||
        body.variables?.code ||
        null
      if (code && typeof code === 'string' && code.trim().length > 10) {
        return code.trim()
      }
    }
    return null
  }

  // 1. Intercept window.fetch for ALL submission / GraphQL endpoints
  try {
    const originalFetch = window.fetch
    window.fetch = async function (...args) {
      try {
        const firstArg = args[0]
        const secondArg = args[1]

        if (secondArg && secondArg.body) {
          const code = extractCodeFromRaw(secondArg.body)
          if (code) saveCodeToBridge(code)
        }

        if (firstArg && typeof firstArg === 'object' && typeof firstArg.clone === 'function') {
          try {
            firstArg
              .clone()
              .text()
              .then((text) => {
                const code = extractCodeFromRaw(text)
                if (code) saveCodeToBridge(code)
              })
              .catch(() => {})
          } catch (e) {}
        }
      } catch (e) {}

      const response = await originalFetch.apply(this, args)

      try {
        const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '')
        if (
          url.includes('/check/') ||
          url.includes('/submit') ||
          url.includes('/submissions/') ||
          url.includes('graphql')
        ) {
          response
            .clone()
            .json()
            .then((data) => {
              if (
                data &&
                (data.status_msg === 'Accepted' ||
                  (data.state === 'SUCCESS' && data.status_msg === 'Accepted'))
              ) {
                const submissionId = String(data.submission_id || data.id || Date.now())
                const runtime = data.status_runtime || 'Accepted'
                const memory = data.status_memory || ''
                window.dispatchEvent(
                  new CustomEvent('DSA_TRACKER_SUBMISSION_ACCEPTED', {
                    detail: { submissionId, runtime, memory },
                  })
                )
              }
            })
            .catch(() => {})
        }
      } catch (_) {}

      return response
    }
  } catch (e) {}

  // 2. Intercept XMLHttpRequest for AJAX submissions & check polling
  try {
    const originalOpen = window.XMLHttpRequest.prototype.open
    window.XMLHttpRequest.prototype.open = function (method, url) {
      this._dsa_url = url
      return originalOpen.apply(this, arguments)
    }

    const originalSend = window.XMLHttpRequest.prototype.send
    window.XMLHttpRequest.prototype.send = function (body) {
      try {
        const code = extractCodeFromRaw(body)
        if (code) saveCodeToBridge(code)
      } catch (e) {}

      this.addEventListener('load', function () {
        try {
          const url = this._dsa_url || ''
          if (
            url.includes('/check/') ||
            url.includes('/submit') ||
            url.includes('/submissions/')
          ) {
            const data = JSON.parse(this.responseText)
            if (
              data &&
              (data.status_msg === 'Accepted' ||
                (data.state === 'SUCCESS' && data.status_msg === 'Accepted'))
            ) {
              const submissionId = String(data.submission_id || data.id || Date.now())
              const runtime = data.status_runtime || 'Accepted'
              const memory = data.status_memory || ''
              window.dispatchEvent(
                new CustomEvent('DSA_TRACKER_SUBMISSION_ACCEPTED', {
                  detail: { submissionId, runtime, memory },
                })
              )
            }
          }
        } catch (_) {}
      })

      return originalSend.apply(this, arguments)
    }
  } catch (e) {}

  // 3. Intercept window.Request constructor
  try {
    const OriginalRequest = window.Request
    window.Request = function (input, init) {
      try {
        if (init && init.body) {
          const code = extractCodeFromRaw(init.body)
          if (code) saveCodeToBridge(code)
        }
      } catch (e) {}
      return new OriginalRequest(input, init)
    }
  } catch (e) {}

  // 4. Extract from Monaco Editor in-memory models (LeetCode)
  function extractFromMonaco() {
    try {
      let monacoObj = window.monaco
      if (!monacoObj && typeof window.require === 'function') {
        try {
          monacoObj = window.require('vs/editor/editor.main')
        } catch (_) {}
      }

      if (monacoObj && monacoObj.editor) {
        const models = monacoObj.editor.getModels()
        if (models && models.length > 0) {
          let bestCode = ''
          for (const m of models) {
            const val = m.getValue() || ''
            if (val.length > bestCode.length) {
              bestCode = val
            }
          }
          if (bestCode.trim().length > 15) {
            saveCodeToBridge(bestCode)
            return true
          }
        }
      }
    } catch (e) {}
    return false
  }

  // 5. Extract from Ace Editor (GeeksForGeeks)
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

  // 6. Extract from CodeMirror
  function extractFromCodeMirror() {
    try {
      const cmElem = document.querySelector('.CodeMirror')
      if (cmElem && cmElem.CodeMirror) {
        const code = cmElem.CodeMirror.getValue()
        if (code && code.trim().length > 10) {
          saveCodeToBridge(code)
          return true
        }
      }
    } catch (e) {}
    return false
  }

  function syncAll() {
    extractFromMonaco()
    extractFromAce()
    extractFromCodeMirror()
  }

  // Handle postMessage requests from content.js
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === '__DSA_TRACKER_REQUEST_CODE__') {
      syncAll()
      const code = window.__DSA_TRACKER_LATEST_CODE__ || ''
      if (code) {
        saveCodeToBridge(code)
      }
    }
  })

  // Answer on-demand request from content.js
  window.addEventListener('DSA_TRACKER_REQUEST_CODE', () => {
    syncAll()
    const bridge = document.getElementById('__dsa_tracker_code_bridge__')
    const code = bridge ? bridge.getAttribute('data-code') || bridge.value : window.__DSA_TRACKER_LATEST_CODE__ || ''
    window.dispatchEvent(
      new CustomEvent('DSA_TRACKER_RESPONSE_CODE', { detail: { code } })
    )
  })

  // Proactively sync code whenever user clicks "Submit" or "Run"
  document.addEventListener(
    'click',
    (e) => {
      try {
        const btn = e.target.closest('button, [role="button"]')
        if (btn) {
          const text = (btn.textContent || '').trim().toLowerCase()
          const locator = (btn.getAttribute('data-e2e-locator') || '').toLowerCase()
          if (
            text.includes('submit') ||
            text.includes('run') ||
            locator.includes('submit') ||
            locator.includes('run')
          ) {
            syncAll()
          }
        }
      } catch (e) {}
    },
    true
  )

  // Sync on keyboard shortcut (Ctrl+Enter or Cmd+Enter)
  document.addEventListener(
    'keydown',
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        syncAll()
      }
    },
    true
  )

  setInterval(syncAll, 1000)
  setTimeout(syncAll, 500)
})()
