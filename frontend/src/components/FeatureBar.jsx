import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectActiveTab,
  setActiveTab,
  setInterviewModalOpen,
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

  return (
    <div className="bg-paper-surface border border-paper-border rounded-2xl p-2 my-5 shadow-sm flex items-center justify-between gap-2 flex-wrap">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => dispatch(setActiveTab('all'))}
          className={`font-mono text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-paper-text text-paper-bg shadow-sm'
              : 'text-paper-dim hover:text-paper-text hover:bg-paper-surface-2'
          }`}
        >
          <span>📑 All 28 Patterns</span>
        </button>

        <button
          type="button"
          onClick={() => dispatch(setActiveTab('revision'))}
          className={`font-mono text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'revision'
              ? 'bg-paper-text text-paper-bg shadow-sm'
              : 'text-paper-dim hover:text-paper-text hover:bg-paper-surface-2'
          }`}
        >
          <span>🔁 Spaced Revision</span>
          {dueCount > 0 ? (
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-core text-white animate-pulse">
              {dueCount} due
            </span>
          ) : (
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-sage-bg text-sage">
              0,1,3,7,14,28d
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => dispatch(setActiveTab('analytics'))}
          className={`font-mono text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-paper-text text-paper-bg shadow-sm'
              : 'text-paper-dim hover:text-paper-text hover:bg-paper-surface-2'
          }`}
        >
          <span>📊 Weak Patterns</span>
          {hintCount > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">
              {hintCount} hints
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => dispatch(setActiveTab('interviews'))}
          className={`font-mono text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'interviews'
              ? 'bg-paper-text text-paper-bg shadow-sm'
              : 'text-paper-dim hover:text-paper-text hover:bg-paper-surface-2'
          }`}
        >
          <span>🎯 Interview Analysis</span>
          {interviewHistory.length > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-blue-100 text-blue-800">
              {interviewHistory.length}
            </span>
          )}
        </button>
      </div>

      {/* Interview Mode Trigger */}
      <button
        type="button"
        onClick={() => dispatch(setInterviewModalOpen(true))}
        className="font-mono text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-core to-[#ea580c] hover:opacity-95 text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer ml-auto"
      >
        <span>⏱️ Mock Interview</span>
        <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider hidden sm:inline">
          Timed
        </span>
      </button>
    </div>
  )
}
