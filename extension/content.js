// Content script running on LeetCode & GeeksForGeeks

console.log('[DSA Tracker Extension] Content script loaded on', window.location.hostname)

let latestCrossWorldCode = ''

// Listen for cross-world postMessage from injected.js (MAIN world network interception)
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === '__DSA_TRACKER_CODE_SYNC__' && event.data.code) {
    latestCrossWorldCode = event.data.code.trim()
    console.log('[DSA Tracker] Received complete code from MAIN world bridge (Length:', latestCrossWorldCode.length, ')')
  }
})

// Listen for CustomEvent from injected.js
window.addEventListener('DSA_TRACKER_CODE_CAPTURED', (event) => {
  if (event.detail && event.detail.code) {
    latestCrossWorldCode = event.detail.code.trim()
  }
})

window.addEventListener('DSA_TRACKER_RESPONSE_CODE', (event) => {
  if (event.detail && event.detail.code) {
    latestCrossWorldCode = event.detail.code.trim()
  }
})

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
  // Method 1: Cross-world message from injected.js network interceptor (100% full unvirtualized code)
  if (latestCrossWorldCode && latestCrossWorldCode.length > 15) {
    return latestCrossWorldCode
  }

  // Method 2: DOM bridge data-code attribute or textContent (shared DOM tree)
  const bridge = document.getElementById('__dsa_tracker_code_bridge__')
  if (bridge) {
    const attrCode = bridge.getAttribute('data-code')
    if (attrCode && attrCode.trim().length > 15) return attrCode.trim()
    if (bridge.textContent && bridge.textContent.trim().length > 15) return bridge.textContent.trim()
    if (bridge.value && bridge.value.trim().length > 15) return bridge.value.trim()
  }

  // Method 3: Trigger on-demand postMessage and custom event to injected.js
  try {
    window.postMessage({ type: '__DSA_TRACKER_REQUEST_CODE__' }, '*')
    window.dispatchEvent(new CustomEvent('DSA_TRACKER_REQUEST_CODE'))
  } catch (e) {}

  // Method 4: Scan page localStorage and sessionStorage
  try {
    let best = ''
    const storages = [localStorage, sessionStorage]
    for (const stor of storages) {
      if (!stor) continue
      for (let i = 0; i < stor.length; i++) {
        const k = stor.key(i)
        if (
          k &&
          (k.includes('code') ||
            k.includes('solution') ||
            k.includes('_') ||
            /^\d+/.test(k) ||
            k.includes('editor'))
        ) {
          let val = stor.getItem(k)
          if (val && typeof val === 'string') {
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
                val.includes('canJump') ||
                val.includes('function'))
            ) {
              best = val
            }
          }
        }
      }
    }
    if (best && best.trim().length > 15) {
      return best.trim()
    }
  } catch (e) {}

  // Method 5: Submission Result Code Viewer (<pre> / <code>)
  const preCode = document.querySelector('pre code, .submission-detail pre, [class*="submission-code"]')
  if (preCode && preCode.textContent && preCode.textContent.trim().length > 15) {
    return preCode.textContent.trim()
  }

  // Method 6: Monaco editor DOM lines - CRITICAL: SORT BY style.top so lines are in visual order (1, 2, 3...) and NEVER reversed!
  const lines = document.querySelectorAll('.monaco-editor .view-line, .view-lines .view-line')
  if (lines && lines.length > 0) {
    const sorted = Array.from(lines).sort((a, b) => {
      const topA = parseFloat(a.style.top) || a.offsetTop || 0
      const topB = parseFloat(b.style.top) || b.offsetTop || 0
      return topA - topB
    })
    const text = sorted.map((l) => l.textContent).join('\n')
    if (text.trim().length > 15) return text.trim()
  }

  // Method 7: CodeMirror DOM lines
  const cmLines = document.querySelectorAll('.cm-content .cm-line, .CodeMirror-line')
  if (cmLines && cmLines.length > 0) {
    const sorted = Array.from(cmLines).sort((a, b) => {
      const topA = parseFloat(a.style.top) || a.offsetTop || 0
      const topB = parseFloat(b.style.top) || b.offsetTop || 0
      return topA - topB
    })
    const text = sorted.map((l) => l.textContent).join('\n')
    if (text.trim().length > 15) return text.trim()
  }

  // Method 8: Textarea fallback
  const textarea = document.querySelector('textarea.monaco-mouse-cursor-text, .cm-editor textarea')
  if (textarea && textarea.value && textarea.value.trim().length > 15) return textarea.value.trim()

  return ''
}

function isCompleteCode(code) {
  if (!code || typeof code !== 'string') return false
  const trimmed = code.trim()
  if (trimmed.length < 35) return false
  const hasStart =
    /class\s+Solution|struct\s+|#include|def\s+|function\s+|int\s+main|var\s+|public\s+class/i.test(
      trimmed
    )
  const hasEnd = /};\s*$|return\s+.*}\s*$|}\s*$/m.test(trimmed)
  return hasStart && hasEnd
}

async function handleLeetCodeSubmissionAccepted(slug, title, runtime, memory) {
  // Retry extraction up to 6 times (1.8s total) to give injected.js & network bridge time to settle
  let code = ''
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = extractLeetCodeCode()
    if (candidate && candidate.length > code.length) {
      code = candidate
    }
    if (isCompleteCode(code)) break
    window.postMessage({ type: '__DSA_TRACKER_REQUEST_CODE__' }, '*')
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
    if (latestCrossWorldCode && latestCrossWorldCode.length > 10) {
      code = latestCrossWorldCode
      break
    }
    const bridge = document.getElementById('__dsa_tracker_code_bridge__')
    if (bridge) {
      const attrCode = bridge.getAttribute('data-code')
      if (attrCode && attrCode.trim().length > 10) {
        code = attrCode.trim()
        break
      }
    }
    const aceLines = document.querySelectorAll('.ace_line')
    if (aceLines.length > 0) {
      code = Array.from(aceLines).map((l) => l.textContent).join('\n')
      if (code.trim().length > 10) break
    }
    window.postMessage({ type: '__DSA_TRACKER_REQUEST_CODE__' }, '*')
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
