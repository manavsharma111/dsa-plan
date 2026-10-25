// Content script running on LeetCode & GeeksForGeeks

console.log('[DSA Tracker Extension] Content script loaded on', window.location.hostname)

// Inject main-world script directly into document as a guaranteed execution channel
try {
  const injectedScript = document.createElement('script')
  injectedScript.src = chrome.runtime.getURL('injected.js')
  injectedScript.onload = () => injectedScript.remove()
  ;(document.head || document.documentElement).appendChild(injectedScript)
} catch (e) {
  console.warn('[DSA Tracker] Script injection note:', e)
}

let hasProcessedSubmission = false

// Helper: Show floating toast on webpage
function showInPageNotification(title, message, isSuccess = true) {
  const existing = document.getElementById('dsa-tracker-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'dsa-tracker-toast'
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999999;
    padding: 12px 18px;
    border-radius: 12px;
    background: ${isSuccess ? '#10b981' : '#ef4444'};
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 10px;
    animation: dsaSlideIn 0.3s ease;
  `
  toast.innerHTML = `
    <span style="font-size: 18px;">${isSuccess ? '🚀' : '⚠️'}</span>
    <div>
      <div style="font-size: 12px; opacity: 0.9;">DSA Tracker Cloud Sync</div>
      <div>${title}: ${message}</div>
    </div>
  `

  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.4s ease'
    setTimeout(() => toast.remove(), 400)
  }, 4500)
}

// -------------------------------------------------------------
// 1. LEETCODE CAPTURE ENGINE
// -------------------------------------------------------------
function extractLeetCodeCode() {
  // Method 1: Read full untruncated code from shared bridge (populated by network interception or Monaco models)
  const bridge = document.getElementById('__dsa_tracker_code_bridge__')
  if (bridge && bridge.value && bridge.value.trim().length > 15) {
    return bridge.value.trim()
  }

  // Method 2: Trigger custom event to request immediate sync from injected.js
  try {
    window.dispatchEvent(new CustomEvent('DSA_TRACKER_REQUEST_CODE'))
    const refreshedBridge = document.getElementById('__dsa_tracker_code_bridge__')
    if (refreshedBridge && refreshedBridge.value && refreshedBridge.value.trim().length > 15) {
      return refreshedBridge.value.trim()
    }
  } catch (e) {}

  // Method 3: Scan page localStorage for LeetCode editor auto-saved code buffer
  try {
    let best = ''
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (k.includes('code') || k.includes('solution') || k.includes('_') || /^\d+/.test(k))) {
        let val = localStorage.getItem(k)
        if (val && typeof val === 'string') {
          // If JSON wrapped
          if (val.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(val)
              const candidate =
                parsed.typed_code ||
                parsed.code ||
                parsed.typedCode ||
                parsed.variables?.typedCode ||
                parsed.variables?.code ||
                ''
              if (candidate && candidate.length > best.length) {
                best = candidate
              }
            } catch (_) {}
          }
          if (
            val.length > best.length &&
            (val.includes('class Solution') ||
              val.includes('vector<') ||
              val.includes('def ') ||
              val.includes('public:') ||
              val.includes('function') ||
              val.includes('sortColors'))
          ) {
            best = val
          }
        }
      }
    }
    if (best && best.trim().length > 15) {
      return best.trim()
    }
  } catch (e) {}

  // Method 4: Submission Result Code Viewer (<pre> / <code>)
  const preCode = document.querySelector('pre code, .submission-detail pre, [class*="submission-code"]')
  if (preCode && preCode.textContent && preCode.textContent.trim().length > 15) {
    return preCode.textContent.trim()
  }

  // Method 5: Monaco editor DOM lines
  const lines = document.querySelectorAll('.monaco-editor .view-line, .view-lines .view-line')
  if (lines && lines.length > 0) {
    const text = Array.from(lines)
      .map((l) => l.textContent)
      .join('\n')
    if (text.trim().length > 15) return text.trim()
  }

  // Method 6: CodeMirror DOM lines
  const cmLines = document.querySelectorAll('.cm-content .cm-line, .CodeMirror-line')
  if (cmLines && cmLines.length > 0) {
    const text = Array.from(cmLines)
      .map((l) => l.textContent)
      .join('\n')
    if (text.trim().length > 15) return text.trim()
  }

  // Method 7: Textarea fallback
  const textarea = document.querySelector('textarea.monaco-mouse-cursor-text, .cm-editor textarea')
  if (textarea && textarea.value && textarea.value.trim().length > 15) return textarea.value.trim()

  return ''
}

async function handleLeetCodeSubmissionAccepted(slug, title, runtime, memory) {
  // Retry extraction up to 5 times (1.5s total) to give injected.js & network bridge time to settle
  let code = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    code = extractLeetCodeCode()
    if (code && code.trim().length > 15) break
    window.dispatchEvent(new CustomEvent('DSA_TRACKER_REQUEST_CODE'))
    await new Promise((res) => setTimeout(res, 300))
  }

  const payload = {
    platform: 'LeetCode',
    problemSlug: slug,
    problemTitle: title,
    code: code || '',
    runtime,
    memory,
    beatsPercentile: runtime,
  }

  console.log('[DSA Tracker] Sending LeetCode Accepted payload:', payload)

  chrome.runtime.sendMessage({ type: 'CODE_SUBMITTED', payload }, (res) => {
    if (res && res.success) {
      showInPageNotification(title, 'Synced to DSA Tracker cloud!', true)
    } else {
      showInPageNotification('Sync Warning', res?.error || 'Check extension settings', false)
    }
  })

  // Reset lock after 8 seconds
  setTimeout(() => {
    hasProcessedSubmission = false
  }, 8000)
}

function checkLeetCodeSubmission() {
  const isLeetCode = window.location.hostname.includes('leetcode.com')
  if (!isLeetCode) return

  // Check for submission result modal / banner
  const resultElem =
    document.querySelector('[data-e2e-locator="submission-result"]') ||
    document.querySelector('.text-green-s') ||
    document.querySelector('span[data-state="success"]')

  if (resultElem && resultElem.textContent.includes('Accepted')) {
    if (hasProcessedSubmission) return
    hasProcessedSubmission = true

    // Extract details
    const slug = window.location.pathname.split('/')[2] || ''
    const title =
      document.querySelector('[data-cy="question-title"]')?.textContent ||
      document.title.replace(' - LeetCode', '').trim()

    // Runtime and memory
    const runtimeElem = document.querySelector('[data-e2e-locator="submission-runtime"]')
    const memoryElem = document.querySelector('[data-e2e-locator="submission-memory"]')

    const runtime = runtimeElem ? runtimeElem.textContent.trim() : 'Accepted'
    const memory = memoryElem ? memoryElem.textContent.trim() : ''

    handleLeetCodeSubmissionAccepted(slug, title, runtime, memory)
  }
}

// -------------------------------------------------------------
// 2. GEEKSFORGEEKS CAPTURE ENGINE
// -------------------------------------------------------------
async function handleGFGSubmissionAccepted(slug, title) {
  let code = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const bridge = document.getElementById('__dsa_tracker_code_bridge__')
    if (bridge && bridge.value && bridge.value.trim().length > 10) {
      code = bridge.value.trim()
      break
    }
    const aceLines = document.querySelectorAll('.ace_line')
    if (aceLines.length > 0) {
      code = Array.from(aceLines).map((l) => l.textContent).join('\n')
      if (code.trim().length > 10) break
    }
    window.dispatchEvent(new CustomEvent('DSA_TRACKER_REQUEST_CODE'))
    await new Promise((res) => setTimeout(res, 300))
  }

  const payload = {
    platform: 'GeeksForGeeks',
    problemSlug: slug,
    problemTitle: title,
    code: code || '',
    runtime: 'Solved',
    memory: '',
  }

  console.log('[DSA Tracker] GFG Accepted detected!', payload)

  chrome.runtime.sendMessage({ type: 'CODE_SUBMITTED', payload }, (res) => {
    if (res && res.success) {
      showInPageNotification(title, 'Synced to DSA Tracker cloud!', true)
    }
  })

  setTimeout(() => {
    hasProcessedSubmission = false
  }, 8000)
}

function checkGFGSubmission() {
  const isGFG = window.location.hostname.includes('geeksforgeeks.org')
  if (!isGFG) return

  // Check for successful submission element
  const successModal =
    document.querySelector('.problem-solved-modal') ||
    Array.from(document.querySelectorAll('div, span, h3')).find((el) =>
      el.textContent.includes('Problem Solved Successfully')
    )

  if (successModal) {
    if (hasProcessedSubmission) return
    hasProcessedSubmission = true

    const slug = window.location.pathname.split('/')[2] || ''
    const title = document.querySelector('.problem-tab__name')?.textContent || slug

    handleGFGSubmissionAccepted(slug, title)
  }
}

// Observe DOM mutations for dynamic SPA submission popups
const observer = new MutationObserver(() => {
  checkLeetCodeSubmission()
  checkGFGSubmission()
})

observer.observe(document.body, { childList: true, subtree: true })
