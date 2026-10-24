import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectInterviewHistory,
  selectSelectedInterviewDetailId,
  setSelectedInterviewDetailId,
  deleteInterviewRecord,
  clearInterviewHistory,
  setInterviewModalOpen,
  setRevisionModalProblem,
  selectRevision,
  showToastNotification,
} from '../store/progressSlice'

export default function InterviewAnalysisSection() {
  const dispatch = useDispatch()
  const history = useSelector(selectInterviewHistory)
  const selectedId = useSelector(selectSelectedInterviewDetailId)
  const revision = useSelector(selectRevision)

  // Local UI filters
  const [listFilter, setListFilter] = useState('all') // 'all' | 'perfect' | 'partial' | 'needs_work'
  const [detailQuestionTab, setDetailQuestionTab] = useState('all') // 'all' | 'solved' | 'left'
  const [expandedCardId, setExpandedCardId] = useState(null) // Quick breakdown in main list
  const [expandedCodeProblemId, setExpandedCodeProblemId] = useState(null) // Code preview in detail view

  const selectedInterview = history.find((h) => h.id === selectedId)

  // Overall summary statistics
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

  // Filtered interviews for the main list
  const filteredHistory = useMemo(() => {
    if (listFilter === 'perfect') {
      return history.filter((h) => h.solvedProblems === h.totalProblems && h.totalProblems > 0)
    }
    if (listFilter === 'partial') {
      return history.filter(
        (h) => h.solvedProblems > 0 && h.solvedProblems < h.totalProblems
      )
    }
    if (listFilter === 'needs_work') {
      return history.filter((h) => h.solvedProblems === 0 && h.totalProblems > 0)
    }
    return history
  }, [history, listFilter])

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
      totalProblems = 0,
      solvedProblems = 0,
      scorePercent = 0,
      problems = [],
      notes,
    } = selectedInterview

    const isAllSolved = solvedProblems === totalProblems && totalProblems > 0
    const isHalfOrMore = scorePercent >= 50

    // Separate attempted vs left questions
    const solvedQuestions = problems.filter((p) => p.solved)
    const leftQuestions = problems.filter((p) => !p.solved)

    // Filter displayed questions based on active tab
    const displayedQuestions =
      detailQuestionTab === 'solved'
        ? solvedQuestions
        : detailQuestionTab === 'left'
          ? leftQuestions
          : problems

    return (
      <div className="space-y-6 my-6 animate-fadeIn">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => {
              dispatch(setSelectedInterviewDetailId(null))
              setDetailQuestionTab('all')
            }}
            className="font-mono text-xs sm:text-sm font-semibold text-core hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <span>← Back to All Interviews</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-paper-dim">
              Session ID: #{selectedInterview.id.toString().slice(-6)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                handleDelete(e, selectedInterview.id)
                dispatch(setSelectedInterviewDetailId(null))
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-mono px-2 py-0.5 rounded border border-rose-200 hover:bg-rose-50 cursor-pointer"
            >
              Delete Record
            </button>
          </div>
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
              ? 'All problems solved independently within the allotted time! Execution speed and code fluency were exceptional. Challenge yourself next with Hard rounds or tighter timers (20m/problem)!'
              : isHalfOrMore
                ? 'Strong performance! You cleared the majority of problems on schedule. Review the underlying patterns and tricky edge cases for any questions that lagged or went unsolved.'
                : 'Time pressure impacted recall. Strengthen these patterns using Spaced Revision (1, 3, 7, 28 days), then re-attempt this format with confidence!'}
          </p>

          {/* Quick Attempt Summary Box */}
          <div className="mt-3 pt-3 border-t border-black/10 flex items-center gap-4 text-xs font-mono flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span>✓ Attempted & Solved:</span>
              <span className="bg-emerald-100 px-2 py-0.5 rounded-full">
                {solvedQuestions.length}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-800 font-bold">
              <span>✕ Left / Skipped:</span>
              <span className="bg-rose-100 px-2 py-0.5 rounded-full">
                {leftQuestions.length}
              </span>
            </span>
          </div>
        </div>

        {/* Diagnostic Insights: Attempted vs Left Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Solved Insights */}
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-emerald-900 border-b border-emerald-200 pb-1.5">
              <span>🎯 Attempted & Cleared ({solvedQuestions.length})</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                Cleared
              </span>
            </div>
            {solvedQuestions.length > 0 ? (
              <ul className="space-y-1 text-xs text-emerald-950">
                {solvedQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      ✓ <strong>{q.name}</strong> ({q.patternTitle})
                    </span>
                    <span className="font-mono text-[10px] px-1 rounded bg-emerald-200 font-semibold flex-shrink-0">
                      {q.difficulty}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-800/80 italic">
                No problems were fully solved this round. Target Easy questions first in the next round to build momentum!
              </p>
            )}
          </div>

          {/* Left / Skipped Insights */}
          <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/40 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-rose-900 border-b border-rose-200 pb-1.5">
              <span>⚠️ Left in Round / Skipped ({leftQuestions.length})</span>
              <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-bold">
                Action Items
              </span>
            </div>
            {leftQuestions.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-rose-950">
                {leftQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      ✕ <strong>{q.name}</strong> ({q.patternTitle})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenProblemChecklist(q)}
                      className="font-mono text-[10px] text-core underline hover:text-orange-700 cursor-pointer flex-shrink-0"
                    >
                      Solve Now ➔
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-800 font-medium">
                🎉 Flawless! Not a single problem was left behind—all questions cleared within the time limit!
              </p>
            )}
          </div>
        </div>

        {/* Question-by-Question Deep Dive with Filter Tabs */}
        <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h3 className="font-serif text-lg font-semibold text-paper-text">
              Question-by-Question Detailed Analysis
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-paper-surface-2 p-1 rounded-xl border border-paper-border text-xs font-mono">
              <button
                type="button"
                onClick={() => setDetailQuestionTab('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  detailQuestionTab === 'all'
                    ? 'bg-paper-surface text-paper-text font-bold shadow-2xs'
                    : 'text-paper-dim hover:text-paper-text'
                }`}
              >
                All ({problems.length})
              </button>
              <button
                type="button"
                onClick={() => setDetailQuestionTab('solved')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  detailQuestionTab === 'solved'
                    ? 'bg-emerald-100 text-emerald-900 font-bold shadow-2xs'
                    : 'text-paper-dim hover:text-paper-text'
                }`}
              >
                ✓ Solved ({solvedQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setDetailQuestionTab('left')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  detailQuestionTab === 'left'
                    ? 'bg-rose-100 text-rose-900 font-bold shadow-2xs'
                    : 'text-paper-dim hover:text-paper-text'
                }`}
              >
                ✕ Left ({leftQuestions.length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {displayedQuestions.map((prob, idx) => {
              const isSolved = prob.solved
              const rev = revision[prob.id]
              const hasSavedCode = !!rev?.codeSnippet
              const isCodeExpanded = expandedCodeProblemId === prob.id

              return (
                <div
                  key={prob.id || idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                    isSolved
                      ? 'bg-emerald-50/30 border-emerald-300'
                      : 'bg-rose-50/30 border-rose-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5 ${
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
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSolved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {isSolved ? '✓ Attempted & Solved' : '⚠️ Left in Round / Timed Out'}
                          </span>

                          {rev?.aiReview?.score && (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                              ⭐ AI Review: {rev.aiReview.score}/10
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-sm sm:text-base font-bold text-paper-text">
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
                          className="font-mono text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-600 hover:text-white transition-all inline-flex items-center gap-1"
                        >
                          <span>{prob.lc}</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenProblemChecklist(prob)}
                        className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-paper-surface hover:bg-paper-surface-2 text-paper-text border border-paper-border transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>📝 {isSolved ? 'Review Checklist' : 'Solve & Revise'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenProblemChecklist(prob)}
                        className="font-mono text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>🤖 AI Review</span>
                      </button>
                    </div>
                  </div>

                  {/* Saved Solution & AI Feedback Drawer (if exists) */}
                  {hasSavedCode && (
                    <div className="pt-2 border-t border-paper-border/60">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCodeProblemId(isCodeExpanded ? null : prob.id)
                          }
                          className="font-mono text-[11px] text-core hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>{isCodeExpanded ? '▲ Hide Saved Solution' : '▼ View Saved Solution'}</span>
                        </button>

                        {rev?.aiReview?.optimalityTag && (
                          <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                            {rev.aiReview.optimalityTag}
                          </span>
                        )}
                      </div>

                      {isCodeExpanded && (
                        <div className="mt-2 space-y-2">
                          <pre className="p-3 rounded-lg bg-paper-surface border border-paper-border font-mono text-[11px] text-paper-text overflow-x-auto max-h-48 custom-scrollbar">
                            <code>{rev.codeSnippet}</code>
                          </pre>
                          {rev?.notes && (
                            <div className="text-[11px] text-paper-dim italic bg-paper-surface-2 p-2 rounded border border-paper-border">
                              💡 <strong>Key Takeaway:</strong> {rev.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
              ke andar kiye gaye questions, chhoote hue questions, aur unka complete analysis dekhein.
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

      {/* Interviews History List Card */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="font-serif text-lg font-semibold text-paper-text flex items-center gap-2">
            <span>📋 All Given Interviews ({history.length})</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Chips */}
            {history.length > 0 && (
              <div className="flex items-center gap-1 bg-paper-surface-2 p-1 rounded-xl border border-paper-border text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setListFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    listFilter === 'all'
                      ? 'bg-paper-surface text-paper-text font-bold shadow-2xs'
                      : 'text-paper-dim hover:text-paper-text'
                  }`}
                >
                  All ({history.length})
                </button>
                <button
                  type="button"
                  onClick={() => setListFilter('perfect')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    listFilter === 'perfect'
                      ? 'bg-emerald-100 text-emerald-900 font-bold shadow-2xs'
                      : 'text-paper-dim hover:text-paper-text'
                  }`}
                >
                  🌟 100% Cleared
                </button>
                <button
                  type="button"
                  onClick={() => setListFilter('partial')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    listFilter === 'partial'
                      ? 'bg-blue-100 text-blue-900 font-bold shadow-2xs'
                      : 'text-paper-dim hover:text-paper-text'
                  }`}
                >
                  ⚡ Partial
                </button>
                <button
                  type="button"
                  onClick={() => setListFilter('needs_work')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    listFilter === 'needs_work'
                      ? 'bg-rose-100 text-rose-900 font-bold shadow-2xs'
                      : 'text-paper-dim hover:text-paper-text'
                  }`}
                >
                  ⚠️ Incomplete
                </button>
              </div>
            )}

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
                Clear All
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 px-4 bg-paper-surface-2 rounded-xl border border-paper-border/60">
            <span className="text-4xl block mb-2">⏱️</span>
            <h4 className="font-serif text-base font-semibold text-paper-text">
              No mock interviews completed yet!
            </h4>
            <p className="text-xs text-paper-dim mt-1 max-w-md mx-auto mb-4">
              Click the &ldquo;Start New Interview&rdquo; button above to launch your first timed
              screening round. Attempted problems, solutions, and skipped questions will
              automatically be saved and analyzed here.
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
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const isAllSolved =
                item.solvedProblems === item.totalProblems && item.totalProblems > 0
              const isHalfOrMore = item.scorePercent >= 50
              const solvedList = (item.problems || []).filter((p) => p.solved)
              const leftList = (item.problems || []).filter((p) => !p.solved)
              const isExpanded = expandedCardId === item.id

              return (
                <div
                  key={item.id}
                  className="bg-paper-surface hover:bg-paper-surface-2/40 border border-paper-border hover:border-paper-border/90 rounded-2xl p-4 sm:p-5 transition-all shadow-xs flex flex-col gap-3 group"
                >
                  {/* Top Bar: Title, Date, Score Pill, Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-serif font-bold text-base sm:text-lg text-paper-text group-hover:text-core transition-colors">
                          {item.title}
                        </span>
                        <span className="font-mono text-[10.5px] text-paper-faint">
                          &middot; {formatDate(item.completedAt || item.startedAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-paper-dim flex-wrap font-mono">
                        <span>
                          ⏱️ Time Taken: <strong>{formatSeconds(item.timeTakenSeconds)}</strong> /{' '}
                          {item.durationMinutes}m
                        </span>
                        <span>&middot;</span>
                        <span>
                          Avg Pace:{' '}
                          <strong>
                            {item.totalProblems > 0
                              ? Math.round(item.timeTakenSeconds / 60 / item.totalProblems)
                              : 0}{' '}
                            m/prob
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Score Pill & View Action */}
                    <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
                      <span
                        className={`font-mono text-xs font-bold px-3 py-1 rounded-full border ${
                          isAllSolved
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isHalfOrMore
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
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

                      <button
                        type="button"
                        onClick={() => dispatch(setSelectedInterviewDetailId(item.id))}
                        className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-core text-white hover:bg-[#ea580c] transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                      >
                        <span>Deep Analysis</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>

                  {/* Question Chips Preview: Attempted vs Left */}
                  <div className="pt-2 border-t border-paper-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Attempted Questions Chips */}
                      {solvedList.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10.5px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Done ({solvedList.length}):
                          </span>
                          {solvedList.map((p, i) => (
                            <span
                              key={i}
                              className="font-mono text-[10.5px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Left Questions Chips */}
                      {leftList.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10.5px] font-bold text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded-full border border-rose-200">
                            ✕ Left ({leftList.length}):
                          </span>
                          {leftList.map((p, i) => (
                            <span
                              key={i}
                              className="font-mono text-[10.5px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-900 border border-rose-200 font-medium"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Expand Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                      className="font-mono text-[11px] text-core hover:underline cursor-pointer flex-shrink-0 self-end sm:self-auto"
                    >
                      {isExpanded ? '▲ Hide Questions' : '▼ Quick Summary'}
                    </button>
                  </div>

                  {/* Inline Expanded Question Summary Drawer */}
                  {isExpanded && (
                    <div className="mt-2 p-3 rounded-xl bg-paper-surface-2 border border-paper-border space-y-2 animate-fadeIn">
                      <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-paper-dim flex items-center justify-between">
                        <span>All Questions in this Round ({item.problems?.length || 0}):</span>
                        <span className="text-[10px] lowercase font-normal">
                          Click any question to open checklist
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {(item.problems || []).map((prob, pIdx) => {
                          const isSolvedProb = prob.solved
                          return (
                            <div
                              key={pIdx}
                              className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-xs ${
                                isSolvedProb
                                  ? 'bg-emerald-50/70 border-emerald-200'
                                  : 'bg-rose-50/70 border-rose-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                    isSolvedProb
                                      ? 'bg-emerald-200 text-emerald-900'
                                      : 'bg-rose-200 text-rose-900'
                                  }`}
                                >
                                  {isSolvedProb ? '✓ Solved' : '✕ Left'}
                                </span>
                                <span className="font-medium text-paper-text truncate">
                                  {prob.name}
                                </span>
                                <span className="font-mono text-[10px] text-paper-dim hidden sm:inline">
                                  ({prob.patternTitle})
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
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

                                <button
                                  type="button"
                                  onClick={() => handleOpenProblemChecklist(prob)}
                                  className="font-mono text-[10.5px] px-2 py-0.5 rounded border border-paper-border bg-paper-surface hover:bg-paper-surface-2 text-core cursor-pointer font-semibold"
                                >
                                  {isSolvedProb ? 'Checklist' : 'Solve'}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
