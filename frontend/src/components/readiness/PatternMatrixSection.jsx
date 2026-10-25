import React from 'react'

export default function PatternMatrixSection({
  strongestPatterns = [],
  weakestPatterns = [],
  insufficientEvidencePatterns = [],
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Column 1: Strongest Patterns */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-serif font-bold text-base text-emerald-900 mb-3">
            <span>🌟 Strongest Patterns</span>
          </div>
          {strongestPatterns.length === 0 ? (
            <p className="font-mono text-xs text-paper-dim py-4 text-center">
              No patterns reached &gt;=50% confidence yet. Solve more problems independently.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {strongestPatterns.map((p) => (
                <li
                  key={p.title}
                  className="flex justify-between items-center p-2 rounded-lg bg-emerald-50/40 border border-emerald-200/60"
                >
                  <span className="font-serif font-medium text-paper-text">{p.title}</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {p.confidence}% ({p.solvedCount} solved)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Column 2: Weakest Patterns */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-serif font-bold text-base text-amber-900 mb-3">
            <span>⚠️ Most Attention Needed</span>
          </div>
          {weakestPatterns.length === 0 ? (
            <p className="font-mono text-xs text-paper-dim py-4 text-center">
              No weak patterns flagged.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {weakestPatterns.map((p) => (
                <li
                  key={p.title}
                  className="flex justify-between items-center p-2 rounded-lg bg-amber-50/40 border border-amber-200/60"
                >
                  <span className="font-serif font-medium text-paper-text">{p.title}</span>
                  <span className="font-mono font-bold text-amber-900">
                    {p.hintCount > 0 ? `${p.hintCount} hints` : `${p.confidence}% conf`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Column 3: Insufficient Evidence Patterns */}
      <div className="bg-paper-surface border border-paper-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-serif font-bold text-base text-paper-dim mb-3">
            <span>❓ Untouched / Low Evidence</span>
          </div>
          {insufficientEvidencePatterns.length === 0 ? (
            <p className="font-mono text-xs text-paper-dim py-4 text-center">
              All patterns have sufficient benchmark data!
            </p>
          ) : (
            <ul className="space-y-1.5 text-xs">
              {insufficientEvidencePatterns.slice(0, 5).map((p) => (
                <li
                  key={p.title}
                  className="flex justify-between items-center p-1.5 rounded bg-paper-surface-2 text-paper-dim font-mono text-[11px]"
                >
                  <span className="truncate pr-2">{p.title}</span>
                  <span className="text-paper-faint flex-shrink-0">{p.solvedCount} solved</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
