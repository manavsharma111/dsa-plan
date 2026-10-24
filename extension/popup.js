// Popup controller for DSA Tracker Extension

document.addEventListener('DOMContentLoaded', async () => {
  const syncKeyInput = document.getElementById('syncKeyInput')
  const form = document.getElementById('settingsForm')
  const statusText = document.getElementById('statusText')
  const historyBox = document.getElementById('historyBox')
  const historyList = document.getElementById('historyList')

  // Load existing settings
  const config = await chrome.storage.local.get([
    'syncKey',
    'backendUrl',
    'syncHistory',
  ])

  if (config.syncKey) {
    syncKeyInput.value = config.syncKey
  }

  if (config.backendUrl) {
    const radio = document.querySelector(
      `input[name="backendType"][value="${config.backendUrl}"]`
    )
    if (radio) radio.checked = true
  }

  // Render recent submissions history if any
  if (config.syncHistory && config.syncHistory.length > 0) {
    historyBox.style.display = 'block'
    historyList.innerHTML = config.syncHistory
      .slice(0, 4)
      .map(
        (h) => `
        <div class="history-item">
          <span>✓ ${h.title}</span>
          <span style="color: #10b981;">${h.time}</span>
        </div>
      `
      )
      .join('')
  }

  // Handle Save
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const syncKey = syncKeyInput.value.trim()
    const backendUrl = document.querySelector(
      'input[name="backendType"]:checked'
    ).value

    await chrome.storage.local.set({
      syncKey,
      backendUrl,
      autoSyncEnabled: true,
    })

    statusText.textContent = 'Settings Saved! Auto-Sync Active ⚡'
    setTimeout(() => {
      statusText.textContent = 'Ready to auto-capture LeetCode'
    }, 2500)
  })
})
