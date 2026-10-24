import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectInterviewHistory,
  selectSelectedInterviewDetailId,
  setSelectedInterviewDetailId,
  deleteInterviewRecord,
  clearInterviewHistory,
  setInterviewModalOpen,
  setRevisionModalProblem,
  showToastNotification,
} from '../store/progressSlice'

export default function InterviewAnalysisSection() {
  const dispatch = useDispatch()
  const history = useSelector(selectInterviewHistory)
  const selectedId = useSelector(selectSelectedInterviewDetailId)

  const selectedInterview = history.find((h) => h.id === selectedId)

  // Overall statistics
  const totalInterviews = history.length
  let totalProblemsAttempted = 0
  let totalProblemsSolved = 0
  let totalSecondsSpent = 0

  history.forEach((h) => {
    totalProblemsAttempted += h.totalProblems || 0
    totalProblemsSolved += h.solvedProblems || 0
    totalSecondsSpent += h.timeTakenSeconds || 0
  })

  const overallSolveRate =
    totalProblemsAttempted > 0
      ? Math.round((totalProblemsSolved / totalProblemsAttempted) * 100)
      : 0
  const avgMinutesPerInterview =
    totalInterviews > 0 ? Math.round(totalSecondsSpent / (totalInterviews * 60)) : 0

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60)
    const remSecs = sec % 60
    return `${mins}m ${remSecs}s`
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recent'
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this interview record?')) {
      dispatch(deleteInterviewRecord(id))
      dispatch(showToastNotification('Interview record removed'))
    }
  }

  const handleOpenProblemChecklist = (prob) => {
    dispatch(setRevisionModalProblem(prob))
  }

  // ----------------------------------------------------
  // VIEW MODE B: Detailed Particular Interview Breakdown
  // ----------------------------------------------------
  if (selectedInterview) {
    const {
      title,
      startedAt,
      completedAt,
      durationMinutes,
      timeTakenSeconds,
      totalProblems,
      solvedProblems,
      scorePercent,
      problems = [],
      notes,
    } = selectedInterview

    const isAllSolved = solvedProblems === totalProblems && totalProblems > 0
    const isHalfOrMore = scorePercent >= 50

    return (
      <div className="space-y-6 my-6 animate-fadeIn">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => dispatch(setSelectedInterviewDetailId(null))}
            className="font-mono text-xs sm:text-sm font-semibold text-core hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <span>← Back to All Interviews</span>
          </button>

          <span className="font-mono text-xs text-paper-dim">
            Session ID: #{selectedInterview.id.toString().slice(-6)}
          </span>
        </div>

        {/* Detailed Header Card */}
        <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-paper-border/60 pb-5 mb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-core/10 text-core border border-core/20">
                  Interview Deep Dive
                </span>
                <span className="font-mono text-xs text-paper-faint">
                  {formatDate(completedAt || startedAt)}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-paper-text">{title}</h2>
            </div>

            {/* Score Pill */}
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2.5 rounded-xl border text-center ${
                  isAllSolved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : isHalfOrMore
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="font-mono text-2xl font-bold">
                  {solvedProblems} / {totalProblems}
                </div>
                <div className="font-mono text-[10.5px] font-semibold uppercase">
                  {scorePercent}% Solved
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-paper-surface-2 border border-paper-border">
              <span className="font-mono text-paper-faint text-[10.5px] uppercase block">
                Time Allotted
              </span>
              <span className="font-mono font-bold text-base text-paper-text">
                {durationMinutes} mins
              </span>
            </div>

            <div className="p-3 rounded-xl bg-paper-surface-2 border border-paper-border">
              <span className="font-mono text-paper-faint text-[10.5px] uppercase block">
                Time Taken
              </span>
              <span className="font-mono font-bold text-base text-core">
                {formatSeconds(timeTakenSeconds)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-paper-surface-2 border border-paper-border">
              <span className="font-mono text-paper-faint text-[10.5px] uppercase block">
                Pacing Avg
              </span>
              <span className="font-mono font-bold text-base text-blue">
                {totalProblems > 0 ? Math.round(timeTakenSeconds / 60 / totalProblems) : 0} m/prob
              </span>
            </div>

            <div className="p-3 rounded-xl bg-paper-surface-2 border border-paper-border">
              <span className="font-mono text-paper-faint text-[10.5px] uppercase block">
                Result Status
              </span>
              <span
                className={`font-mono font-bold text-base ${
                  isAllSolved
                    ? 'text-emerald-700'
                    : isHalfOrMore
                      ? 'text-blue-700'
                      : 'text-amber-700'
                }`}
              >
                {isAllSolved ? 'Pass 🎉' : isHalfOrMore ? 'Partial Pass' : 'Needs Review'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Performance Analysis & Verdict */}
        <div
          className={`p-5 rounded-2xl border ${
            isAllSolved
              ? 'bg-emerald-50/60 border-emerald-300/80 text-emerald-950'
              : isHalfOrMore
                ? 'bg-blue-50/60 border-blue-300/80 text-blue-950'
                : 'bg-amber-50/60 border-amber-300/80 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2 font-serif font-bold text-base sm:text-lg mb-1">
            <span>
              {isAllSolved
                ? '🌟 Outstanding Loop Execution!'
                : isHalfOrMore
                  ? '👍 Strong Screening Round!'
                  : '⚠️ Speed & Retention Gap Detected!'}
            </span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed opacity-90">
            {isAllSolved
              ? 'Aapne time limit ke andar saare questions independently solve kar liye. Code aur approach ka speed kaafi accha hai. Next time Hard rounds ya shorter timer (20m/question) attempt karein!'
              : isHalfOrMore
                ? 'Aapne majority questions time par nikaal liye! Jin questions mein time laga ya solve nahi ho paye, unke core pattern aur edge-cases ko revise karein.'
                : 'Time pressure mein recall karne mein dikkat aayi. Pehle un patterns ko Spaced Revision (1, 3, 7, 28 din) se solid karein, phir is format ko re-attempt karein!'}
          </p>
        </div>

        {/* Question-by-Question Deep Dive */}
        <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="font-serif text-lg font-semibold text-paper-text mb-4">
            Question-by-Question Breakdown
          </h3>

          <div className="space-y-3">
            {problems.map((prob, idx) => {
              const isSolved = prob.solved
              return (
                <div
                  key={prob.id || idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSolved
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-rose-50/30 border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5 ${
                        isSolved ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isSolved ? '✓' : '✕'}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-mono text-[10px] uppercase text-paper-faint">
                          Q{idx + 1} &middot; {prob.patternTitle}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            prob.difficulty === 'E'
                              ? 'text-sage bg-sage-bg'
                              : prob.difficulty === 'H'
                                ? 'text-core bg-core-bg'
                                : 'text-gold bg-gold-bg'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            isSolved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isSolved ? 'Solved Under Timer' : 'Unsolved / Timed Out'}
                        </span>
                      </div>

                      <h4 className="font-serif text-sm sm:text-base font-medium text-paper-text">
                        {prob.name}
                      </h4>
                    </div>
                  </div>

                  {/* Actions for this problem */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {prob.lc && (
                      <a
                        href={prob.url || `https://leetcode.com/problems/${prob.slug || ''}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-600 hover:text-white transition-all inline-flex items-center gap-1"
                      >
                        <span>{prob.lc}</span>
                        <span className="text-[10px]">↗</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenProblemChecklist(prob)}
                      className="font-mono text-xs font-semibold px-3 py-1 rounded-lg bg-paper-surface-2 hover:bg-paper-border/60 text-paper-text border border-paper-border transition-all cursor-pointer"
                    >
                      📝 Revise Checklist
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scratchpad Notes Archive */}
        {notes && (
          <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-paper-text mb-2">
              Interview Scratchpad (Notes & Approach Drafted During Round):
            </h3>
            <pre className="font-mono text-xs p-4 rounded-xl bg-paper-surface-2 border border-paper-border text-paper-text whitespace-pre-wrap leading-relaxed">
              {notes}
            </pre>
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------------------
  // VIEW MODE A: All Interviews List & Stats Dashboard
  // ----------------------------------------------------
  return (
    <div className="space-y-6 my-6 animate-fadeIn">
      {/* Header Card */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-paper-border/60 pb-5 mb-5">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-core font-semibold flex items-center gap-2 mb-1">
              <span>Performance Analytics</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-paper-text">
              Mock Interview Analysis & History
            </h2>
            <p className="text-paper-dim text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Track your speed and accuracy under real interview pressure. Har diye gaye interview
              par click karke uski deep breakdown, time metrics, aur scratchpad notes dekhein.
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatch(setInterviewModalOpen(true))}
            className="font-mono text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-core to-[#ea580c] hover:opacity-95 text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>⏱️ Start New Interview</span>
          </button>
        </div>

        {/* Global Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-paper-surface-2 border border-paper-border text-center">
            <div className="font-mono text-2xl font-bold text-paper-text">{totalInterviews}</div>
            <div className="font-mono text-[10.5px] text-paper-faint uppercase mt-0.5">
              Interviews Taken
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-paper-surface-2 border border-paper-border text-center">
            <div className="font-mono text-2xl font-bold text-core">{overallSolveRate}%</div>
            <div className="font-mono text-[10.5px] text-paper-faint uppercase mt-0.5">
              Timed Solve Rate
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-paper-surface-2 border border-paper-border text-center">
            <div className="font-mono text-2xl font-bold text-blue">
              {totalProblemsSolved} / {totalProblemsAttempted}
            </div>
            <div className="font-mono text-[10.5px] text-paper-faint uppercase mt-0.5">
              Questions Cleared
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-paper-surface-2 border border-paper-border text-center">
            <div className="font-mono text-2xl font-bold text-sage">{avgMinutesPerInterview}m</div>
            <div className="font-mono text-[10.5px] text-paper-faint uppercase mt-0.5">
              Avg Time / Round
            </div>
          </div>
        </div>
      </div>

      {/* Interviews History List */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="font-serif text-lg font-semibold text-paper-text flex items-center gap-2">
            <span>📋 All Given Interviews ({history.length})</span>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all interview history records?')) {
                  dispatch(clearInterviewHistory())
                  dispatch(showToastNotification('Interview history cleared'))
                }
              }}
              className="font-mono text-xs text-paper-faint hover:text-rose-600 underline cursor-pointer"
            >
              Clear All Records
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 px-4 bg-paper-surface-2 rounded-xl border border-paper-border/60">
            <span className="text-4xl block mb-2">⏱️</span>
            <h4 className="font-serif text-base font-semibold text-paper-text">
              Abhi tak koi mock interview nahi diya hai!
            </h4>
            <p className="text-xs text-paper-dim mt-1 max-w-md mx-auto mb-4">
              Upper diye gaye &ldquo;Start New Interview&rdquo; button par click karke pehla timed
              practice round shuru karein. Har round ki analytics yahan automatically save hogi.
            </p>
            <button
              type="button"
              onClick={() => dispatch(setInterviewModalOpen(true))}
              className="font-mono text-xs font-semibold px-4 py-2 rounded-xl bg-core text-white hover:bg-[#ea580c] transition-all cursor-pointer shadow-sm"
            >
              🚀 Take First Interview
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const isAllSolved =
                item.solvedProblems === item.totalProblems && item.totalProblems > 0
              const isHalfOrMore = item.scorePercent >= 50

              return (
                <div
                  key={item.id}
                  onClick={() => dispatch(setSelectedInterviewDetailId(item.id))}
                  className="bg-paper-surface hover:bg-paper-surface-2/60 border border-paper-border hover:border-paper-border/90 rounded-xl p-4 transition-all shadow-xs cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-serif font-bold text-sm sm:text-base text-paper-text group-hover:text-core transition-colors">
                        {item.title}
                      </span>
                      <span className="font-mono text-[10.5px] text-paper-faint">
                        &middot; {formatDate(item.completedAt || item.startedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-paper-dim flex-wrap">
                      <span className="font-mono text-[11px]">
                        ⏱️ Time: <strong>{formatSeconds(item.timeTakenSeconds)}</strong> /{' '}
                        {item.durationMinutes}m
                      </span>

                      {/* Difficulty Pills Preview */}
                      <div className="flex items-center gap-1">
                        {(item.problems || []).map((p, i) => (
                          <span
                            key={i}
                            className={`font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                              p.difficulty === 'E'
                                ? 'text-sage bg-sage-bg'
                                : p.difficulty === 'H'
                                  ? 'text-core bg-core-bg'
                                  : 'text-gold bg-gold-bg'
                            }`}
                          >
                            {p.difficulty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Score Pill & Action */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span
                      className={`font-mono text-xs font-bold px-3 py-1 rounded-full border ${
                        isAllSolved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isHalfOrMore
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {item.solvedProblems} / {item.totalProblems} Solved ({item.scorePercent}%)
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      title="Delete this record"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-paper-faint hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      🗑️
                    </button>

                    <span className="font-mono text-xs font-semibold text-core group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                      View Analysis ➔
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
