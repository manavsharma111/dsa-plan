import React from 'react'

export default function HistoryTrendSection({ snapshots = [], formatSnapshotDate }) {
  return (
    <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-paper-border/60 pb-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-core font-semibold">
            Historical Assessment Trends
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-paper-text">
            Genuine Progress Snapshots
          </h3>
        </div>
        <span className="font-mono text-xs text-paper-faint">
          {snapshots.length} recorded milestone(s)
        </span>
      </div>

      {snapshots.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-paper-border bg-paper-surface-2/30 text-center space-y-2">
          <span className="text-2xl">📈</span>
          <h4 className="font-serif font-bold text-base text-paper-text">
            No Historical Snapshots Recorded Yet
          </h4>
          <p className="text-paper-dim text-xs max-w-md mx-auto leading-relaxed">
            We never fabricate simulated historical charts. Snapshots are recorded when you complete
            major milestones (like timed mock interviews or major revision rounds) or when you click{' '}
            <strong>"Save Snapshot"</strong> above.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {snapshots
              .slice(-4)
              .reverse()
              .map((snap, i) => (
                <div
                  key={i}
                  className="bg-paper-surface-2/60 border border-paper-border rounded-xl p-3.5 flex flex-col justify-between gap-2"
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-paper-faint">
                      {formatSnapshotDate ? formatSnapshotDate(snap.calculatedAt) : 'Milestone'}
                    </span>
                    <span
                      className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        snap.status === 'confident'
                          ? 'bg-emerald-100 text-emerald-800'
                          : snap.status === 'provisional'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {snap.status}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif text-2xl font-bold text-paper-text">
                      {snap.overallScore !== null ? snap.overallScore : '—'}
                    </span>
                    <span className="font-mono text-xs text-paper-faint">/ 100</span>
                    <span className="text-xs text-paper-dim font-mono ml-auto">
                      {snap.evidenceCoverage}% ev
                    </span>
                  </div>

                  <p className="text-[11px] text-paper-dim truncate">
                    {snap.scoreExplanation}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
