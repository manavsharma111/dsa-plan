import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectSolved,
  selectRevision,
  selectMastery,
  recordRevision,
  setRevisionModalProblem,
  showToastNotification,
  autoSaveToCloud,
  REVISION_STAGES_INFO,
} from '../store/progressSlice'
import { patternsData } from '../data/patternsData'

export default function SpacedRevisionSection() {
  const dispatch = useDispatch()
  const solved = useSelector(selectSolved)
  const revision = useSelector(selectRevision)
  const mastery = useSelector(selectMastery)

  // Map all problems by id for instant lookup
  const problemMap = {}
  patternsData.forEach((pat) => {
    pat.problems.forEach((p) => {
      problemMap[p.id] = { ...p, patternTitle: pat.title }
    })
  })

  const now = Date.now()
  const dueProblems = []
  const upcomingProblems = []
  const graduatedProblems = []

  Object.keys(solved).forEach((id) => {
    const prob = problemMap[id]
    if (!prob) return
    const rev = revision[id] || { stage: 1, nextDue: now }
    const currentMastery = mastery[id] || 'independent'

    const item = {
      ...prob,
      stage: rev.stage || 1,
      count: rev.count || 1,
      lastRevised: rev.lastRevised,
      nextDue: rev.nextDue,
      currentMastery,
    }

    if (rev.stage >= 5 && rev.nextDue > now) {
      graduatedProblems.push(item)
    } else if (rev.nextDue <= now) {
      dueProblems.push(item)
    } else {
      upcomingProblems.push(item)
    }
  })

  // Sort due problems: earliest due first
  dueProblems.sort((a, b) => a.nextDue - b.nextDue)
  upcomingProblems.sort((a, b) => a.nextDue - b.nextDue)

  const handleOpenChecklist = (prob) => {
    dispatch(setRevisionModalProblem(prob))
  }

  const handleQuickEfficientRevise = (prob) => {
    dispatch(recordRevision({ id: prob.id, outcome: 'efficient' }))
    dispatch(autoSaveToCloud())
    dispatch(
      showToastNotification(
        `🎉 "${prob.name}" revised! Marked efficient: next review in 7–14 days.`
      )
    )
  }

  const getStageBadge = (stage) => {
    switch (stage) {
      case 1:
        return (
          <span className="font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Day 1 Recall
          </span>
        )
      case 2:
        return (
          <span className="font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            Day 3 Pattern
          </span>
        )
      case 3:
        return (
          <span className="font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
            Day 7 Code
          </span>
        )
      case 4:
        return (
          <span className="font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
            Day 14 Timed
          </span>
        )
      case 5:
      default:
        return (
          <span className="font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Day 28 Mastered
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 my-6">
      {/* Hero Header Card */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-paper-border/60 pb-5 mb-5">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-core font-semibold flex items-center gap-2 mb-1">
              <span>Scientific Retention System</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-paper-text">
              Spaced Repetition Schedule
            </h2>
            <p className="text-paper-dim text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Solve once, retain forever. Automated intervals at <b>Day 1, 3, 7, 14, and 28</b>{' '}
              ensure questions transition from short-term memory to permanent interview mastery.
            </p>
          </div>

          <div className="flex gap-3 sm:gap-4 flex-wrap">
            <div className="bg-paper-surface-2 border border-paper-border rounded-xl px-4 py-2.5 text-center min-w-[90px]">
              <div className="font-mono text-xl sm:text-2xl font-bold text-core">
                {dueProblems.length}
              </div>
              <div className="font-mono text-[10px] text-paper-faint uppercase">Due Today</div>
            </div>
            <div className="bg-paper-surface-2 border border-paper-border rounded-xl px-4 py-2.5 text-center min-w-[90px]">
              <div className="font-mono text-xl sm:text-2xl font-bold text-blue">
                {upcomingProblems.length}
              </div>
              <div className="font-mono text-[10px] text-paper-faint uppercase">Upcoming</div>
            </div>
            <div className="bg-paper-surface-2 border border-paper-border rounded-xl px-4 py-2.5 text-center min-w-[90px]">
              <div className="font-mono text-xl sm:text-2xl font-bold text-sage">
                {graduatedProblems.length}
              </div>
              <div className="font-mono text-[10px] text-paper-faint uppercase">
                Day 28 Mastered
              </div>
            </div>
          </div>
        </div>

        {/* 5-Stage Interval Roadmap */}
        <div className="font-mono text-xs uppercase tracking-wider font-bold text-paper-text mb-2.5">
          1. Question Kitne Din Baad Dobara Karna Hai?
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/50 flex flex-col justify-between gap-1">
            <div>
              <span className="font-mono text-[11px] font-bold text-amber-900 block">
                Day 1 &middot; Revision 1
              </span>
              <span className="font-serif font-medium text-xs text-paper-text block mt-0.5">
                Bina solution dekhe solve
              </span>
            </div>
            <span className="text-paper-dim text-[11px] leading-snug">
              Approach aur code khud recall karne ki koshish karo.
            </span>
          </div>

          <div className="p-3 rounded-xl border border-blue-200/80 bg-blue-50/50 flex flex-col justify-between gap-1">
            <div>
              <span className="font-mono text-[11px] font-bold text-blue-900 block">
                Day 3 &middot; Revision 2
              </span>
              <span className="font-serif font-medium text-xs text-paper-text block mt-0.5">
                Pattern recall karo
              </span>
            </div>
            <span className="text-paper-dim text-[11px] leading-snug">
              Pehchaano ki optimized approach nikaal pa rahe ho ya nahi.
            </span>
          </div>

          <div className="p-3 rounded-xl border border-purple-200/80 bg-purple-50/50 flex flex-col justify-between gap-1">
            <div>
              <span className="font-mono text-[11px] font-bold text-purple-900 block">
                Day 7 &middot; Revision 3
              </span>
              <span className="font-serif font-medium text-xs text-paper-text block mt-0.5">
                Independent coding
              </span>
            </div>
            <span className="text-paper-dim text-[11px] leading-snug">
              Edge cases, correctness aur time/space complexity check karo.
            </span>
          </div>

          <div className="p-3 rounded-xl border border-orange-200/80 bg-orange-50/50 flex flex-col justify-between gap-1">
            <div>
              <span className="font-mono text-[11px] font-bold text-orange-900 block">
                Day 14 &middot; Revision 4
              </span>
              <span className="font-serif font-medium text-xs text-paper-text block mt-0.5">
                Interview-style attempt
              </span>
            </div>
            <span className="text-paper-dim text-[11px] leading-snug">
              Bina hints ke time limit ke andar fluently solve karo.
            </span>
          </div>

          <div className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 flex flex-col justify-between gap-1">
            <div>
              <span className="font-mono text-[11px] font-bold text-emerald-900 block">
                Day 28 &middot; Revision 5
              </span>
              <span className="font-serif font-medium text-xs text-paper-text block mt-0.5">
                Long-term retention
              </span>
            </div>
            <span className="text-paper-dim text-[11px] leading-snug">
              Agar easily solve ho jaata hai, toh ise ⚡ Mastered mark karo.
            </span>
          </div>
        </div>
      </div>

      {/* Due Today Queue */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 font-serif text-lg sm:text-xl font-semibold text-paper-text">
            <span>🔥 Due For Revision Today</span>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold bg-core text-white">
              {dueProblems.length}
            </span>
          </div>
          <span className="font-mono text-xs text-paper-dim">
            Har problem par 5-point checklist ya 1-click outcome select karo
          </span>
        </div>

        {dueProblems.length === 0 ? (
          <div className="text-center py-10 px-4 bg-paper-surface-2 rounded-xl border border-paper-border/60">
            <span className="text-3xl block mb-2">🎉</span>
            <h4 className="font-serif text-base font-semibold text-paper-text">
              All caught up for today!
            </h4>
            <p className="text-xs text-paper-dim mt-1 max-w-md mx-auto">
              No questions are due right now. Keep solving questions from the pattern list below,
              and they will automatically be scheduled here according to the spaced retention curve!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dueProblems.map((prob) => (
              <div
                key={prob.id}
                className="bg-paper-surface border border-core/30 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-3 transition-all hover:border-core"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-paper-faint tracking-wider block mb-0.5">
                      {prob.patternTitle}
                    </span>
                    <h4 className="font-serif font-medium text-sm sm:text-base text-paper-text">
                      {prob.name}
                    </h4>
                  </div>
                  {getStageBadge(prob.stage)}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-paper-border/50 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {prob.lc && (
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-600 hover:text-white transition-all inline-flex items-center gap-1"
                      >
                        <span>{prob.lc}</span>
                        <span className="text-[9px]">↗</span>
                      </a>
                    )}
                    <span className="font-mono text-[10px] text-paper-dim">Rev #{prob.count}</span>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Checklist & Adaptive Modal Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenChecklist(prob)}
                      className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-paper-surface-2 hover:bg-paper-border/60 text-paper-text border border-paper-border transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>📝 0/5 Checklist</span>
                    </button>

                    {/* Quick Efficient Revise Button */}
                    <button
                      type="button"
                      onClick={() => handleQuickEfficientRevise(prob)}
                      className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>⚡ Solved Solo (+7d)</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Adaptive Rules & 5-Point Revision Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Adaptive Rules Table */}
        <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-serif text-base sm:text-lg font-semibold text-paper-text">
                2. Agar Question Solve Nahi Hota Toh?
              </h3>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                Adaptive Rules
              </span>
            </div>
            <p className="text-xs text-paper-dim mb-3">
              Performance ke hisaab se intervals badlo taaki weak concepts solid ban sakein:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-paper-border text-paper-faint font-mono text-[11px]">
                    <th className="py-2 pr-3 font-semibold">Attempt Ka Result</th>
                    <th className="py-2 font-semibold">Agla Revision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-border/50 text-paper-text font-sans">
                  <tr>
                    <td className="py-2.5 pr-3 font-medium flex items-center gap-1.5 text-emerald-800">
                      <span>⚡ Bina help ke efficiently solve</span>
                    </td>
                    <td className="py-2.5 font-mono text-emerald-700 font-semibold">7 din baad</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-medium text-blue-800">
                      ⏱️ Solve hua, lekin kaafi time laga
                    </td>
                    <td className="py-2.5 font-mono text-blue-700 font-semibold">2–3 din baad</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-medium text-amber-800">💡 Hint dekhna pada</td>
                    <td className="py-2.5 font-mono text-amber-700 font-semibold">Agle din</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-medium text-orange-800">
                      📖 Solution dekhkar samjha
                    </td>
                    <td className="py-2.5 font-mono text-orange-700 font-semibold">
                      1 din baad dobara
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-medium text-rose-800">
                      ⚠️ Same mistake baar-baar
                    </td>
                    <td className="py-2.5 font-mono text-rose-700 font-semibold">
                      Agle din, phir 3 din baad
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-paper-surface-2 border border-paper-border text-paper-dim text-[11.5px] leading-relaxed">
            <strong className="text-paper-text">Important:</strong> Solution dekhne ke turant baad
            code copy karke likhna revision nahi hai. Thoda gap do aur phir khud implement karo.
          </div>
        </div>

        {/* 5-Point Checklist Guide */}
        <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-serif text-base sm:text-lg font-semibold text-paper-text">
                3. Revision Mein Exactly Kya Karna Hai?
              </h3>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                0/5 Checklist
              </span>
            </div>
            <p className="text-xs text-paper-dim mb-3">
              Har baar poora solution ratne ki zarurat nahi hai. Yeh 5 core steps follow karo:
            </p>

            <ul className="space-y-2 text-xs text-paper-text">
              <li className="p-2.5 rounded-xl bg-paper-surface-2/60 border border-paper-border flex items-start gap-2.5">
                <span className="font-mono font-bold text-core text-[12px] mt-0.5">1.</span>
                <div>
                  <strong className="block text-paper-text">
                    Question ka pattern identify karna
                  </strong>
                  <span className="text-paper-dim text-[11px]">
                    Bina topic label dekhe pehchaano: Two Pointers, Sliding Window, Top K, etc.
                  </span>
                </div>
              </li>
              <li className="p-2.5 rounded-xl bg-paper-surface-2/60 border border-paper-border flex items-start gap-2.5">
                <span className="font-mono font-bold text-core text-[12px] mt-0.5">2.</span>
                <div>
                  <strong className="block text-paper-text">
                    Brute force approach explain karna
                  </strong>
                  <span className="text-paper-dim text-[11px]">
                    Naive solution aur uski limitation (O(N^2), extra space) verbally bolo.
                  </span>
                </div>
              </li>
              <li className="p-2.5 rounded-xl bg-paper-surface-2/60 border border-paper-border flex items-start gap-2.5">
                <span className="font-mono font-bold text-core text-[12px] mt-0.5">3.</span>
                <div>
                  <strong className="block text-paper-text">
                    Optimized approach aur uska logic batana
                  </strong>
                  <span className="text-paper-dim text-[11px]">
                    Core invariant, data structure choice (Heap, Monotonic Stack), and algorithm.
                  </span>
                </div>
              </li>
              <li className="p-2.5 rounded-xl bg-paper-surface-2/60 border border-paper-border flex items-start gap-2.5">
                <span className="font-mono font-bold text-core text-[12px] mt-0.5">4.</span>
                <div>
                  <strong className="block text-paper-text">Bina solution dekhe code likhna</strong>
                  <span className="text-paper-dim text-[11px]">
                    Clean, readable code bina kisi reference ke direct code karo.
                  </span>
                </div>
              </li>
              <li className="p-2.5 rounded-xl bg-paper-surface-2/60 border border-paper-border flex items-start gap-2.5">
                <span className="font-mono font-bold text-core text-[12px] mt-0.5">5.</span>
                <div>
                  <strong className="block text-paper-text">
                    Time/space complexity aur edge cases batana
                  </strong>
                  <span className="text-paper-dim text-[11px]">
                    Big-O analysis aur corner cases (empty input, negatives, duplicates).
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Practical Strategy Card for 260 Questions */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2 font-serif text-lg font-semibold text-paper-text">
          <span>🎯 4. 260 Questions Ke Liye Practical Strategy</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
          <div className="p-3.5 rounded-xl bg-paper-surface-2 border border-paper-border flex flex-col justify-between gap-1">
            <span className="font-mono font-bold text-core uppercase text-[11px]">Daily Habit</span>
            <span className="font-serif font-medium text-paper-text text-sm">
              2–3 Purane Questions
            </span>
            <p className="text-paper-dim text-[11.5px] leading-snug">
              Apne schedule ke hisaab se 2–3 purane questions revise karo aur naye solve karo.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-paper-surface-2 border border-paper-border flex flex-col justify-between gap-1">
            <span className="font-mono font-bold text-blue uppercase text-[11px]">
              Weekly Review
            </span>
            <span className="font-serif font-medium text-paper-text text-sm">
              Weak & Hint Questions
            </span>
            <p className="text-paper-dim text-[11.5px] leading-snug">
              Jo questions galat hue ya hints dekh kar solve hue, unhe dobara independently attempt
              karo.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-paper-surface-2 border border-paper-border flex flex-col justify-between gap-1">
            <span className="font-mono font-bold text-purple uppercase text-[11px]">
              Monthly Test
            </span>
            <span className="font-serif font-medium text-paper-text text-sm">
              Blind Pattern Test
            </span>
            <p className="text-paper-dim text-[11.5px] leading-snug">
              Har major pattern se random questions bina topic label dekhe solve karo (Mock
              Interview se).
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-sage-bg/30 border border-sage/40 text-paper-text text-xs leading-relaxed">
          <strong>Key Philosophy:</strong> Ek question ko 5 baar solve kar lena sufficient nahi hai
          agar tum sirf uska code yaad kar rahe ho. Goal yeh hai ki question dekhte hi approach
          samajh aaye, lekin code khud likhna pade.
        </div>
      </div>

      {/* Upcoming Revisions Queue */}
      {upcomingProblems.length > 0 && (
        <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-serif text-lg font-semibold text-paper-text flex items-center gap-2">
              <span>📅 Upcoming Revisions ({upcomingProblems.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {upcomingProblems.slice(0, 9).map((prob) => {
              const diffHours = Math.round((prob.nextDue - now) / (1000 * 60 * 60))
              const diffDays = Math.ceil(diffHours / 24)
              return (
                <div
                  key={prob.id}
                  onClick={() => handleOpenChecklist(prob)}
                  className="bg-paper-surface-2 border border-paper-border hover:border-paper-border/80 rounded-xl p-3 flex flex-col justify-between gap-2 cursor-pointer transition-all"
                >
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-paper-faint mb-1">
                      <span className="truncate max-w-[130px]">{prob.patternTitle}</span>
                      <span className="text-blue font-semibold">in {diffDays}d</span>
                    </div>
                    <span className="text-xs font-medium text-paper-text line-clamp-1">
                      {prob.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono pt-1.5 border-t border-paper-border/40">
                    <span className="text-paper-dim">Stage {prob.stage} of 5</span>
                    {prob.lc && <span className="text-orange-700 font-semibold">{prob.lc}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
