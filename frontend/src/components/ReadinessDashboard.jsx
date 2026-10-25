import React, { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectSolved,
  selectMastery,
  selectRevision,
  selectInterviewHistory,
  selectSyncKey,
  setActiveTab,
  setInterviewModalOpen,
  showToastNotification,
  selectReadinessSnapshots,
  addLocalReadinessSnapshot,
  persistReadinessSnapshot,
  fetchHistoricalSnapshots,
} from '../store/progressSlice'
import { calculateClientReadinessReport } from '../utils/readinessEngine'

import ComponentCard from './readiness/ComponentCard'
import RecommendationsSection from './readiness/RecommendationsSection'
import PatternMatrixSection from './readiness/PatternMatrixSection'
import HistoryTrendSection from './readiness/HistoryTrendSection'
import { ArchitectureModal, ComponentDetailModal } from './readiness/ReadinessModals'

export default function ReadinessDashboard() {
  const dispatch = useDispatch()
  const solved = useSelector(selectSolved)
  const mastery = useSelector(selectMastery)
  const revision = useSelector(selectRevision)
  const interviewHistory = useSelector(selectInterviewHistory)
  const syncKey = useSelector(selectSyncKey)
  const snapshots = useSelector(selectReadinessSnapshots)

  // Local state for interactive UI
  const [activeComponentModal, setActiveComponentModal] = useState(null)
  const [showArchitectureModal, setShowArchitectureModal] = useState(false)
  const [savingSnapshot, setSavingSnapshot] = useState(false)

  // Pure deterministic assessment calculation directly from current store
  const report = useMemo(() => {
    return calculateClientReadinessReport({
      solved,
      mastery,
      revision,
      interviews: interviewHistory,
      now: Date.now(),
    })
  }, [solved, mastery, revision, interviewHistory])

  // Sync historical snapshots from backend if syncKey is connected
  useEffect(() => {
    if (syncKey) {
      dispatch(fetchHistoricalSnapshots())
    }
  }, [dispatch, syncKey])

  // Quick Action Handler for recommendations
  const handleRecommendationAction = (rec) => {
    if (rec.id === 'rec_delayed_recall_decay') {
      dispatch(setActiveTab('revision'))
    } else if (rec.id === 'rec_time_pressure_gap' || rec.id === 'rec_establish_benchmark') {
      dispatch(setInterviewModalOpen(true))
    } else if (rec.patterns && rec.patterns.length > 0) {
      dispatch(setActiveTab('all'))
      setTimeout(() => {
        const title = rec.patterns[0]
        const el = Array.from(document.querySelectorAll('h2, h3')).find((h) =>
          h.textContent.toLowerCase().includes(title.toLowerCase())
        )
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }

  // Handle Manual Snapshot Save
  const handleSaveSnapshot = async () => {
    setSavingSnapshot(true)
    const snapshotItem = {
      overallScore: report.overallScore,
      status: report.status,
      confidenceLevel: report.confidenceLevel,
      evidenceCoverage: report.evidenceCoverage,
      calculatedAt: new Date().toISOString(),
      scoreExplanation: report.scoreExplanation,
      metrics: report.metrics,
    }

    dispatch(addLocalReadinessSnapshot(snapshotItem))

    if (syncKey) {
      try {
        await dispatch(persistReadinessSnapshot(report)).unwrap()
        dispatch(showToastNotification('Readiness score snapshot saved to cloud!'))
      } catch (e) {
        dispatch(showToastNotification('Snapshot saved locally on your device.'))
      }
    } else {
      dispatch(showToastNotification('Snapshot saved to local device history.'))
    }
    setSavingSnapshot(false)
  }

  const {
    overallScore,
    status,
    evidenceCoverage,
    components,
    metrics,
    recommendations,
    strongestPatterns,
    weakestPatterns,
    insufficientEvidencePatterns,
    scoreExplanation,
  } = report

  // Status Badge Styling & Labels
  const getStatusBadge = () => {
    switch (status) {
      case 'confident':
        return {
          label: 'Evidence-Backed Score',
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
        }
      case 'provisional':
        return {
          label: 'Provisional Estimate',
          classes: 'bg-amber-50 text-amber-900 border-amber-300',
          dot: 'bg-amber-500 animate-pulse',
        }
      case 'insufficient_data':
      default:
        return {
          label: 'Not Enough Evidence',
          classes: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
        }
    }
  }

  const statusBadge = getStatusBadge()

  const formatSnapshotDate = (iso) => {
    if (!iso) return 'Recent'
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6 my-6 animate-fadeIn">
      {/* 1. Header Banner & Architecture Transparency Action */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-core font-semibold flex items-center gap-2 mb-1">
              <span>Evidence-Based Assessment Engine</span>
              <span className="text-paper-faint">&middot;</span>
              <span className="text-paper-dim">LeetCode & GFG External Execution</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-paper-text">
              Interview Readiness Assessment
            </h2>
            <p className="text-paper-dim text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Multi-factor assessment synthesized strictly from empirical evidence: pattern mastery,
              independently verified solving, delayed recall retention, and timed mock interviews.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowArchitectureModal(true)}
              className="font-mono text-xs font-semibold px-3 py-1.5 rounded-xl border border-paper-border bg-paper-surface-2 text-paper-dim hover:text-paper-text hover:border-paper-border/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>⚖️ Evidence Architecture</span>
            </button>

            <button
              type="button"
              disabled={savingSnapshot}
              onClick={handleSaveSnapshot}
              className="font-mono text-xs font-semibold px-3 py-1.5 rounded-xl border border-core/30 bg-core/10 text-core hover:bg-core hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              <span>{savingSnapshot ? 'Saving...' : '📸 Save Snapshot'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hero Card: Readiness Score, Confidence, & Normalization Callout */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Big Score Dial & Status */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left border-b lg:border-b-0 lg:border-r border-paper-border/80 pb-6 lg:pb-0 lg:pr-6">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${statusBadge.classes}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                {statusBadge.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-1">
              <span className="font-serif text-5xl sm:text-6xl font-bold text-paper-text tracking-tight">
                {overallScore !== null ? overallScore : '—'}
              </span>
              <span className="font-mono text-xl text-paper-faint">/ 100</span>
            </div>

            <p className="font-mono text-xs text-paper-dim mt-1">
              {overallScore !== null ? 'Composite Readiness Benchmark' : 'Insufficient assessment data'}
            </p>

            {/* Quick Progress Bar for Score */}
            <div className="w-full bg-paper-surface-2 h-2.5 rounded-full mt-4 overflow-hidden border border-paper-border">
              <div
                className={`h-full transition-all duration-700 ${
                  status === 'confident'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    : status === 'provisional'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-paper-border'
                }`}
                style={{ width: `${overallScore || 0}%` }}
              />
            </div>
          </div>

          {/* Right Column: Evidence Completeness & Normalization Explanation */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-paper-dim font-semibold uppercase tracking-wider">
                  Evidence Completeness & Confidence
                </span>
                <span className="font-bold text-paper-text">{evidenceCoverage}% Coverage</span>
              </div>
              <div className="w-full bg-paper-surface-2 h-2 rounded-full overflow-hidden border border-paper-border mb-3">
                <div
                  className="h-full bg-core transition-all duration-700"
                  style={{ width: `${evidenceCoverage}%` }}
                />
              </div>

              {/* Score Explanation Alert */}
              <div
                className={`p-3.5 rounded-xl border text-xs sm:text-[13px] leading-relaxed ${
                  status === 'confident'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : status === 'provisional'
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                      : 'bg-paper-surface-2 border-paper-border text-paper-dim'
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  <span>ℹ️ Assessment Analysis:</span>
                </div>
                {scoreExplanation}
              </div>
            </div>

            {/* Mini Summary Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="bg-paper-surface-2/60 border border-paper-border rounded-xl p-2.5 text-center">
                <div className="font-mono text-base font-bold text-paper-text">
                  {metrics.totalCanonicalSolved}
                </div>
                <div className="font-mono text-[10px] text-paper-faint uppercase">Solved Problems</div>
              </div>
              <div className="bg-paper-surface-2/60 border border-paper-border rounded-xl p-2.5 text-center">
                <div className="font-mono text-base font-bold text-blue">
                  {metrics.verifiedIndependenceCount}
                </div>
                <div className="font-mono text-[10px] text-paper-faint uppercase">Verified Solves</div>
              </div>
              <div className="bg-paper-surface-2/60 border border-paper-border rounded-xl p-2.5 text-center">
                <div className="font-mono text-base font-bold text-sage">
                  {metrics.delayedRecallReviewsCount}
                </div>
                <div className="font-mono text-[10px] text-paper-faint uppercase">Spaced Reviews</div>
              </div>
              <div className="bg-paper-surface-2/60 border border-paper-border rounded-xl p-2.5 text-center">
                <div className="font-mono text-base font-bold text-core">
                  {metrics.mockInterviewsCount}
                </div>
                <div className="font-mono text-[10px] text-paper-faint uppercase">Timed Mocks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The 5 Pillar Component Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-xl font-bold text-paper-text">
            Readiness Pillar Breakdown
          </h3>
          <span className="font-mono text-xs text-paper-faint">
            Weights dynamically normalized across active pillars
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ComponentCard
            title="Pattern Mastery"
            icon="🧩"
            comp={components.patternMastery}
            onClickDetail={() => setActiveComponentModal(components.patternMastery)}
            stats={[
              { label: 'Active Patterns', value: `${components.patternMastery.metrics.activePatterns}/28` },
              { label: 'Breadth Score', value: `${components.patternMastery.metrics.breadthScore}%` },
              { label: 'Depth Quality', value: `${components.patternMastery.metrics.depthScore}%` },
            ]}
          />

          <ComponentCard
            title="Independent Solving"
            icon="🧠"
            comp={components.independentSolving}
            onClickDetail={() => setActiveComponentModal(components.independentSolving)}
            stats={[
              { label: 'Verified Solves', value: components.independentSolving.metrics.verifiedCount },
              { label: 'Solo / Mastered', value: components.independentSolving.metrics.independentCount },
              { label: 'Unverified Captures', value: components.independentSolving.metrics.unverifiedCount },
            ]}
          />

          <ComponentCard
            title="Delayed Recall Retention"
            icon="🔁"
            comp={components.delayedRecall}
            onClickDetail={() => setActiveComponentModal(components.delayedRecall)}
            stats={[
              { label: 'Recall Reviews', value: components.delayedRecall.metrics.reviewCount },
              { label: 'Recall Success', value: `${components.delayedRecall.metrics.recallRate}%` },
              { label: 'Overdue Decay', value: `-${components.delayedRecall.metrics.overduePenaltyPct || 0}%` },
            ]}
          />

          <ComponentCard
            title="Timed Mock Performance"
            icon="⏱️"
            comp={components.mockInterview}
            onClickDetail={() => setActiveComponentModal(components.mockInterview)}
            stats={[
              { label: 'Mock Sessions', value: components.mockInterview.metrics.sessionCount },
              { label: 'Avg Solve Rate', value: `${components.mockInterview.metrics.avgScore}%` },
              { label: 'Skipped / Left', value: components.mockInterview.metrics.skippedQuestions },
            ]}
          />

          <ComponentCard
            title="Problem Consistency"
            icon="🔥"
            comp={components.consistency}
            onClickDetail={() => setActiveComponentModal(components.consistency)}
            stats={[
              { label: 'Active Days (30d)', value: `${components.consistency.metrics.activeDays30}/12d` },
              { label: 'Day Streak', value: `${components.consistency.metrics.currentStreak}d` },
              { label: 'Cadence Benchmark', value: '12 active days' },
            ]}
          />

          {/* Dynamic Normalization Summary Box */}
          <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-core mb-2">
                <span>📐 Weight Normalization</span>
              </div>
              <h4 className="font-serif font-bold text-base text-paper-text mb-2">
                Transparent Recalibration
              </h4>
              <p className="text-paper-dim text-xs leading-relaxed mb-3">
                Nominal weights sum to 100%. When an optional telemetry source lacks sufficient sample
                size, its weight is not zeroed out silently — active weights are proportionally
                re-normalized so your true ability is never artificially deflated.
              </p>
            </div>
            <div className="font-mono text-[11px] text-paper-faint border-t border-paper-border/60 pt-2 flex justify-between">
              <span>Nominal Target: 100%</span>
              <span className="text-core font-semibold">Normalized & Zero-Inflation</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actionable Weakness Diagnosis */}
      <RecommendationsSection
        recommendations={recommendations}
        onAction={handleRecommendationAction}
      />

      {/* 5. Pattern Mastery Matrix */}
      <PatternMatrixSection
        strongestPatterns={strongestPatterns}
        weakestPatterns={weakestPatterns}
        insufficientEvidencePatterns={insufficientEvidencePatterns}
      />

      {/* 6. Historical Readiness Score Trend Section */}
      <HistoryTrendSection
        snapshots={snapshots}
        formatSnapshotDate={formatSnapshotDate}
      />

      {/* 7. Architecture Modal */}
      <ArchitectureModal
        isOpen={showArchitectureModal}
        onClose={() => setShowArchitectureModal(false)}
      />

      {/* 8. Component Detail Modal */}
      <ComponentDetailModal
        comp={activeComponentModal}
        onClose={() => setActiveComponentModal(null)}
      />
    </div>
  )
}
