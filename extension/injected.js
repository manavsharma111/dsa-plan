// Injected script running in the webpage's MAIN world context
// Has direct native access to window.monaco (LeetCode) and window.ace (GeeksForGeeks)

(function () {
  function syncCodeToBridge() {
    let fullCode = ''

    // 1. Extract from Monaco Editor (LeetCode)
    try {
      if (window.monaco && window.monaco.editor) {
        const models = window.monaco.editor.getModels()
        if (models && models.length > 0) {
          let bestModel = models[0]
          let maxLen = 0
          for (const m of models) {
            const val = m.getValue() || ''
            // Pick the model with largest content (the actual solution code)
            if (val.length > maxLen) {
              maxLen = val.length
              bestModel = m
            }
          }
          if (bestModel) {
            fullCode = bestModel.getValue()
          }
        }
      }
    } catch (e) {}

    // 2. Extract from Ace Editor (GeeksForGeeks)
    if (!fullCode) {
      try {
        const aceElem = document.querySelector('.ace_editor')
        if (aceElem && window.ace) {
          const editor = window.ace.edit(aceElem)
          if (editor) fullCode = editor.getValue()
        }
      } catch (e) {}
    }

    if (fullCode) {
      let bridge = document.getElementById('__dsa_tracker_code_bridge__')
      if (!bridge) {
        bridge = document.createElement('textarea')
        bridge.id = '__dsa_tracker_code_bridge__'
        bridge.style.display = 'none'
        bridge.setAttribute('data-dsa-bridge', 'true')
        ;(document.body || document.documentElement).appendChild(bridge)
      }
      bridge.value = fullCode
    }
  }

  // Answer on-demand request from content.js
  window.addEventListener('DSA_TRACKER_REQUEST_CODE', () => {
    syncCodeToBridge()
    const bridge = document.getElementById('__dsa_tracker_code_bridge__')
    const code = bridge ? bridge.value : ''
    window.dispatchEvent(new CustomEvent('DSA_TRACKER_RESPONSE_CODE', { detail: { code } }))
  })

  // Sync on editor interactions and periodically
  document.addEventListener('keyup', syncCodeToBridge, { passive: true })
  document.addEventListener('click', syncCodeToBridge, { passive: true })
  setInterval(syncCodeToBridge, 1200)

  // Initial sync attempt
  setTimeout(syncCodeToBridge, 1000)
})()
