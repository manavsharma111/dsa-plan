import React from 'react'

export default function ComponentCard({ title, icon, comp, stats = [], onClickDetail }) {
  const isAvailable = comp.status === 'available' && typeof comp.score === 'number'

  return (
    <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 flex flex-col justify-between shadow-2xs transition-all hover:border-paper-border/80">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h4 className="font-serif font-bold text-base text-paper-text">{title}</h4>
          </div>
          <span
            className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-paper-surface-2 text-paper-faint border-paper-border'
            }`}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span className="font-serif text-3xl font-bold text-paper-text">
            {isAvailable ? comp.score : '—'}
          </span>
          <span className="font-mono text-xs text-paper-faint">/ 100</span>
          {isAvailable && (
            <span className="font-mono text-xs text-emerald-700 font-semibold ml-auto">
              +{comp.contribution} pts
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-paper-surface-2 h-1.5 rounded-full overflow-hidden border border-paper-border mb-3">
          <div
            className="h-full bg-paper-text transition-all duration-500"
            style={{ width: `${comp.score || 0}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="space-y-1.5 text-[11px] font-mono border-t border-paper-border/60 pt-2.5 mb-3">
          <div className="flex justify-between text-paper-dim">
            <span>Nominal / Effective:</span>
            <span className="font-bold text-paper-text">
              {comp.nominalWeight}% → <strong className="text-core">{comp.effectiveWeight}%</strong>
            </span>
          </div>
          {stats.map((s, idx) => (
            <div key={idx} className="flex justify-between text-paper-dim">
              <span>{s.label}:</span>
              <span className="font-semibold text-paper-text">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-paper-border/60 flex items-center justify-between">
        <button
          type="button"
          onClick={onClickDetail}
          className="font-mono text-xs text-core hover:underline cursor-pointer flex items-center gap-1 font-semibold"
        >
          <span>View formula breakdown →</span>
        </button>
      </div>
    </div>
  )
}
