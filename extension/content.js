// Content script running on LeetCode & GeeksForGeeks

console.log('[DSA Tracker Extension] Content script loaded on', window.location.hostname)

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
  // Method 1: Try reading from DOM Monaco editor view lines
  const lines = document.querySelectorAll('.view-lines .view-line')
  if (lines && lines.length > 0) {
    return Array.from(lines)
      .map((l) => l.textContent)
      .join('\n')
  }

  // Method 2: Try textarea fallback
  const textarea = document.querySelector('textarea.monaco-mouse-cursor-text')
  if (textarea && textarea.value) return textarea.value

  return ''
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

    const code = extractLeetCodeCode()

    // Runtime and memory
    const runtimeElem = document.querySelector('[data-e2e-locator="submission-runtime"]')
    const memoryElem = document.querySelector('[data-e2e-locator="submission-memory"]')

    const runtime = runtimeElem ? runtimeElem.textContent.trim() : 'Accepted'
    const memory = memoryElem ? memoryElem.textContent.trim() : ''

    const payload = {
      platform: 'LeetCode',
      problemSlug: slug,
      problemTitle: title,
      code,
      runtime,
      memory,
      beatsPercentile: runtime,
    }

    console.log('[DSA Tracker] LeetCode Accepted detected!', payload)

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
}

// -------------------------------------------------------------
// 2. GEEKSFORGEEKS CAPTURE ENGINE
// -------------------------------------------------------------
function checkGFGSubmission() {
  const isGFG = window.location.hostname.includes('geeksforgeeks.org')
  if (!isGFG) return

  // Check for successful submission element
  const successModal = document.querySelector('.problem-solved-modal') ||
    Array.from(document.querySelectorAll('div, span, h3')).find((el) =>
      el.textContent.includes('Problem Solved Successfully')
    )

  if (successModal) {
    if (hasProcessedSubmission) return
    hasProcessedSubmission = true

    const slug = window.location.pathname.split('/')[2] || ''
    const title = document.querySelector('.problem-tab__name')?.textContent || slug

    // Extract code
    const aceLines = document.querySelectorAll('.ace_line')
    const code = aceLines.length
      ? Array.from(aceLines).map((l) => l.textContent).join('\n')
      : ''

    const payload = {
      platform: 'GeeksForGeeks',
      problemSlug: slug,
      problemTitle: title,
      code,
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
}

// Observe DOM mutations for dynamic SPA submission popups
const observer = new MutationObserver(() => {
  checkLeetCodeSubmission()
  checkGFGSubmission()
})

observer.observe(document.body, { childList: true, subtree: true })
