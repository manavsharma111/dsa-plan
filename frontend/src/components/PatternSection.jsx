import React from 'react'
import { useSelector } from 'react-redux'
import { selectSolved } from '../store/progressSlice'
import ProblemItem from './ProblemItem'

export default function PatternSection({ pattern }) {
  const solvedMap = useSelector(selectSolved)

  const total = pattern.problems.length
  const done = pattern.problems.filter((p) => solvedMap[p.id]).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const isCompleted = done === total && total > 0

  return (
    <section id={`pattern-${pattern.id}`} className="mt-8 sm:mt-10 scroll-mt-14 pattern-section-lazy">
      {/* Pattern Header */}
      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
        <h2 className="font-serif font-semibold text-xl sm:text-2xl text-paper-text tracking-tight">
          {pattern.title}
        </h2>

        {/* Per-Pattern Progress Badge */}
        <div className="ml-auto inline-flex items-center gap-2 bg-paper-surface border border-paper-border px-2.5 py-1 rounded-full font-mono text-xs text-paper-dim shadow-xs">
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
