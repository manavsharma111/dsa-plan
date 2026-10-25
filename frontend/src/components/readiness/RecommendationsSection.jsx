import React from 'react'

export default function RecommendationsSection({ recommendations = [], onAction }) {
  return (
    <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-paper-border/60 pb-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-core font-semibold">
            Actionable Weakness Diagnosis
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-paper-text">
            Targeted Improvement Plan
          </h3>
        </div>
        <span className="font-mono text-xs text-paper-faint">
          Deterministic rules based strictly on your historical performance
        </span>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8 font-mono text-xs text-paper-dim">
          🎉 No acute weakness detected! Maintain your spaced revision schedule and regular mock interviews.
        </div>
      ) : (
        <div className="space-y-3.5">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <div
              key={rec.id}
              className="bg-paper-surface-2/40 border border-paper-border rounded-xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-paper-border/80 shadow-2xs"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      rec.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-900 border border-rose-200'
                        : rec.priority === 'high'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                    }`}
                  >
                    Priority #{idx + 1} &middot; {rec.category}
                  </span>
                  <span className="font-serif font-bold text-sm sm:text-base text-paper-text">
                    {rec.issue}
                  </span>
                </div>

                <p className="text-paper-dim text-xs sm:text-[13px] leading-relaxed">
                  <strong className="text-paper-text font-medium">Evidence:</strong> {rec.evidence}
                </p>

                <p className="text-paper-dim text-xs sm:text-[13px] leading-relaxed">
                  <strong className="text-paper-text font-medium">Recommended Action:</strong>{' '}
                  {rec.action}
                </p>

                <div className="font-mono text-[11px] text-core font-semibold pt-0.5 flex items-center gap-1.5">
                  <span>🎯 Completion Target:</span>
                  <span>{rec.criterion}</span>
                </div>
              </div>

              <div className="flex-shrink-0 self-stretch md:self-center flex items-center">
                <button
                  type="button"
                  onClick={() => onAction && onAction(rec)}
                  className="w-full md:w-auto font-mono text-xs font-semibold px-4 py-2.5 rounded-xl bg-paper-text text-paper-bg hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Take Action →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
