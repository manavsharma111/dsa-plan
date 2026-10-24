import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectInterviewModalOpen,
  selectInterviewSession,
  setInterviewModalOpen,
  startInterviewSession,
  tickInterviewTimer,
  toggleInterviewTimer,
  toggleInterviewProblem,
  endInterviewSession,
  resetInterviewSession,
  setActiveTab,
  setSelectedInterviewDetailId,
  saveInterviewToBackend,
  showToastNotification,
} from '../store/progressSlice'
import { patternsData } from '../data/patternsData'

export default function InterviewModeModal() {
  const dispatch = useDispatch()
  const isOpen = useSelector(selectInterviewModalOpen)
  const session = useSelector(selectInterviewSession)

  const [selectedMode, setSelectedMode] = useState('sprint') // 'sprint' | 'full' | 'hard' | 'single'
  const [selectedPattern, setSelectedPattern] = useState('all')
  const [scratchpadText, setScratchpadText] = useState('')

  // Ticking timer effect
  useEffect(() => {
    let interval = null
    if (session && session.status === 'running') {
      interval = setInterval(() => {
        dispatch(tickInterviewTimer())
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [session?.status, dispatch])

  // Lock body scroll and prevent background scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return
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
  }, [isOpen])

  if (!isOpen) return null

  // Generate random problems for interview
  const handleStart = () => {
    let pool = patternsData.flatMap((pat) =>
      pat.problems.map((p) => ({ ...p, patternTitle: pat.title }))
    )

    if (selectedPattern !== 'all') {
      const pid = parseInt(selectedPattern, 10)
      pool = pool.filter((p) => {
        const pat = patternsData.find((pt) => pt.id === pid)
        return pat && pat.problems.some((q) => q.id === p.id)
      })
    }

    const easyPool = pool.filter((p) => p.difficulty === 'E')
    const medPool = pool.filter((p) => p.difficulty === 'M')
    const hardPool = pool.filter((p) => p.difficulty === 'H')

    const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random())

    let chosen = []
    let duration = 45
    let title = 'Sprint Tech Screen'

    if (selectedMode === '2med_1hard') {
      // 2 Medium + 1 Hard
      const shuffMed = shuffle(medPool.length >= 2 ? medPool : pool)
      const shuffHard = shuffle(hardPool.length >= 1 ? hardPool : pool)
      chosen = [shuffMed[0], shuffMed[1], shuffHard[0]].filter(Boolean)
      duration = 75
      title = 'Advanced Screen (2 Medium + 1 Hard)'
    } else if (selectedMode === '1med_2hard') {
      // 1 Medium + 2 Hard
      const shuffMed = shuffle(medPool.length >= 1 ? medPool : pool)
      const shuffHard = shuffle(hardPool.length >= 2 ? hardPool : pool)
      chosen = [shuffMed[0], shuffHard[0], shuffHard[1]].filter(Boolean)
      duration = 90
      title = 'FAANG Tough (1 Medium + 2 Hard)'
    } else if (selectedMode === '3med') {
      // 3 Mediums
      const shuffMed = shuffle(medPool.length >= 3 ? medPool : pool)
      chosen = shuffMed.slice(0, 3)
      duration = 60
      title = 'Triple Medium Speedrun (3 Mediums)'
    } else if (selectedMode === '1easy_1med_1hard') {
      // 1 Easy + 1 Medium + 1 Hard
      const shuffEasy = shuffle(easyPool.length >= 1 ? easyPool : pool)
      const shuffMed = shuffle(medPool.length >= 1 ? medPool : pool)
      const shuffHard = shuffle(hardPool.length >= 1 ? hardPool : pool)
      chosen = [shuffEasy[0], shuffMed[0], shuffHard[0]].filter(Boolean)
      duration = 60
      title = 'Balanced Triad (1 Easy + 1 Med + 1 Hard)'
    } else if (selectedMode === 'sprint') {
      // 2 Mediums
      const shuffMed = shuffle(medPool.length >= 2 ? medPool : pool)
      chosen = shuffMed.slice(0, 2)
      duration = 45
      title = 'Sprint Interview (2 Mediums)'
    } else if (selectedMode === 'full') {
      // 1 Easy + 2 Mediums
      const shuffEasy = shuffle(easyPool.length > 0 ? easyPool : pool)
      const shuffMed = shuffle(medPool.length >= 2 ? medPool : pool)
      chosen = [shuffEasy[0], shuffMed[0], shuffMed[1]].filter(Boolean)
      duration = 60
      title = 'Full Loop Interview (1 Easy + 2 Mediums)'
    } else if (selectedMode === 'hard') {
      // 1 Medium + 1 Hard
      const shuffMed = shuffle(medPool.length > 0 ? medPool : pool)
      const shuffHard = shuffle(hardPool.length > 0 ? hardPool : pool)
      chosen = [shuffMed[0], shuffHard[0]].filter(Boolean)
      duration = 60
      title = 'Hard Round (1 Medium + 1 Hard)'
    } else {
      // Single question
      const shuff = shuffle(pool)
      chosen = shuff.slice(0, 1)
      duration = 30
      title = 'Quick Fire (1 Question)'
    }

    // Ensure unique questions
    const seen = new Set()
    chosen = chosen.filter((p) => {
      if (!p || seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })

    dispatch(
      startInterviewSession({
        problems: chosen,
        durationMinutes: duration,
        title,
      })
    )
    dispatch(showToastNotification(`🚀 ${title} started! Good luck!`))
  }

  // End and sync interview to MongoDB
  const handleEndInterview = (openDetails = false) => {
    if (!session) return
    const timeTaken = session.durationMinutes * 60 - session.timeRemaining
    const total = session.problems?.length || 0
    const solved = Object.values(session.solved || {}).filter(Boolean).length

    const historyEntry = {
      id: session.id || Date.now(),
      title: session.title,
      startedAt: session.startedAt,
      completedAt: Date.now(),
      durationMinutes: session.durationMinutes,
      timeTakenSeconds: Math.max(0, timeTaken),
      totalProblems: total,
      solvedProblems: solved,
      scorePercent: total > 0 ? Math.round((solved / total) * 100) : 0,
      notes: scratchpadText,
      problems: (session.problems || []).map((p) => ({
        id: p.id,
        name: p.name,
        difficulty: p.difficulty,
        lc: p.lc,
        url: p.url,
        slug: p.slug,
        platform: p.platform,
        patternTitle: p.patternTitle,
        solved: !!session.solved?.[p.id],
      })),
    }

    dispatch(endInterviewSession({ notes: scratchpadText }))
    dispatch(saveInterviewToBackend(historyEntry))

    if (openDetails) {
      dispatch(setSelectedInterviewDetailId(session.id))
      dispatch(setActiveTab('interviews'))
      dispatch(setInterviewModalOpen(false))
    } else {
      dispatch(setInterviewModalOpen(false))
      dispatch(showToastNotification(`Interview saved! ${solved}/${total} solved.`))
    }
  }

  // Format time remaining
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Count solved
  const solvedCount = session?.solved ? Object.values(session.solved).filter(Boolean).length : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-hidden overscroll-contain">
      <div className="bg-[#fffdfb] border border-paper-border rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-paper-border flex justify-between items-center bg-paper-surface flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-paper-text">
              {session ? session.title : 'Mock Interview & Timed Practice'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => dispatch(setInterviewModalOpen(false))}
            className="w-8 h-8 rounded-full border border-paper-border hover:bg-paper-surface-2 text-paper-dim hover:text-paper-text flex items-center justify-center transition-colors font-mono text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
          {!session ? (
            /* Setup Screen */
            <div className="space-y-5">
              <p className="text-xs sm:text-sm text-paper-dim leading-relaxed">
                Simulate a high-pressure interview environment. Questions will be picked randomly
                from the master list with a live countdown timer.
              </p>

              {/* Mode Select */}
              <div>
                <label className="font-mono text-xs font-semibold text-paper-text uppercase tracking-wider block mb-2">
                  Select Format:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. 2 Medium + 1 Hard */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('2med_1hard')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedMode === '2med_1hard'
                        ? 'border-core bg-core/10 shadow-xs ring-1 ring-core'
                        : 'border-paper-border bg-paper-surface hover:border-paper-dim'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-semibold text-sm text-paper-text flex items-center gap-1.5">
                        <span>⚡ 2 Medium + 1 Hard</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-core">75 min</span>
                    </div>
                    <span className="text-xs text-paper-dim">2 Mediums + 1 Hard Questions</span>
                  </button>

                  {/* 2. 1 Medium + 2 Hard */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('1med_2hard')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedMode === '1med_2hard'
                        ? 'border-core bg-core/10 shadow-xs ring-1 ring-core'
                        : 'border-paper-border bg-paper-surface hover:border-paper-dim'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-semibold text-sm text-paper-text flex items-center gap-1.5">
                        <span>💀 1 Medium + 2 Hard</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-core">90 min</span>
                    </div>
                    <span className="text-xs text-paper-dim">1 Medium + 2 Hard (FAANG Tough)</span>
                  </button>

                  {/* 3. 3 Medium */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('3med')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedMode === '3med'
                        ? 'border-core bg-core/10 shadow-xs ring-1 ring-core'
                        : 'border-paper-border bg-paper-surface hover:border-paper-dim'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-semibold text-sm text-paper-text flex items-center gap-1.5">
                        <span>🏆 3 Mediums</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-core">60 min</span>
                    </div>
                    <span className="text-xs text-paper-dim">3 Random Medium Questions</span>
                  </button>

                  {/* 4. 1 Easy + 1 Medium + 1 Hard */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('1easy_1med_1hard')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedMode === '1easy_1med_1hard'
                        ? 'border-core bg-core/10 shadow-xs ring-1 ring-core'
                        : 'border-paper-border bg-paper-surface hover:border-paper-dim'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-semibold text-sm text-paper-text flex items-center gap-1.5">
                        <span>⚖️ 1E + 1M + 1H</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-core">60 min</span>
                    </div>
                    <span className="text-xs text-paper-dim">1 Easy + 1 Medium + 1 Hard</span>
                  </button>

                  {/* 5. Sprint (2 Mediums) */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('sprint')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedMode === 'sprint'
                        ? 'border-core bg-core/10 shadow-xs ring-1 ring-core'
                        : 'border-paper-border bg-paper-surface hover:border-paper-dim'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-semibold text-sm text-paper-text">
                        ⚡ Sprint Screen
                      </span>
                      <span className="font-mono text-xs font-bold text-core">45 min</span>
                    </div>
                    <span className="text-xs text-paper-dim">2 Random Medium Questions</span>
                  </button>

                  {/* 6. Full Loop */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('full')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedMode === 'full'
                        ? 'border-core bg-core/10 shadow-xs ring-1 ring-core'
                        : 'border-paper-border bg-paper-surface hover:border-paper-dim'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-semibold text-sm text-paper-text">
                        🎯 Full Loop
                      </span>
                      <span className="font-mono text-xs font-bold text-core">60 min</span>
                    </div>
                    <span className="text-xs text-paper-dim">1 Easy + 2 Medium Questions</span>
                  </button>

                  {/* 7. Hard Core */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('hard')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedMode === 'hard'
                        ? 'border-core bg-core/10 shadow-xs ring-1 ring-core'
                        : 'border-paper-border bg-paper-surface hover:border-paper-dim'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-semibold text-sm text-paper-text">
                        🔥 Hard Core
                      </span>
                      <span className="font-mono text-xs font-bold text-core">60 min</span>
                    </div>
                    <span className="text-xs text-paper-dim">1 Medium + 1 Hard Question</span>
                  </button>

                  {/* 8. Quick Fire */}
                  <button
                    type="button"
                    onClick={() => setSelectedMode('single')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedMode === 'single'
                        ? 'border-core bg-core/10 shadow-xs ring-1 ring-core'
                        : 'border-paper-border bg-paper-surface hover:border-paper-dim'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-semibold text-sm text-paper-text">
                        🎲 Quick Fire
                      </span>
                      <span className="font-mono text-xs font-bold text-core">30 min</span>
                    </div>
                    <span className="text-xs text-paper-dim">1 Random Question</span>
                  </button>
                </div>
              </div>

              {/* Pattern Scope */}
              <div>
                <label className="font-mono text-xs font-semibold text-paper-text uppercase tracking-wider block mb-2">
                  Pattern Focus (Optional):
                </label>
                <select
                  value={selectedPattern}
                  onChange={(e) => setSelectedPattern(e.target.value)}
                  className="w-full font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-paper-border bg-paper-surface-2 text-paper-text outline-none focus:border-core cursor-pointer"
                >
                  <option value="all">Across All 28 Patterns (Recommended)</option>
                  {patternsData.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      Pattern {pat.id}: {pat.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleStart}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-core to-[#ea580c] hover:opacity-95 text-white font-mono text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🚀 Begin Mock Interview</span>
              </button>
            </div>
          ) : (
            /* Active Interview Screen */
            <div className="space-y-5">
              {/* Big Digital Timer Display */}
              <div
                className={`p-5 rounded-2xl border text-center transition-all ${
                  session.status === 'completed'
                    ? 'bg-emerald-50 border-emerald-300'
                    : session.timeRemaining <= 300
                      ? 'bg-core-bg border-core animate-pulse'
                      : 'bg-paper-surface-2 border-paper-border'
                }`}
              >
                <div className="flex justify-center items-center gap-3 mb-1">
                  <span
                    className={`font-mono text-4xl sm:text-5xl font-bold tracking-tight ${
                      session.timeRemaining <= 300 ? 'text-core' : 'text-paper-text'
                    }`}
                  >
                    {formatTime(session.timeRemaining)}
                  </span>
                </div>

                <div className="flex justify-center items-center gap-2 text-xs font-mono text-paper-dim">
                  <span>
                    Status:{' '}
                    <strong className="uppercase">
                      {session.status === 'completed' ? 'Time Up!' : session.status}
                    </strong>
                  </span>
                  <span>&middot;</span>
                  <span>
                    Solved:{' '}
                    <strong>
                      {solvedCount} / {session.problems.length}
                    </strong>
                  </span>
                </div>

                {session.status !== 'completed' && (
                  <div className="flex justify-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => dispatch(toggleInterviewTimer())}
                      className="font-mono text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-paper-border bg-paper-surface hover:bg-paper-surface-2 text-paper-text transition-colors cursor-pointer"
                    >
                      {session.status === 'running' ? '⏸ Pause Timer' : '▶ Resume Timer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEndInterview(false)}
                      className="font-mono text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-core/30 bg-core-bg hover:bg-core text-core hover:text-white transition-colors cursor-pointer"
                    >
                      Finish Early
                    </button>
                  </div>
                )}
              </div>

              {/* Problem Cards */}
              <div className="space-y-2.5">
                <span className="font-mono text-xs font-semibold text-paper-text uppercase tracking-wider block">
                  Interview Questions:
                </span>
                {session.problems.map((prob, idx) => {
                  const isProbSolved = !!session.solved[prob.id]
                  return (
                    <div
                      key={prob.id}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isProbSolved
                          ? 'border-sage/40 bg-sage-bg/20'
                          : 'border-paper-border bg-paper-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isProbSolved}
                          onChange={() => dispatch(toggleInterviewProblem(prob.id))}
                          className="w-5 h-5 accent-sage cursor-pointer rounded flex-shrink-0"
                          id={`interview-${prob.id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-mono uppercase text-paper-faint block">
                            Q{idx + 1} &middot; {prob.patternTitle}
                          </span>
                          <label
                            htmlFor={`interview-${prob.id}`}
                            className={`font-serif font-medium text-sm sm:text-base cursor-pointer select-none truncate block ${
                              isProbSolved ? 'line-through text-paper-dim' : 'text-paper-text'
                            }`}
                          >
                            {prob.name}
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            prob.difficulty === 'E'
                              ? 'text-sage bg-sage-bg'
                              : prob.difficulty === 'H'
                                ? 'text-core bg-core-bg'
                                : 'text-gold bg-gold-bg'
                          }`}
                        >
                          {prob.difficulty}
                        </span>

                        {prob.lc && (
                          <a
                            href={prob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-600 hover:text-white transition-all inline-flex items-center gap-1 shadow-2xs"
                          >
                            <span>Open</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Scratchpad Note Area */}
              <div>
                <label className="font-mono text-xs font-semibold text-paper-text uppercase tracking-wider block mb-1.5">
                  Interview Scratchpad (Notes & Pseudocode):
                </label>
                <textarea
                  value={scratchpadText}
                  onChange={(e) => setScratchpadText(e.target.value)}
                  placeholder="Draft your approach, edge cases, and time/space complexity here..."
                  className="w-full h-24 font-mono text-xs p-3 rounded-xl border border-paper-border bg-paper-surface-2 text-paper-text outline-none focus:border-core resize-none transition-colors"
                />
              </div>

              {/* End/Reset Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-paper-border flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => dispatch(resetInterviewSession())}
                  className="font-mono text-xs text-paper-dim hover:text-core underline cursor-pointer"
                >
                  Start New Interview
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEndInterview(true)}
                    className="font-mono text-xs font-semibold px-3.5 py-2 rounded-xl bg-core text-white hover:bg-[#ea580c] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>📊 View Full Analysis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEndInterview(false)}
                    className="font-mono text-xs font-semibold px-4 py-2 rounded-xl bg-paper-text text-paper-bg hover:opacity-90 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
