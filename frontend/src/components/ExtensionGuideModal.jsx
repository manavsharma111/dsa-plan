import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectSyncKey, showToastNotification } from '../store/progressSlice'

export default function ExtensionGuideModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const syncKey = useSelector(selectSyncKey)
  const [copiedField, setCopiedField] = useState('')
  const [activeTab, setActiveTab] = useState('user') // 'user' | 'dev'

  // Lock body scroll and prevent background scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [isOpen])

  if (!isOpen) return null

  const copyToClipboard = (text, fieldName) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(fieldName)
        dispatch(showToastNotification(`📋 Copied: ${fieldName}`))
        setTimeout(() => setCopiedField(''), 2500)
      })
    } else {
      prompt(`Copy this ${fieldName}:`, text)
    }
  }

  const localFolderPath = 'C:\\CORE SUBJECT\\best\\dsa\\extension'
  const chromeUrl = 'chrome://extensions'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-hidden overscroll-contain"
      onClick={onClose}
    >
      <div
        className="bg-paper-surface border-2 border-paper-border rounded-2xl w-full max-w-xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed top */}
        <div className="p-4 sm:p-5 border-b border-paper-border/80 bg-paper-surface-2 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Chrome Extension
                </span>
                <span className="font-mono text-[10px] text-paper-dim">Auto-Sync V3</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-paper-text leading-tight mt-0.5">
                LeetCode & GFG Auto-Sync Setup
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-paper-dim hover:text-paper-text hover:bg-paper-border/50 text-base font-mono cursor-pointer flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher - Fixed */}
        <div className="px-5 pt-2.5 pb-0 bg-paper-surface flex items-center gap-2 border-b border-paper-border/60 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('user')}
            className={`pb-2 px-3 font-mono text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'user'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-paper-dim hover:text-paper-text'
            }`}
          >
            🌐 For Anyone (Downloaded ZIP)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dev')}
            className={`pb-2 px-3 font-mono text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'dev'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-paper-dim hover:text-paper-text'
            }`}
          >
            💻 Local Dev (Folder Path)
          </button>
        </div>

        {/* Modal Body - Single clean scroll area */}
        <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
          {activeTab === 'user' ? (
            <>
              {/* Step 1: Download Extension Zip Card */}
              <div className="p-3.5 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="font-mono text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Download Extension (.ZIP)</span>
                  </div>
                  <p className="text-[11.5px] text-emerald-800/90 mt-0.5">
                    One-click download for PC or Mac. No developer experience needed.
                  </p>
                </div>
                <a
                  href="/dsa-tracker-extension.zip"
                  download="dsa-tracker-extension.zip"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>📥 Download .ZIP</span>
                </a>
              </div>

              {/* Step 2: Unzip */}
              <div className="p-3 rounded-xl border border-paper-border bg-paper-surface-2/60 space-y-1">
                <span className="font-mono text-xs font-bold text-paper-text flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-paper-text text-paper-bg flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Extract (Unzip) the Downloaded File</span>
                </span>
                <p className="text-[11.5px] text-paper-dim">
                  Right-click <code className="font-mono bg-paper-border/60 px-1 py-0.5 rounded text-[11px]">dsa-tracker-extension.zip</code> in your Downloads folder and select <strong>"Extract All"</strong>.
                </p>
              </div>

              {/* Step 3: Chrome Extensions Page */}
              <div className="p-3 rounded-xl border border-paper-border bg-paper-surface-2/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-paper-text flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-paper-text text-paper-bg flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Open Chrome Extensions & Toggle "Developer mode" ON</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(chromeUrl, 'Chrome URL')}
                    className="text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded bg-paper-surface border border-paper-border hover:bg-paper-border text-core cursor-pointer"
                  >
                    {copiedField === 'Chrome URL' ? '✓ Copied' : '📋 Copy URL'}
                  </button>
                </div>
                <div className="p-1.5 rounded bg-paper-surface font-mono text-xs text-paper-text select-all border border-paper-border flex items-center justify-between">
                  <span>chrome://extensions</span>
                  <span className="text-[10px] text-paper-dim font-sans italic">Turn ON "Developer mode" in the top-right corner</span>
                </div>
              </div>

              {/* Step 4: Load Unpacked */}
              <div className="p-3 rounded-xl border border-paper-border bg-paper-surface-2/60 space-y-1">
                <span className="font-mono text-xs font-bold text-paper-text flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-paper-text text-paper-bg flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>Click "Load unpacked" and Select Extracted Folder</span>
                </span>
                <p className="text-[11.5px] text-paper-dim">
                  Click <strong>"Load unpacked"</strong> in the top-left and select the unzipped folder from your Downloads.
                </p>
              </div>

              {/* Step 5: Sync Key */}
              <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                      5
                    </span>
                    <span>Enter Your Personal Sync Key</span>
                  </span>
                  {syncKey && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(syncKey, 'Sync Key')}
                      className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 border border-emerald-300 hover:bg-emerald-300 cursor-pointer"
                    >
                      {copiedField === 'Sync Key' ? '✓ Copied' : '📋 Copy My Sync Key'}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-tight">
                  Click the <strong>⚡ DSA Tracker</strong> icon in your browser toolbar, paste your Sync Key, and click <strong>"Save Settings"</strong>:
                </p>
                <div className="p-1.5 rounded bg-white/90 font-mono text-xs text-emerald-950 border border-emerald-200 flex items-center justify-between">
                  <span>
                    Sync Key: <strong>{syncKey || '(Connect your sync key below first)'}</strong>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold font-sans">Render Live Cloud Connected</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Local Dev View */}
              <div className="p-3.5 rounded-xl border border-paper-border bg-paper-surface-2/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-paper-text flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-paper-text text-paper-bg flex items-center justify-center text-[10px]">
                      💻
                    </span>
                    <span>Local Repository Extension Folder</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(localFolderPath, 'Local Path')}
                    className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-paper-surface border border-paper-border hover:bg-paper-border text-core cursor-pointer"
                  >
                    {copiedField === 'Local Path' ? '✓ Copied' : '📋 Copy Path'}
                  </button>
                </div>
                <p className="text-[11.5px] text-paper-dim">
                  When developing locally on your PC, load this folder directly:
                </p>
                <div className="p-2 rounded bg-paper-surface font-mono text-xs text-paper-text select-all border border-paper-border break-all">
                  {localFolderPath}
                </div>
              </div>

              {/* Production Chrome Web Store Info */}
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 space-y-1.5 text-xs text-blue-950">
                <strong className="font-bold font-mono">🌟 Chrome Web Store (1-Click Install for Everyone):</strong>
                <p className="text-[11.5px] leading-relaxed text-blue-900/90">
                  Publishing to the Google Chrome Web Store requires a one-time <strong>$5 developer fee</strong>. Once published, anyone can install with a single <strong>"Add to Chrome"</strong> click without needing Developer Mode or unzipping files!
                </p>
              </div>
            </>
          )}

          {/* How it auto-captures banner */}
          <div className="p-2.5 rounded-xl bg-paper-surface border border-paper-border flex items-start gap-2 text-xs text-paper-dim leading-relaxed">
            <span className="text-base leading-none">🚀</span>
            <div>
              <strong className="text-paper-text font-semibold">Live Automatic Sync:</strong> Whenever a problem is submitted and accepted on LeetCode or GeeksForGeeks, an on-screen <span className="text-emerald-700 font-bold">"Solved & Auto-Synced"</span> notification will confirm the submission and update your tracker dashboard in real time!
            </div>
          </div>
        </div>

        {/* Footer - Fixed bottom */}
        <div className="p-3.5 sm:p-4 border-t border-paper-border bg-paper-surface-2 flex items-center justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-paper-text text-paper-bg font-mono text-xs font-bold hover:opacity-90 cursor-pointer transition-opacity shadow-xs"
          >
            Got it, Let's Practice! ⚡
          </button>
        </div>
      </div>
    </div>
  )
}

