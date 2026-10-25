import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectSolved, selectMastery, selectSyncKey, setActiveTab } from '../store/progressSlice'
import { patternsData } from '../data/patternsData'

export default function WeakPatternAnalytics() {
  const dispatch = useDispatch()
  const solved = useSelector(selectSolved)
  const mastery = useSelector(selectMastery)
  const syncKey = useSelector(selectSyncKey)
  const [filterMode, setFilterMode] = useState('weakest') // 'weakest' | 'hints' | 'alphabetical'

  // Analyze each pattern with memoization
  const analyticsData = useMemo(() => {
    return patternsData.map((pat) => {
      const total = pat.problems.length
      let solvedCount = 0
      let hintCount = 0
      let soloCount = 0
      let masterCount = 0

      pat.problems.forEach((p) => {
        const isProblemSolved = solved[p.id] || (p.slug && solved[p.slug])
        if (isProblemSolved) {
          solvedCount++
          const m = mastery[p.id] || (p.slug && mastery[p.slug]) || 'independent'
          if (m === 'hint') hintCount++
          else if (m === 'mastered') masterCount++
          else soloCount++
        }
      })

      const completionPct = total > 0 ? Math.round((solvedCount / total) * 100) : 0
      // Confidence: independent and mastered give full weight, hints give partial weight
      const rawConfidence =
        total > 0 ? ((soloCount * 0.7 + masterCount * 1.0 + hintCount * 0.25) / total) * 100 : 0
      const confidencePct = Math.round(rawConfidence)

      // Weakness score: high hint count + low completion increases score
      const weaknessScore = hintCount * 2.5 + (total - solvedCount) * 1.0

      return {
        id: pat.id,
        title: pat.title,
        idea: pat.idea,
        total,
        solvedCount,
        hintCount,
        soloCount,
        masterCount,
        completionPct,
        confidencePct,
        weaknessScore,
      }
    })
  }, [solved, mastery])

  // Sort according to filter
  const sorted = useMemo(() => {
    return [...analyticsData].sort((a, b) => {
      if (filterMode === 'weakest') {
        return b.weaknessScore - a.weaknessScore
      }
      if (filterMode === 'hints') {
        return b.hintCount - a.hintCount
      }
      return a.id - b.id
    })
  }, [analyticsData, filterMode])

  // Top 3 attention-needed patterns
  const topAttention = useMemo(() => {
    return [...analyticsData]
      .filter((p) => p.hintCount > 0 || p.confidencePct < 60)
      .sort((a, b) => b.weaknessScore - a.weaknessScore)
      .slice(0, 3)
  }, [analyticsData])

  // Auto-sync pattern analytics to MongoDB backend when connected
  useEffect(() => {
    if (!syncKey) return
    const timer = setTimeout(async () => {
      try {
        await fetch('/api/analytics/patterns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            syncKey,
            patterns: analyticsData.map((d) => ({
              patternId: d.id,
              title: d.title,
              total: d.total,
              solved: d.solvedCount,
              soloCount: d.soloCount,
              masteredCount: d.masterCount,
              hintCount: d.hintCount,
              confidence: d.confidencePct,
              status:
                d.confidencePct >= 70 ? 'strong' : d.confidencePct >= 40 ? 'moderate' : 'weak',
            })),
            overallConfidence: Math.round(
              analyticsData.reduce((acc, curr) => acc + curr.confidencePct, 0) /
                (analyticsData.length || 1)
            ),
            totalSolved: Object.keys(solved).length,
            totalHints: Object.values(mastery).filter((m) => m === 'hint').length,
            highPriority: topAttention.map((p) => ({
              id: p.id,
              title: p.title,
              hintCount: p.hintCount,
              confidence: p.confidencePct,
            })),
          }),
        })
      } catch (e) {
        // Safe silent fallback
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [syncKey, solved, mastery])

  const handleJumpToPattern = (id) => {
    dispatch(setActiveTab('all'))
    setTimeout(() => {
      const el = document.getElementById(`pattern-${id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="space-y-6 my-6">
      {/* Header Banner */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-core font-semibold flex items-center gap-2 mb-1">
              <span>Deep Mastery Analytics</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-paper-text">
              Weak-Pattern Diagnostics
            </h2>
            <p className="text-paper-dim text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Tracking where you struggled vs solved independently. Patterns with high hint usage or
              unsolved edge cases are highlighted below so you know exactly where to practice before
              interviews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-paper-dim">Sort by:</span>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="font-mono text-xs px-3 py-1.5 rounded-lg border border-paper-border bg-paper-surface-2 text-paper-text outline-none focus:border-core cursor-pointer"
            >
              <option value="weakest">Most Attention Needed</option>
              <option value="hints">Most Hints Used (💡)</option>
              <option value="alphabetical">Pattern Order (1-28)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Attention Cards */}
      {topAttention.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 font-serif text-lg font-semibold text-amber-900 mb-3">
            <span>⚠️ High-Priority Revision Targets</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topAttention.map((pat, idx) => (
              <div
                key={pat.id}
                className="bg-paper-surface border border-amber-300/80 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-amber-800 font-bold uppercase text-[10px]">
                      Priority #{idx + 1}
                    </span>
                    <span className="text-paper-dim font-medium">
                      Confidence: {pat.confidencePct}%
                    </span>
                  </div>
                  <h4 className="font-serif font-semibold text-base text-paper-text mb-1">
                    {pat.title}
                  </h4>
                  <p className="text-xs text-paper-dim line-clamp-2">{pat.idea}</p>
                </div>

                <div className="pt-2 border-t border-paper-border flex justify-between items-center">
                  <span className="font-mono text-xs text-amber-800 font-medium">
                    💡 {pat.hintCount} needed hints
                  </span>
                  <button
                    type="button"
                    onClick={() => handleJumpToPattern(pat.id)}
                    className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
                  >
                    Review Pattern &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Breakdown Grid */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-serif text-lg font-semibold text-paper-text mb-4">
          All 28 Patterns &mdash; Mastery & Confidence Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sorted.map((pat) => (
            <div
              key={pat.id}
              onClick={() => handleJumpToPattern(pat.id)}
              className="bg-paper-surface-2 border border-paper-border rounded-xl p-3.5 flex flex-col justify-between gap-2.5 transition-all hover:border-core hover:-translate-y-0.5 cursor-pointer shadow-2xs"
            >
              <div>
                <div className="flex justify-between items-center text-[10.5px] font-mono text-paper-faint mb-1">
                  <span>Pattern {pat.id}</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded ${
                      pat.confidencePct >= 70
                        ? 'bg-sage-bg text-sage'
                        : pat.confidencePct >= 40
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-core-bg text-core'
                    }`}
                  >
                    {pat.confidencePct}% Confidence
                  </span>
                </div>
                <h4 className="font-serif font-semibold text-sm text-paper-text truncate mb-1">
                  {pat.title}
                </h4>
              </div>

              {/* Multi-Segment Confidence Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-paper-dim mb-1">
                  <span>
                    Solved: {pat.solvedCount}/{pat.total}
                  </span>
                  {pat.hintCount > 0 && (
                    <span className="text-amber-800 font-semibold">💡 {pat.hintCount} hints</span>
                  )}
                </div>

                <div className="w-full h-2 bg-paper-border/40 rounded-full overflow-hidden flex">
                  {/* Mastered portion (emerald) */}
                  <div
                    className="bg-emerald-600 h-full transition-all"
                    style={{ width: `${(pat.masterCount / pat.total) * 100}%` }}
                    title={`Mastered: ${pat.masterCount}`}
                  />
                  {/* Solo portion (blue) */}
                  <div
                    className="bg-blue-600 h-full transition-all"
                    style={{ width: `${(pat.soloCount / pat.total) * 100}%` }}
                    title={`Solved Solo: ${pat.soloCount}`}
                  />
                  {/* Hint portion (amber) */}
                  <div
                    className="bg-amber-500 h-full transition-all"
                    style={{ width: `${(pat.hintCount / pat.total) * 100}%` }}
                    title={`Needed Hints: ${pat.hintCount}`}
                  />
                </div>
              </div>

              {/* Legend Dots */}
              <div className="flex items-center justify-between text-[9px] font-mono text-paper-faint pt-1 border-t border-paper-border/40">
                <span className="text-emerald-700">⚡ {pat.masterCount}</span>
                <span className="text-blue-700">🧠 {pat.soloCount}</span>
                <span className="text-amber-700">💡 {pat.hintCount}</span>
                <span>⭕ {pat.total - pat.solvedCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
