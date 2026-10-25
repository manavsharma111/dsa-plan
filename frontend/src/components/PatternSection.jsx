import React, { memo, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectSolved,
  clearPatternProgress,
  showToastNotification,
  autoSaveToCloud,
} from '../store/progressSlice'
import ProblemItem from './ProblemItem'

function PatternSection({ pattern }) {
  const dispatch = useDispatch()
  const solvedMap = useSelector(selectSolved)

  const total = pattern.problems.length
  const done = useMemo(() => {
    return pattern.problems.filter(
      (p) => solvedMap[p.id] || (p.slug && solvedMap[p.slug])
    ).length
  }, [pattern.problems, solvedMap])
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const isCompleted = done === total && total > 0

  const handleClearPattern = () => {
    if (done === 0) return
    dispatch(clearPatternProgress(pattern.problems))
    dispatch(autoSaveToCloud())
    dispatch(showToastNotification(`Cleared ${done} check(s) in ${pattern.title}`, 'info'))
  }

  return (
    <section id={`pattern-${pattern.id}`} className="mt-8 sm:mt-10 scroll-mt-14 pattern-section-lazy">
      {/* Pattern Header */}
      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
        <h2 className="font-serif font-semibold text-xl sm:text-2xl text-paper-text tracking-tight">
          {pattern.title}
        </h2>

        {/* Per-Pattern Progress Badge & Controls */}
        <div className="ml-auto inline-flex items-center gap-2 flex-wrap">
          {/* Clear Topic Checkboxes Button */}
          <button
            type="button"
            onClick={handleClearPattern}
            disabled={done === 0}
            className={`font-mono text-xs px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 border shadow-2xs ${
              done > 0
                ? 'text-paper-dim hover:text-rose-600 border-paper-border hover:border-rose-300/80 bg-paper-surface hover:bg-rose-50/50 cursor-pointer active:scale-95 group'
                : 'text-paper-dim/40 border-paper-border/50 bg-paper-surface/50 cursor-not-allowed opacity-50'
            }`}
            title={
              done > 0
                ? `Clear all ${done} checked problem(s) in ${pattern.title}`
                : `No checked problems to clear in ${pattern.title}`
            }
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${done > 0 ? 'group-hover:rotate-[-45deg]' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Clear checks</span>
            {done > 0 && (
              <span className="text-[10.5px] font-mono font-bold leading-none px-1.5 py-0.5 min-w-[18px] text-center rounded-full bg-rose-100 text-rose-700 border border-rose-200/80 group-hover:bg-rose-200 group-hover:text-rose-800 transition-colors">
                {done}
              </span>
            )}
          </button>

          {/* Per-Pattern Progress Badge */}
          <div className="inline-flex items-center gap-2 bg-paper-surface border border-paper-border px-2.5 py-1 rounded-full font-mono text-xs text-paper-dim shadow-xs">
            <span>
              <b className="text-paper-text">{done}</b> / {total} solved
            </span>

            {/* Mini Track */}
            <div className="w-14 h-1.5 bg-paper-surface-2 rounded-full overflow-hidden border border-paper-border/60">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-sage' : 'bg-gradient-to-r from-core to-emerald-600'
                }`}
                style={{ width: `${pct}%` }}
              ></div>
            </div>

            <span className="font-semibold text-[11px] text-paper-dim w-7 text-right">{pct}%</span>

            {isCompleted && (
              <span className="font-mono text-[10px] font-bold text-sage bg-sage-bg px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                ✓ Done
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Idea / Technique Hint */}
      {pattern.idea && (
        <p className="text-paper-dim text-xs sm:text-sm mb-3 italic">{pattern.idea}</p>
      )}

      {/* Problems Grid List */}
      <ul className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-2 gap-2">
        {pattern.problems.map((problem) => (
          <ProblemItem key={problem.id} problem={problem} />
        ))}
      </ul>
    </section>
  )
}

export default memo(PatternSection)

