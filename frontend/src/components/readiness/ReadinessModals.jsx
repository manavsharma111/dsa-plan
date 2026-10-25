import React from 'react'

export function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-paper-text/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-paper-surface border border-paper-border rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-paper-border pb-3">
          <h3 className="font-serif text-xl font-bold text-paper-text flex items-center gap-2">
            <span>⚖️ External Platform Constraints</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-paper-dim hover:text-paper-text font-mono text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="text-xs sm:text-sm text-paper-dim space-y-3 leading-relaxed">
          <p>
            <strong>1. No Direct Code Execution:</strong> DSA Pattern Master does not execute user
            code. Problems are solved on external platforms (LeetCode, GeeksForGeeks).
          </p>
          <p>
            <strong>2. Judge Acceptance ≠ Independent Mastery:</strong> When the Chrome Extension
            auto-captures an "Accepted" verdict, the external judge verified code correctness, but
            not whether the solution was arrived at independently or copied from editorials.
            Therefore, auto-captured submissions are classified as <em>unverified</em> until you
            explicitly log your solve independence or complete a spaced revision checklist.
          </p>
          <p>
            <strong>3. No Fabricated Telemetry:</strong> External platforms do not reveal failed attempts
            or keystroke logs. The engine never invents data that was not legitimately captured.
          </p>
          <p>
            <strong>4. Explainable Calibration:</strong> If a user has not attempted timed mock
            interviews, that component is flagged as unavailable and weights are transparently
            normalized across the active pillars without artificial score inflation.
          </p>
        </div>

        <div className="pt-3 border-t border-paper-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs font-semibold px-4 py-2 rounded-xl bg-paper-text text-paper-bg hover:opacity-90 cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  )
}

export function ComponentDetailModal({ comp, onClose }) {
  if (!comp) return null

  return (
    <div className="fixed inset-0 z-50 bg-paper-text/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-paper-surface border border-paper-border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-paper-border pb-3">
          <h3 className="font-serif text-xl font-bold text-paper-text flex items-center gap-2">
            <span>Pillar Details</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-paper-dim hover:text-paper-text font-mono text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-paper-dim">
          <div className="flex justify-between items-center p-3 rounded-xl bg-paper-surface-2">
            <span className="font-mono text-xs text-paper-dim">Score:</span>
            <span className="font-serif text-xl font-bold text-paper-text">
              {comp.score !== null ? `${comp.score} / 100` : 'Unavailable'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-mono p-2 border-b border-paper-border/60">
            <span>Nominal Target Weight:</span>
            <span className="font-bold">{comp.nominalWeight}%</span>
          </div>

          <div className="flex justify-between items-center text-xs font-mono p-2 border-b border-paper-border/60">
            <span>Effective Normalized Weight:</span>
            <span className="font-bold text-core">{comp.effectiveWeight}%</span>
          </div>

          <div className="flex justify-between items-center text-xs font-mono p-2 border-b border-paper-border/60">
            <span>Calculated Contribution:</span>
            <span className="font-bold text-emerald-700">+{comp.contribution || 0} pts</span>
          </div>

          <p className="p-3 rounded-xl bg-paper-surface-2 text-xs leading-relaxed">
            {comp.explanation}
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs font-semibold px-4 py-2 rounded-xl bg-paper-text text-paper-bg hover:opacity-90 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
