import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectRevisionModalProblem,
  setRevisionModalProblem,
  recordRevision,
  saveProblemSolution,
  selectRevision,
  selectMastery,
  showToastNotification,
  autoSaveToCloud,
  REVISION_STAGES_INFO,
} from '../store/progressSlice'
import { analyzeSubmittedCode } from '../utils/codeAnalyzer'

const CHECKLIST_ITEMS = [
  {
    id: 'pattern',
    label: 'Identify core problem pattern',
    desc: 'Identify core pattern without seeing tags',
  },
  {
    id: 'brute',
    label: 'Explain brute force approach & limits',
    desc: 'Explain naive approach & why it is suboptimal',
  },
  {
    id: 'optimized',
    label: 'Explain optimal intuition & invariants',
    desc: 'Core intuition, invariant, and algorithm',
  },
  {
    id: 'code',
    label: 'Write clean code without references',
    desc: 'Implement clean code from memory',
  },
  {
    id: 'edge_cases',
    label: 'State complexities & test edge cases',
    desc: 'Corner cases, empty inputs, big-O analysis',
  },
]

const TIME_OPTIONS = [
  { id: '<15m', label: '< 15 min', icon: '⚡', hint: 'Fast / Strong' },
  { id: '15-30m', label: '15–30 min', icon: '⏱️', hint: 'Standard' },
  { id: '30-45m', label: '30–45 min', icon: '⏳', hint: 'Slightly slow' },
  { id: '45m+', label: '45+ min', icon: '🐢', hint: 'Struggled' },
]

const MISTAKE_TAGS = [
  { id: 'edge_case', label: 'Edge Case Missed' },
  { id: 'tle', label: 'TLE / Complexity High' },
  { id: 'off_by_one', label: 'Off-by-One Index' },
  { id: 'pattern_delay', label: 'Pattern Recall Delay' },
  { id: 'base_case', label: 'Base Case Forgot' },
  { id: 'high_space', label: 'Suboptimal Space' },
  { id: 'syntax', label: 'Syntax / API Confusion' },
]

