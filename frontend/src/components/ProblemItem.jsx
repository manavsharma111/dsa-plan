import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectIsSolved,
  toggleProblem,
  setMastery,
  recordRevision,
  setRevisionModalProblem,
  selectProblemMastery,
  selectRevision,
  showToastNotification,
  autoSaveToCloud,
} from '../store/progressSlice'

export default function ProblemItem({ problem }) {
  const dispatch = useDispatch()
  const isSolved = useSelector(selectIsSolved(problem.id))
  const masteryLevel = useSelector(selectProblemMastery(problem.id))
  const revision = useSelector(selectRevision)

  const revData = revision[problem.id]
  const isDueForRevision = isSolved && revData && revData.nextDue && revData.nextDue <= Date.now()

  const handleChange = () => {
    dispatch(toggleProblem(problem.id))
    dispatch(autoSaveToCloud())
  }

  const handleOpenChecklist = (e) => {
    e.stopPropagation()
    dispatch(setRevisionModalProblem(problem))
  }

  const handleCycleMastery = (e) => {
    e.stopPropagation()
    let nextLevel = 'independent'
    if (masteryLevel === 'independent') nextLevel = 'mastered'
    else if (masteryLevel === 'mastered') nextLevel = 'hint'
    else nextLevel = 'independent'

    dispatch(setMastery({ id: problem.id, level: nextLevel }))
    dispatch(autoSaveToCloud())
    dispatch(
      showToastNotification(
        `Status updated: ${
          nextLevel === 'hint'
            ? '💡 Needed Hints'
            : nextLevel === 'mastered'
              ? '⚡ Mastered'
              : '🧠 Solved Solo'
        }`
      )
    )
  }

  // Format next revision date
  const getNextRevDateString = () => {
    if (!revData || !revData.nextDue) return null
    const diffDays = Math.ceil((revData.nextDue - Date.now()) / 86400000)
    if (diffDays <= 0) return 'Due Today'
    if (diffDays === 1) return 'Tomorrow'
    const dateStr = new Date(revData.nextDue).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    return `In ${diffDays}d (${dateStr})`
  }

  // Difficulty badge styling
  const getDifficultyBadge = (df) => {
    switch (df) {
      case 'E':
        return (
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded text-sage bg-sage-bg">
            E
          </span>
        )
      case 'H':
        return (
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded text-core bg-core-bg">
            H
          </span>
        )
      case 'M':
      default:
        return (
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded text-gold bg-gold-bg">
            M
          </span>
        )
    }
  }

  // Tag pill styling
  const getTagPill = (tag, idx) => {
    switch (tag) {
      case 'done':
        return (
          <span
            key={idx}
            className="font-mono text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-sage bg-sage-bg"
          >
            done
          </span>
        )
      case 'Striver':
        return (
          <span
            key={idx}
            className="font-mono text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-blue bg-blue-bg"
          >
            Striver
          </span>
        )
      case 'Babbar':
        return (
          <span
            key={idx}
            className="font-mono text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-gold bg-gold-bg"
          >
            Babbar
          </span>
        )
      case 'Plan':
        return (
          <span
            key={idx}
            className="font-mono text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-core bg-core-bg"
          >
            Plan
          </span>
        )
      default:
        return (
          <span
            key={idx}
            className="font-mono text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-paper-dim bg-paper-surface-2"
          >
            {tag}
          </span>
        )
    }
  }

  return (
    <li
      className={`flex items-center gap-2.5 sm:gap-3 bg-paper-surface border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm transition-all ${
        isSolved
          ? 'border-sage/40 bg-sage-bg/10'
          : 'border-paper-border hover:border-paper-border/80'
      }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        id={problem.id}
        checked={isSolved}
        onChange={handleChange}
        className="w-[18px] h-[18px] sm:w-[19px] sm:h-[19px] accent-sage cursor-pointer flex-shrink-0 rounded"
      />

      {/* Problem Title & Badges */}
      <div className="flex-1 min-w-0 flex items-center flex-wrap gap-x-2 gap-y-1">
        <label
          htmlFor={problem.id}
          className={`cursor-pointer select-none leading-snug break-words ${
            isSolved ? 'line-through text-paper-dim' : 'text-paper-text font-medium'
          }`}
        >
          {problem.name}
        </label>

        {/* LeetCode / GFG Link Badge */}
        {problem.lc && (
          <a
            href={problem.url || `https://leetcode.com/problems/${problem.slug || ''}/`}
            target="_blank"
            rel="noopener noreferrer"
            title={
              problem.platform === 'GFG'
                ? `Open free GeeksforGeeks practice (alternative to ${problem.lc} Premium)`
                : `Open ${problem.lc}: ${problem.name} on LeetCode`
            }
            onClick={(e) => e.stopPropagation()}
            className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded transition-all inline-flex items-center gap-1 shadow-xs ${
              isSolved
                ? 'text-paper-faint bg-paper-surface-2 border border-paper-border/60 hover:text-paper-dim hover:bg-paper-border/40'
                : problem.platform === 'GFG'
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                  : 'text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-600 hover:text-white hover:border-orange-600'
            }`}
          >
            <span>{problem.platform === 'GFG' ? `${problem.lc} · GFG` : problem.lc}</span>
            <span className="text-[9px] opacity-80">↗</span>
          </a>
        )}

        {/* Interactive Mastery Status Pill (Only when solved) */}
        {isSolved && (
          <button
            type="button"
            onClick={handleCycleMastery}
            title={`Mastery: ${masteryLevel}. Click to cycle: 💡 Needed Hints -> 🧠 Solved Independently -> ⚡ Mastered`}
            className={`font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded-full transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs border ${
              masteryLevel === 'hint'
                ? 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100'
                : masteryLevel === 'mastered'
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                  : 'text-blue-800 bg-blue-50 border-blue-300 hover:bg-blue-100'
            }`}
          >
            <span>
              {masteryLevel === 'hint'
                ? '💡 Hint'
                : masteryLevel === 'mastered'
                  ? '⚡ Mastered'
                  : '🧠 Solo'}
            </span>
          </button>
        )}

        {/* Due Spaced Revision Pulsing Badge -> Opens 5-Point Checklist */}
        {isDueForRevision ? (
          <button
            type="button"
            onClick={handleOpenChecklist}
            title="Spaced Revision Due! Click to open 5-point checklist and record attempt outcome"
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-core text-white animate-pulse shadow-xs hover:bg-[#ea580c] transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <span>⏳ Revise Due</span>
            <span className="text-[9px] bg-white/20 px-1 rounded">0/5</span>
          </button>
        ) : (
          isSolved &&
          getNextRevDateString() && (
            <button
              type="button"
              onClick={handleOpenChecklist}
              title={`Next scheduled revision: ${getNextRevDateString()} (Stage ${
                revData?.stage || 1
              }/5). Click to review checklist or log revision.`}
              className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-paper-surface-2 hover:bg-paper-border/50 text-paper-dim border border-paper-border transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>📅 {getNextRevDateString()}</span>
            </button>
          )
        )}
      </div>

      {/* Meta Pills (Difficulty & Source Tags) */}
      <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
        {getDifficultyBadge(problem.difficulty)}
        {problem.tags && problem.tags.map((tag, i) => getTagPill(tag, i))}
      </div>
    </li>
  )
}
