import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSolved } from '../store/progressSlice'
import { patternsData } from '../data/patternsData'

export default function PatternBreakdown() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const solvedMap = useSelector(selectSolved)

  // Compute pattern-wise stats
  let masteredCount = 0
  const patternStats = patternsData.map((pattern) => {
    const total = pattern.problems.length
    const done = pattern.problems.filter((p) => solvedMap[p.id]).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    const isCompleted = done === total && total > 0
    if (isCompleted) masteredCount++
    return {
      ...pattern,
      total,
      done,
      pct,
      isCompleted,
    }
  })

  const handleScrollToPattern = (e, id) => {
    e.preventDefault()
    const el = document.getElementById(`pattern-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="bg-paper-surface border border-paper-border rounded-xl -mt-2 mb-6 shadow-sm overflow-hidden transition-all">
      {/* Collapsible Header */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-4 sm:px-5 py-3.5 flex justify-between items-center cursor-pointer select-none bg-paper-surface hover:bg-paper-surface-2 transition-colors"
      >
        <div className="flex items-center gap-2 font-serif text-sm sm:text-base font-semibold text-paper-text">
          <svg
            className="w-4 h-4 text-core"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Pattern-Wise Progress (28 Patterns)</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sage-bg text-sage">
            {masteredCount} / 28 Mastered
          </span>
          <span
            className={`text-xs text-paper-dim transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Grid Content */}
      {!isCollapsed && (
        <div className="px-3 sm:px-4 pb-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {patternStats.map((pat) => (
              <a
                key={pat.id}
                href={`#pattern-${pat.id}`}
                onClick={(e) => handleScrollToPattern(e, pat.id)}
                className={`p-2.5 rounded-lg border text-inherit transition-all flex flex-col gap-1.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm ${
                  pat.isCompleted
                    ? 'bg-sage-bg border-sage/30 hover:border-sage'
                    : 'bg-paper-surface-2 border-paper-border hover:border-core'
                }`}
              >
                <div className="flex justify-between items-baseline gap-1.5">
                  <span
                    className="text-xs font-semibold text-paper-text truncate flex-1"
                    title={pat.title}
                  >
                    {pat.title}
                  </span>
                  <span className="font-mono text-[10.5px] text-paper-dim whitespace-nowrap">
                    {pat.done}/{pat.total} ({pat.pct}%)
                  </span>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full h-1 bg-paper-border/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pat.isCompleted ? 'bg-sage' : 'bg-gradient-to-r from-core to-emerald-600'
                    }`}
                    style={{ width: `${pat.pct}%` }}
                  ></div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
