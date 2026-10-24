import React from 'react';
import { useSelector } from 'react-redux';
import { selectTotalSolved } from '../store/progressSlice';
import { totalQuestions } from '../data/patternsData';

export default function ProgressBar() {
  const solvedCount = useSelector(selectTotalSolved);
  const totalCount = totalQuestions;
  const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const exactPct = totalCount > 0 ? ((solvedCount / totalCount) * 100).toFixed(1) : '0.0';
  const remaining = totalCount - solvedCount;

  // Dynamic motivational quote
  const getMotivation = () => {
    if (solvedCount === 0) return 'Tick questions as you revise them!';
    if (pct < 25) return 'Great start! Consistency is key 🔥';
    if (pct < 50) return 'Solid momentum! Keep pushing 💪';
    if (pct < 75) return 'Halfway mark crossed! Revision is locking in 🚀';
    if (pct < 100) return 'Almost at the finish line! Final stretch 🌟';
    return `🏆 All ${totalCount} questions revised! Master level achieved!`;
  };

  return (
    <div className="bg-paper-surface border border-paper-border rounded-xl p-4 sm:p-5 my-4 sm:my-6 shadow-sm">
      <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2 font-serif text-base sm:text-lg font-semibold text-paper-text">
          <svg className="w-5 h-5 text-core" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <span>Revision Progress</span>
          <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors ${
            pct >= 50 ? 'bg-sage-bg text-sage' : 'bg-core-bg text-core'
          }`}>
            {exactPct}%
          </span>
        </div>
        <div className="font-mono text-xs sm:text-sm text-paper-dim">
          Solved <b className="text-paper-text font-bold text-sm sm:text-base">{solvedCount}</b> of <b className="text-paper-text">{totalCount}</b> questions
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-3.5 bg-paper-surface-2 rounded-full overflow-hidden relative border border-paper-border/50 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-core via-[#ea580c] via-gold to-emerald-600 rounded-full transition-all duration-700 ease-out relative shadow-[0_0_10px_rgba(194,65,12,0.3)]"
          style={{ width: `${pct}%` }}
        >
          {/* Shimmer Light Beam */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer rounded-full"></div>
        </div>
      </div>

      {/* Milestones */}
      <div className="flex justify-between mt-1.5 px-0.5 font-mono text-[10px] text-paper-faint">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>

      {/* Motivation & Remaining */}
      <div className="flex justify-between items-center flex-wrap gap-1.5 mt-2.5 text-xs text-paper-dim">
        <span className="italic">{getMotivation()}</span>
        <span className="font-mono text-xs text-core font-semibold">
          {remaining > 0 ? `${remaining} to go` : `🎉 All ${totalCount} completed!`}
        </span>
      </div>
    </div>
  );
}