export default function RevisionChecklistModal() {
  const dispatch = useDispatch()
  const problem = useSelector(selectRevisionModalProblem)
  const revision = useSelector(selectRevision)
  const mastery = useSelector(selectMastery)

  const [checkedItems, setCheckedItems] = useState({})
  const [timeSpent, setTimeSpent] = useState('15-30m')
  const [selectedMistakes, setSelectedMistakes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [showCodeBox, setShowCodeBox] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [expandedHistoryIndex, setExpandedHistoryIndex] = useState(null)
  const [aiReviewLoading, setAiReviewLoading] = useState(false)
  const [aiReviewData, setAiReviewData] = useState(null)

  // Initialize modal state on problem change
  useEffect(() => {
    if (!problem?.id) return
    setCheckedItems({})
    setTimeSpent('15-30m')
    setSelectedMistakes([])
    setShowCodeBox(true)
    setShowHistory(false)
    setExpandedHistoryIndex(null)
    setAiReviewLoading(false)

    // Pre-populate note, code, and saved AI review from previous attempt
    // Check by ID, by slug, or by any matching problem with the same slug/name
    const rev =
      revision[problem.id] ||
      (problem.slug && revision[problem.slug]) ||
      (problem.name && revision[problem.name]) ||
      (problem.slug &&
        Object.entries(revision).find(([k, r]) => k === problem.slug || r?.slug === problem.slug || k.includes(problem.slug))?.[1]) ||
      null
    setNoteText(rev?.notes || '')
    setCodeSnippet(rev?.codeSnippet || '')
    setAiReviewData(rev?.aiReview || null)
  }, [problem?.id, problem?.slug])

  // Lock body scroll and prevent background scrolling when modal is open
  useEffect(() => {
    if (!problem) return
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [problem])

  const handleRequestAiReview = async () => {
    if (!codeSnippet.trim()) {
      dispatch(showToastNotification('⚠️ Please paste your solution code first!'))
      return
    }
    setAiReviewLoading(true)
    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: problem.name,
          patternTitle: problem.patternTitle,
          difficulty: problem.difficulty,
          code: codeSnippet,
          language: codeAnalysis?.language || 'Language',
        }),
      })
      const json = await res.json()
      if (json.success && json.review) {
        setAiReviewData(json.review)

        // Auto tick checklist if score is high
        if (json.review.score >= 8.5) {
          setCheckedItems({
            pattern: true,
            brute: true,
            optimized: true,
            code: true,
            edge_cases: json.review.edgeCases?.every((e) => e.status === 'Passed'),
          })
        }

        const tipExcerpt = json.review.interviewerTips ? json.review.interviewerTips.slice(0, 150) : ''
        if (!noteText && tipExcerpt) {
          setNoteText(tipExcerpt)
        }

        // Auto-save solution, analysis, and AI review immediately
        dispatch(
          saveProblemSolution({
            id: problem.id,
            codeSnippet: codeSnippet.trim(),
            codeAnalysis,
            notes: noteText.trim() || tipExcerpt,
            aiReview: json.review,
          })
        )
        dispatch(autoSaveToCloud())
        dispatch(showToastNotification('🤖 AI Review ready & saved with solution!'))
      } else {
        throw new Error(json.error || 'Failed to get AI review')
      }
    } catch (e) {
      dispatch(showToastNotification(`⚠️ AI Review failed: ${e.message}`))
    } finally {
      setAiReviewLoading(false)
    }
  }

  const handleSaveSolutionOnly = () => {
    if (!codeSnippet.trim()) {
      dispatch(showToastNotification('⚠️ Please paste your solution code first!'))
      return
    }
    dispatch(
      saveProblemSolution({
        id: problem.id,
        codeSnippet: codeSnippet.trim(),
        codeAnalysis,
        notes: noteText.trim(),
        aiReview: aiReviewData,
      })
    )
    dispatch(autoSaveToCloud())
    dispatch(showToastNotification('💾 Solution & AI Review successfully saved!'))
  }

  const revData =
    (problem &&
      (revision[problem.id] ||
        (problem.slug && revision[problem.slug]) ||
        (problem.name && revision[problem.name]))) ||
    { stage: 1, count: 0 }
  const currentMastery =
    (problem &&
      (mastery[problem.id] ||
        (problem.slug && mastery[problem.slug]) ||
        (problem.name && mastery[problem.name]))) ||
    'independent'
  const currentStageInfo =
    REVISION_STAGES_INFO.find((s) => s.stage === revData.stage) || REVISION_STAGES_INFO[0]

  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const scorePercent = Math.round((checkedCount / CHECKLIST_ITEMS.length) * 100)

  // Static code analysis (Pattern-Aware) - Unconditional hook call
  const codeAnalysis = useMemo(() => {
    if (!problem) return null
    return analyzeSubmittedCode(codeSnippet, problem.patternTitle)
  }, [codeSnippet, problem?.patternTitle])

  // Smart outcome recommendation - Unconditional hook call
  const recommendedOutcome = useMemo(() => {
    if (checkedCount === 5 && timeSpent !== '45m+' && selectedMistakes.length === 0) {
      return 'efficient'
    }
    if (checkedCount >= 3) {
      return 'slow'
    }
    if (checkedCount >= 1 || selectedMistakes.length > 0) {
      return 'hint'
    }
    return 'solution'
  }, [checkedCount, timeSpent, selectedMistakes])

  // Previous attempts & solutions history - Unconditional hook call
  const historyList = useMemo(() => {
    if (!revData?.history || !Array.isArray(revData.history)) return []
    return [...revData.history].reverse()
  }, [revData?.history])

  if (!problem) return null

  const handleToggleCheck = (id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleToggleMistake = (tagId) => {
    setSelectedMistakes((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  const handleSelectOutcome = (outcome, outcomeTitle, nextDaysText) => {
    dispatch(
      recordRevision({
        id: problem.id,
        outcome,
        checklistCount: checkedCount,
        checklist: checkedItems,
        timeSpent,
        mistakeTags: selectedMistakes,
        notes: noteText.trim(),
        codeSnippet: codeSnippet.trim(),
        codeAnalysis,
        aiReview: aiReviewData,
      })
    )
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-hidden overscroll-contain"
      onClick={handleClose}
    >
      <div
        className="bg-paper-surface border-2 border-paper-border rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-paper-border/80 bg-paper-surface-2 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-core/10 text-core border border-core/25 whitespace-nowrap">
                Spaced Revision Checklist
              </span>
              <span
                className={`font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs whitespace-nowrap flex items-center gap-1 ${
                  {
                    1: 'bg-amber-100 text-amber-900 border-amber-300',
                    2: 'bg-blue-100 text-blue-900 border-blue-300',
                    3: 'bg-purple-100 text-purple-900 border-purple-300',
                    4: 'bg-orange-100 text-orange-900 border-orange-300',
                    5: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  }[currentStageInfo?.stage || 1] || 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                <span>🗓️</span>
                <span>{currentStageInfo.title}</span>
              </span>
              {currentMastery === 'mastered' ? (
                <span className="font-mono text-[10.5px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold whitespace-nowrap shadow-2xs">
                  ⚡ Mastered
                </span>
              ) : currentMastery === 'unverified' ? (
                <span className="font-mono text-[10.5px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 font-bold whitespace-nowrap shadow-2xs" title="Auto-captured from external judge. Solved solo verification occurs during active spaced recall.">
                  🚀 Extension Capture (Unverified)
                </span>
              ) : currentMastery === 'hint' ? (
                <span className="font-mono text-[10.5px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold whitespace-nowrap shadow-2xs">
                  💡 Hint Needed
                </span>
              ) : (
                <span className="font-mono text-[10.5px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-bold whitespace-nowrap shadow-2xs">
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
        <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
          {/* Section 1: Recall Score & Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-paper-text flex items-center gap-2">
                <span>Recall Score</span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    checkedCount === 5
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : checkedCount >= 3
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-paper-surface-2 text-paper-dim border border-paper-border'
                  }`}
                >
                  {checkedCount}/5 ({scorePercent}%)
                </span>
              </div>
              <span className="text-[11px] text-paper-dim">
                {checkedCount === 5
                  ? '🔥 100% Retained!'
                  : checkedCount >= 3
                    ? '⚡ Strong Recall'
                    : '💡 Review Needed'}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-1.5 bg-paper-border rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-300 ${
                  checkedCount === 5
                    ? 'bg-emerald-500'
                    : checkedCount >= 3
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                }`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>

            <div className="space-y-1.5 bg-paper-surface-2/60 border border-paper-border rounded-xl p-3">
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

          {/* Section 2: Time Taken & Mistake Tagging */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Time Taken */}
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-paper-text mb-1.5 flex items-center justify-between">
                <span>Kitna Time Laga?</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {TIME_OPTIONS.map((t) => {
                  const isSelected = timeSpent === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTimeSpent(t.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-core bg-core/10 text-core font-bold shadow-xs'
                          : 'border-paper-border bg-paper-surface hover:bg-paper-surface-2 text-paper-dim'
                      }`}
                    >
                      <span>
                        {t.icon} {t.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mistake Tags */}
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-paper-text mb-1.5">
                Kaha Mistake / Atke?
              </div>
              <div className="flex flex-wrap gap-1">
                {MISTAKE_TAGS.map((tag) => {
                  const isSelected = selectedMistakes.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleMistake(tag.id)}
                      className={`text-[10.5px] font-mono px-2 py-1 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                          : 'bg-paper-surface border-paper-border text-paper-dim hover:bg-paper-surface-2'
                      }`}
                    >
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Section 3: 3rd Party Code Submission & Analysis */}
          <div className="border border-paper-border rounded-xl bg-paper-surface-2/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCodeBox(!showCodeBox)}
              className="w-full p-3 text-left font-mono text-xs font-bold uppercase tracking-wider text-paper-text flex items-center justify-between hover:bg-paper-surface transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <span>📋 Paste LeetCode / GFG Code (Auto Analysis)</span>
                {codeSnippet && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-normal lowercase">
                    pasted
                  </span>
                )}
              </span>
              <span className="text-paper-dim">{showCodeBox ? '▲ Hide' : '▼ Expand'}</span>
            </button>

            {showCodeBox && (
              <div className="p-3 border-t border-paper-border bg-paper-surface space-y-2">
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Paste your solved solution from LeetCode or GeeksForGeeks here... (Java, C++, Python, JavaScript supported)"
                  rows={6}
                  className="w-full p-2.5 font-mono text-xs bg-paper-surface-2 border border-paper-border rounded-lg text-paper-text placeholder:text-paper-faint focus:outline-hidden focus:border-core"
                />

                {/* Real-time Code Analysis Report */}
                {codeAnalysis ? (
                  <div className="p-2.5 rounded-lg bg-paper-surface-2 border border-paper-border space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-paper-text border-b border-paper-border pb-1">
                      <span>Code Analysis Summary ({codeAnalysis.language})</span>
                      <span className="text-emerald-700">
                        Score: {codeAnalysis.qualityScore}/10
                      </span>
                    </div>

                    {codeAnalysis.optimalityTag && (
                      <div className="text-[11px] font-mono text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md border border-emerald-300 font-bold">
                        {codeAnalysis.optimalityTag}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="p-1.5 rounded bg-paper-surface border border-paper-border">
                        <span className="text-paper-faint block">Time Est:</span>
                        <span className="font-bold text-core">{codeAnalysis.estimatedTime}</span>
                      </div>
                      <div className="p-1.5 rounded bg-paper-surface border border-paper-border">
                        <span className="text-paper-faint block">Space Est:</span>
                        <span className="font-bold text-core">{codeAnalysis.estimatedSpace}</span>
                      </div>
                      <div className="p-1.5 rounded bg-paper-surface border border-paper-border">
                        <span className="text-paper-faint block">Code Lines:</span>
                        <span className="font-bold text-paper-text">
                          {codeAnalysis.codeLines} lines
                        </span>
                      </div>
                      <div className="p-1.5 rounded bg-paper-surface border border-paper-border">
                        <span className="text-paper-faint block">Edge Guards:</span>
                        <span className="font-bold text-paper-text">
                          {codeAnalysis.edgeCasesHandled.length || 'None'}
                        </span>
                      </div>
                    </div>

                    {codeAnalysis.edgeCasesHandled.length > 0 && (
                      <div className="text-[10.5px] text-paper-dim">
                        🛡️ <strong>Guards Handled:</strong>{' '}
                        {codeAnalysis.edgeCasesHandled.join(', ')}
                      </div>
                    )}

                    {/* Action Buttons: Ask AI Review & Save Solution */}
                    <div className="pt-2 border-t border-paper-border flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleRequestAiReview}
                          disabled={aiReviewLoading || !codeSnippet.trim()}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-mono text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {aiReviewLoading ? (
                            <>
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span>Evaluating on Local GPU / Gemini...</span>
                            </>
                          ) : (
                            <>
                              <span>🤖 Ask AI Interviewer Review</span>
                              <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-normal">
                                Local GPU / Cloud
                              </span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveSolutionOnly}
                          disabled={!codeSnippet.trim()}
                          className="px-3.5 py-2 rounded-xl border border-paper-border hover:border-paper-text/40 bg-paper-surface hover:bg-paper-surface-2 text-paper-text font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                          title="Save solution code & current AI review without changing revision intervals"
                        >
                          <span>💾 Save Solution</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-paper-dim hidden sm:inline">
                        ⚡ Local GTX 1650 Ti GPU / Gemini Active
                      </span>
                    </div>

                    {/* AI Review Card */}
                    {aiReviewData && (
                      <div className="mt-3 p-3 rounded-xl border border-purple-300 bg-purple-50/70 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-purple-200 pb-1.5 flex-wrap gap-2">
                          <span className="font-mono font-bold text-purple-950 flex items-center gap-1.5 flex-wrap">
                            <span>
                              {aiReviewData.provider?.includes('GPU') ||
                              aiReviewData.provider?.includes('Ollama')
                                ? '🤖 Local GPU Evaluation'
                                : '🤖 Gemini Interviewer Evaluation'}
                            </span>
                            <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-bold">
                              {aiReviewData.provider}
                            </span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                              Score: {aiReviewData.score}/10
                            </span>
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 font-mono px-1.5 py-0.5 rounded font-semibold">
                              ✓ Saved
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-purple-900">
                          <strong>⏱️ Time:</strong> {aiReviewData.timeComplexity} —{' '}
                          <em>{aiReviewData.timeProof}</em>
                        </div>

                        <div className="text-[11px] font-mono text-purple-900">
                          <strong>💾 Space:</strong> {aiReviewData.spaceComplexity} —{' '}
                          <em>{aiReviewData.spaceProof}</em>
                        </div>

                        {aiReviewData.optimalityTag && (
                          <div className="inline-block font-mono text-[10.5px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            ⭐ {aiReviewData.optimalityTag}
                          </div>
                        )}

                        {aiReviewData.interviewerTips && (
                          <div className="p-2 rounded-lg bg-white/80 border border-purple-200 text-purple-950 text-[11.5px] leading-relaxed">
                            <strong>💡 Interviewer Advice:</strong> {aiReviewData.interviewerTips}
                          </div>
                        )}

                        {aiReviewData.betterApproach && (
                          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                            <strong>🚀 More Optimal Follow-Up:</strong>{' '}
                            {aiReviewData.betterApproach}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-paper-faint">
                    Tip: Pasting code triggers automatic complexity analysis, quality scoring, and
                    edge case inspection that persists for future revisions.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 4: 1-Line Key Takeaway / Notes */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-paper-text mb-1">
              Key Takeaway / Memory Hook:
            </label>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. For matrix transpose start j at i+1 to avoid swapping diagonals back"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-paper-surface-2 border border-paper-border rounded-lg text-paper-text placeholder:text-paper-faint focus:outline-hidden focus:border-core"
            />
          </div>

          {/* Section: Previous Solutions & Attempts History */}
          {historyList.length > 0 && (
            <div className="border border-paper-border rounded-xl bg-paper-surface-2/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full p-3 text-left font-mono text-xs font-bold uppercase tracking-wider text-paper-text flex items-center justify-between hover:bg-paper-surface transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>📜 Previous Solutions & Attempts History</span>
                  <span className="text-[10px] bg-paper-border text-paper-dim px-2 py-0.5 rounded-full font-bold">
                    {historyList.length} attempt{historyList.length > 1 ? 's' : ''}
                  </span>
                </span>
                <span className="text-paper-dim font-mono text-[11px]">
                  {showHistory ? '▲ Hide' : '▼ View History'}
                </span>
              </button>

              {showHistory && (
                <div className="p-3 border-t border-paper-border bg-paper-surface space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                  {historyList.map((entry, idx) => {
                    const dateStr = entry.date
                      ? new Date(entry.date).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : 'Earlier'
                    const isExpanded = expandedHistoryIndex === idx

                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-paper-border bg-paper-surface-2 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-bold text-paper-text">
                              Attempt #{historyList.length - idx}
                            </span>
                            <span className="text-paper-faint">•</span>
                            <span className="text-paper-dim text-[11px]">{dateStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full font-semibold bg-paper-surface border border-paper-border text-paper-dim">
                              Stage {entry.stage || 1} • {entry.outcome}
                            </span>
                            {entry.aiReview?.score && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">
                                ⭐ {entry.aiReview.score}/10
                              </span>
                            )}
                          </div>
                        </div>

                        {entry.notes && (
                          <div className="text-[11px] text-paper-dim italic">
                            💡 Note: "{entry.notes}"
                          </div>
                        )}

                        {entry.codeSnippet ? (
                          <div className="pt-1 border-t border-paper-border/60">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => setExpandedHistoryIndex(isExpanded ? null : idx)}
                                className="font-mono text-[10.5px] text-core hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                              >
                                <span>{isExpanded ? '▲ Hide Code' : '▼ View Saved Solution'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCodeSnippet(entry.codeSnippet)
                                  if (entry.aiReview) setAiReviewData(entry.aiReview)
                                  dispatch(showToastNotification('📋 Solution code restored to editor!'))
                                }}
                                className="font-mono text-[10px] text-paper-dim hover:text-paper-text border border-paper-border bg-paper-surface px-2 py-0.5 rounded hover:bg-paper-border/30 cursor-pointer transition-colors"
                                title="Load this code into the active editor above"
                              >
                                ↺ Restore in Editor
                              </button>
                            </div>

                            {isExpanded && (
                              <pre className="mt-2 p-2.5 rounded-md bg-paper-surface border border-paper-border font-mono text-[11px] text-paper-text overflow-x-auto max-h-48 custom-scrollbar">
                                <code>{entry.codeSnippet}</code>
                              </pre>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] text-paper-faint italic">
                            (No code snippet submitted in this attempt)
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 5: Adaptive Outcome Selector (With Recommendations) */}
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-paper-text mb-1 flex items-center justify-between">
              <span>Select Revision Outcome</span>
              <span className="text-[11px] font-normal text-paper-dim">
                ★ Recommended based on your checklist
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Efficient Solve */}
              <button
                type="button"
                onClick={() =>
                  handleSelectOutcome(
                    'efficient',
                    'Solved efficiently without hints',
                    'In 7–14 days'
                  )
                }
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  recommendedOutcome === 'efficient'
                    ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-400/40 shadow-xs'
                    : 'border-emerald-300/80 bg-emerald-50/50 hover:bg-emerald-100/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>Solved without help</span>
                      {recommendedOutcome === 'efficient' && (
                        <span className="text-emerald-700 text-xs font-bold" title="Recommended">★</span>
                      )}
                    </span>
                    <span className="font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 whitespace-nowrap shrink-0 shadow-2xs">
                      +7 days
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 mt-1 leading-relaxed">
                    Approach was crystal clear; solved optimally without any hints.
                  </p>
                </div>
                {recommendedOutcome === 'efficient' && (
                  <div className="mt-2.5 pt-1.5 border-t border-emerald-300/50 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                      ★ Recommended
                    </span>
                    <span className="text-[10px] font-mono text-emerald-900/80 font-medium">
                      Based on checklist
                    </span>
                  </div>
                )}
              </button>

              {/* Option 2: Slow Solve */}
              <button
                type="button"
                onClick={() =>
                  handleSelectOutcome('slow', 'Solved, but took time', 'In 2–3 days')
                }
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  recommendedOutcome === 'slow'
                    ? 'border-blue-500 bg-blue-50/90 ring-2 ring-blue-400/40 shadow-xs'
                    : 'border-blue-300/80 bg-blue-50/50 hover:bg-blue-100/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <span>⏱️</span>
                      <span>Took too much time</span>
                      {recommendedOutcome === 'slow' && (
                        <span className="text-blue-700 text-xs font-bold" title="Recommended">★</span>
                      )}
                    </span>
                    <span className="font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-950 whitespace-nowrap shrink-0 shadow-2xs">
                      +3 days
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-900/80 mt-1 leading-relaxed">
                    Solved successfully, but recall was slow. Needs speed practice.
                  </p>
                </div>
                {recommendedOutcome === 'slow' && (
                  <div className="mt-2.5 pt-1.5 border-t border-blue-300/50 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                      ★ Recommended
                    </span>
                    <span className="text-[10px] font-mono text-blue-900/80 font-medium">
                      Based on checklist
                    </span>
                  </div>
                )}
              </button>

              {/* Option 3: Hint Needed */}
              <button
                type="button"
                onClick={() => handleSelectOutcome('hint', 'Needed a hint', 'Next day (+1d)')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  recommendedOutcome === 'hint'
                    ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-400/40 shadow-xs'
                    : 'border-amber-300/80 bg-amber-50/50 hover:bg-amber-100/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span>💡</span>
                      <span>Needed a hint / peek</span>
                      {recommendedOutcome === 'hint' && (
                        <span className="text-amber-700 text-xs font-bold" title="Recommended">★</span>
                      )}
                    </span>
                    <span className="font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 whitespace-nowrap shrink-0 shadow-2xs">
                      Next day
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 mt-1 leading-relaxed">
                    Had to inspect hints or syntax. Re-attempt tomorrow independently.
                  </p>
                </div>
                {recommendedOutcome === 'hint' && (
                  <div className="mt-2.5 pt-1.5 border-t border-amber-300/50 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-600 text-white shadow-2xs">
                      ★ Recommended
                    </span>
                    <span className="text-[10px] font-mono text-amber-900/80 font-medium">
                      Based on checklist
                    </span>
                  </div>
                )}
              </button>

              {/* Option 4: Solution Walkthrough */}
              <button
                type="button"
                onClick={() =>
                  handleSelectOutcome('solution', 'Had to view solution', 'Re-attempt tomorrow')
                }
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  recommendedOutcome === 'solution'
                    ? 'border-orange-500 bg-orange-50/90 ring-2 ring-orange-400/40 shadow-xs'
                    : 'border-orange-300/80 bg-orange-50/50 hover:bg-orange-100/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-orange-950 flex items-center gap-1.5">
                      <span>📖</span>
                      <span>Viewed full solution</span>
                      {recommendedOutcome === 'solution' && (
                        <span className="text-orange-700 text-xs font-bold" title="Recommended">★</span>
                      )}
                    </span>
                    <span className="font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-orange-200 text-orange-950 whitespace-nowrap shrink-0 shadow-2xs">
                      Next day
                    </span>
                  </div>
                  <p className="text-[11px] text-orange-900/80 mt-1 leading-relaxed">
                    Viewed direct solution. Re-attempt from scratch tomorrow.
                  </p>
                </div>
                {recommendedOutcome === 'solution' && (
                  <div className="mt-2.5 pt-1.5 border-t border-orange-300/50 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-600 text-white shadow-2xs">
                      ★ Recommended
                    </span>
                    <span className="text-[10px] font-mono text-orange-900/80 font-medium">
                      Based on checklist
                    </span>
                  </div>
                )}
              </button>

              {/* Option 5: Repeat Mistake */}
              <button
                type="button"
                onClick={() =>
                  handleSelectOutcome(
                    'repeat_mistake',
                    'Repeated same mistake',
                    'Next day + in 3 days'
                  )
                }
                className="p-3 rounded-xl border border-rose-300/80 bg-rose-50/60 hover:bg-rose-100/80 text-left transition-all cursor-pointer group sm:col-span-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>Repeated same mistake</span>
                  </span>
                  <span className="font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-950 whitespace-nowrap shrink-0 shadow-2xs">
                    Next day + Reset stage
                  </span>
                </div>
                <p className="text-[11px] text-rose-900/80 mt-1 leading-relaxed">
                  Repeated the same pitfall. Interval reset: understand the gap tomorrow, then
                  re-test in 3 days.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
