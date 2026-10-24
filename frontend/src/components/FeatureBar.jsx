import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectActiveTab,
  setActiveTab,
  setInterviewModalOpen,
  setExtensionModalOpen,
  selectSolved,
  selectRevision,
  selectMastery,
  selectInterviewHistory,
} from '../store/progressSlice'
import { patternsData } from '../data/patternsData'

export default function FeatureBar() {
  const dispatch = useDispatch()
  const activeTab = useSelector(selectActiveTab)
  const solved = useSelector(selectSolved)
  const revision = useSelector(selectRevision)
  const mastery = useSelector(selectMastery)
  const interviewHistory = useSelector(selectInterviewHistory)

  const containerRef = React.useRef(null)
  const tabRefs = React.useRef({})
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  })

  // Count due revisions today
  const now = Date.now()
  let dueCount = 0
  Object.keys(solved).forEach((id) => {
    const rev = revision[id]
    if (rev && rev.nextDue && rev.nextDue <= now) {
      dueCount++
    }
  })

  // Count weak patterns (patterns with hint count >= 2 or low mastery)
  let hintCount = 0
  Object.keys(mastery).forEach((id) => {
    if (mastery[id] === 'hint') hintCount++
  })

  const updateIndicator = React.useCallback(() => {
    requestAnimationFrame(() => {
      const container = containerRef.current
      const activeBtn = tabRefs.current[activeTab]
      if (!container || !activeBtn) return

      const containerRect = container.getBoundingClientRect()
      const btnRect = activeBtn.getBoundingClientRect()

      setIndicatorStyle({
        left: btnRect.left - containerRect.left,
        top: btnRect.top - containerRect.top,
        width: btnRect.width,
        height: btnRect.height,
        ready: true,
      })
    })
  }, [activeTab])

  React.useEffect(() => {
    updateIndicator()
  }, [updateIndicator, dueCount, hintCount, interviewHistory.length])

  React.useEffect(() => {
    const handleResize = () => updateIndicator()
    window.addEventListener('resize', handleResize)

    let ro
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => updateIndicator())
      ro.observe(containerRef.current)
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateIndicator)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (ro) ro.disconnect()
    }
  }, [updateIndicator])

  const tabs = [
    {
      id: 'all',
      label: 'All 28 Patterns',
      icon: '📑',
    },
    {
      id: 'revision',
      label: 'Spaced Revision',
      icon: '🔁',
      badge:
        dueCount > 0 ? (
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-core text-white animate-pulse">
            {dueCount} due
          </span>
        ) : (
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors duration-250 ${
              activeTab === 'revision'
                ? 'bg-white/20 text-white'
                : 'bg-sage-bg text-sage'
            }`}
          >
            0,1,3,7,14,28d
          </span>
        ),
    },
    {
      id: 'analytics',
      label: 'Weak Patterns',
      icon: '📊',
      badge:
        hintCount > 0 ? (
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors duration-250 ${
              activeTab === 'analytics'
                ? 'bg-amber-400 text-amber-950'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {hintCount} hints
          </span>
        ) : null,
    },
    {
      id: 'interviews',
      label: 'Interview Analysis',
      icon: '🎯',
      badge:
        interviewHistory.length > 0 ? (
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors duration-250 ${
              activeTab === 'interviews'
                ? 'bg-blue-400 text-blue-950'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {interviewHistory.length}
          </span>
        ) : null,
    },
  ]

  return (
    <div className="bg-paper-surface border border-paper-border rounded-2xl p-2 my-5 shadow-sm flex items-center justify-between gap-2 flex-wrap">
      {/* Tabs with Silky Gliding Ease Indicator */}
      <div
        ref={containerRef}
        className="relative flex items-center gap-1.5 flex-wrap"
      >
        {/* Floating Sliding Indicator Pill */}
        <span
          className="absolute top-0 left-0 rounded-xl bg-paper-text shadow-sm pointer-events-none z-0"
          style={{
            transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
            width: `${indicatorStyle.width}px`,
            height: `${indicatorStyle.height}px`,
            opacity: indicatorStyle.ready ? 1 : 0,
            transition: indicatorStyle.ready
              ? 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease'
              : 'none',
            willChange: 'transform, opacity',
          }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current[tab.id] = el
              }}
              type="button"
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={`relative z-10 font-mono text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2 select-none transition-colors duration-250 ${
                isActive
                  ? 'text-paper-bg'
                  : 'text-paper-dim hover:text-paper-text hover:bg-paper-surface-2/60'
              }`}
            >
              <span className="flex items-center gap-2 pointer-events-none">
                <span>
                  {tab.icon} {tab.label}
                </span>
                {tab.badge}
              </span>
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          onClick={() => dispatch(setExtensionModalOpen(true))}
          className="font-mono text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>⚡ Auto-Sync</span>
          <span className="bg-emerald-200 text-emerald-950 text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider hidden sm:inline">
            Extension
          </span>
        </button>

        {/* Interview Mode Trigger */}
        <button
          type="button"
          onClick={() => dispatch(setInterviewModalOpen(true))}
          className="font-mono text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-core to-[#ea580c] hover:opacity-95 text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <span>⏱️ Mock Interview</span>
          <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider hidden sm:inline">
            Timed
          </span>
        </button>
      </div>
    </div>
  )
}
