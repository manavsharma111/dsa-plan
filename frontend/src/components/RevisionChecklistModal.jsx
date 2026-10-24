import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectRevisionModalProblem,
  setRevisionModalProblem,
  recordRevision,
  selectRevision,
  selectMastery,
  showToastNotification,
  autoSaveToCloud,
  REVISION_STAGES_INFO,
} from '../store/progressSlice'

const CHECKLIST_ITEMS = [
  {
    id: 'pattern',
    label: 'Question ka pattern identify karna',
    desc: 'Identify core pattern without seeing tags',
  },
  {
    id: 'brute',
    label: 'Brute force approach explain karna',
    desc: 'Explain naive approach & why it is suboptimal',
  },
  {
    id: 'optimized',
    label: 'Optimized approach aur uska logic batana',
    desc: 'Core intuition, invariant, and algorithm',
  },
  {
    id: 'code',
    label: 'Bina solution dekhe code likhna',
    desc: 'Implement clean code from memory',
  },
  {
    id: 'edge_cases',
    label: 'Time/space complexity aur edge cases batana',
    desc: 'Corner cases, empty inputs, big-O analysis',
  },
]

export default function RevisionChecklistModal() {
  const dispatch = useDispatch()
  const problem = useSelector(selectRevisionModalProblem)
  const revision = useSelector(selectRevision)
  const mastery = useSelector(selectMastery)

  const [checkedItems, setCheckedItems] = useState({})

  useEffect(() => {
    // Reset checklist when opened with new problem
    setCheckedItems({})
  }, [problem?.id])

  if (!problem) return null

  const revData = revision[problem.id] || { stage: 1, count: 0 }
  const currentMastery = mastery[problem.id] || 'independent'
  const currentStageInfo =
    REVISION_STAGES_INFO.find((s) => s.stage === revData.stage) || REVISION_STAGES_INFO[0]

  const checkedCount = Object.values(checkedItems).filter(Boolean).length

  const handleToggleCheck = (id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleSelectOutcome = (outcome, outcomeTitle, nextDaysText) => {
    dispatch(recordRevision({ id: problem.id, outcome }))
    dispatch(autoSaveToCloud())
    dispatch(
      showToastNotification(
        `🎉 "${problem.name}" revision saved! ${outcomeTitle} ➔ Agla revision: ${nextDaysText}.`
      )
    )
    dispatch(setRevisionModalProblem(null))
  }

  const handleClose = () => {
    dispatch(setRevisionModalProblem(null))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-paper-surface border-2 border-paper-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-paper-border/80 bg-paper-surface-2 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-core/10 text-core border border-core/20">
                Spaced Revision Checklist
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-paper-border/60 text-paper-dim">
                {currentStageInfo.title}
              </span>
              {currentMastery === 'mastered' ? (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  ⚡ Mastered
                </span>
              ) : currentMastery === 'hint' ? (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  💡 Hint Needed
                </span>
              ) : (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  🧠 Solved Solo
                </span>
              )}
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-bold text-paper-text leading-snug">
              {problem.name}
            </h3>

            <div className="flex items-center gap-2 text-xs text-paper-dim mt-1 flex-wrap">
              {problem.patternTitle && (
                <span className="font-medium text-paper-text/80">{problem.patternTitle}</span>
              )}
              {problem.difficulty && (
                <span className="font-mono font-semibold px-1.5 py-0.2 rounded text-[10px] bg-paper-surface border border-paper-border">
                  {problem.difficulty}
                </span>
              )}
              {problem.lc && (
                <a
                  href={problem.url || `https://leetcode.com/problems/${problem.slug || ''}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] font-semibold text-core hover:underline inline-flex items-center gap-0.5"
                >
                  <span>{problem.lc}</span>
                  <span className="text-[9px]">↗</span>
                </a>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-paper-dim hover:text-paper-text hover:bg-paper-border/50 text-base font-mono cursor-pointer flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Section 1: 5-Point Revision Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-paper-text flex items-center gap-2">
                <span>Revision Checklist</span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    checkedCount === 5
                      ? 'bg-emerald-100 text-emerald-800'
                      : checkedCount >= 3
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-paper-surface-2 text-paper-dim border border-paper-border'
                  }`}
                >
                  {checkedCount}/5 Completed
                </span>
              </div>
              <span className="text-[11px] text-paper-faint hidden sm:inline">
                Har step ko recall & verify karo
              </span>
            </div>

            <div className="space-y-2 bg-paper-surface-2/60 border border-paper-border rounded-xl p-3">
              {CHECKLIST_ITEMS.map((item, idx) => {
                const isChecked = !!checkedItems[item.id]
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors select-none ${
                      isChecked ? 'bg-sage-bg/30 text-paper-text' : 'hover:bg-paper-surface'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCheck(item.id)}
                      className="mt-0.5 w-4 h-4 accent-sage cursor-pointer rounded"
                    />
                    <div className="flex-1 min-w-0 leading-tight">
                      <div
                        className={`text-xs sm:text-sm font-medium ${
                          isChecked ? 'line-through text-paper-dim font-normal' : 'text-paper-text'
                        }`}
                      >
                        <span className="font-mono text-paper-faint mr-1.5">{idx + 1}.</span>
                        {item.label}
                      </div>
                      <div className="text-[11px] text-paper-faint mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Section 2: Adaptive Outcome Selector */}
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-paper-text mb-1">
              Attempt Ka Result Chunein (Schedule Agla Revision)
            </div>
            <p className="text-paper-faint text-[11.5px] mb-3">
              Intervals aapki memory aur performance ke hisaab se dynamically adjust honge:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Efficient Solve */}
              <button
                type="button"
                onClick={() =>
                  handleSelectOutcome(
                    'efficient',
                    'Bina help ke efficiently solve',
                    '7–14 din baad'
                  )
                }
                className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <span>⚡ Bina help ke solve</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      +7 din baad
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 mt-1">
                    Approach clear thi, bina kisi hint ke optimal solve kiya.
                  </p>
                </div>
              </button>

              {/* Option 2: Slow Solve */}
              <button
                type="button"
                onClick={() =>
                  handleSelectOutcome('slow', 'Solve hua, lekin time laga', '2–3 din baad')
                }
                className="p-3 rounded-xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-left transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <span>⏱️ Time kaafi laga</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                      +3 din baad
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800/80 mt-1">
                    Solve toh ho gaya, par recall karne mein waqt laga. Speed improve karni hai.
                  </p>
                </div>
              </button>

              {/* Option 3: Hint Needed */}
              <button
                type="button"
                onClick={() => handleSelectOutcome('hint', 'Hint dekhna pada', 'Agle din (+1d)')}
                className="p-3 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-left transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <span>💡 Hint dekhna pada</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Agle din
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 mt-1">
                    Kuch hint ya idea check karna pada. Kal bina hint ke attempt karo.
                  </p>
                </div>
              </button>

              {/* Option 4: Solution Walkthrough */}
              <button
                type="button"
                onClick={() =>
                  handleSelectOutcome('solution', 'Solution dekhkar samjha', '1 din baad dobara')
                }
                className="p-3 rounded-xl border border-orange-300 bg-orange-50/70 hover:bg-orange-100 text-left transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-orange-900 flex items-center gap-1.5">
                      <span>📖 Solution dekhkar samjha</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-200 text-orange-900">
                      1 din baad
                    </span>
                  </div>
                  <p className="text-[11px] text-orange-800/80 mt-1">
                    Direct solution dekha. Thoda gap dekar kal independently solve karo.
                  </p>
                </div>
              </button>

              {/* Option 5: Repeat Mistake */}
              <button
                type="button"
                onClick={() =>
                  handleSelectOutcome(
                    'repeat_mistake',
                    'Same mistake baar-baar',
                    'Agle din + 3 din baad'
                  )
                }
                className="p-3 rounded-xl border border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-left transition-all cursor-pointer group sm:col-span-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <span>⚠️ Same mistake baar-baar hui</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                    Agle din + Stage Reset
                  </span>
                </div>
                <p className="text-[11px] text-rose-800/80 mt-1">
                  Same pitfall repeat hua. Interval reset: kal pehle samjho, phir 3 din baad re-test
                  karo.
                </p>
              </button>
            </div>
          </div>

          {/* Golden Rule Note */}
          <div className="p-3 rounded-xl bg-paper-surface-2 border border-paper-border text-paper-dim text-xs leading-relaxed">
            <strong className="text-paper-text">💡 Important Rule:</strong> Solution dekhne ke
            turant baad code copy karke likhna revision nahi hai. Thoda gap do aur phir khud logic
            se implement karo.
          </div>
        </div>
      </div>
    </div>
  )
}
