import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTotalSolved } from '../store/progressSlice';
import { totalQuestions } from '../data/patternsData';

export default function StickyHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const solvedCount = useSelector(selectTotalSolved);
  const totalCount = totalQuestions;
  const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const exactPct = totalCount > 0 ? ((solvedCount / totalCount) * 100).toFixed(1) : '0.0';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 340) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 bg-[#faf7f5]/95 backdrop-blur-md border-b border-paper-border shadow-md z-40 py-2 transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Meta Info */}
        <div className="flex items-center gap-2.5 whitespace-nowrap text-xs sm:text-sm">
          <span className="font-serif font-semibold text-paper-text flex items-center gap-1.5">
            <img src="/dsa.jpg" alt="DSA" className="w-4 h-4 rounded-full object-cover border border-core/30 flex-shrink-0" />
            DSA Progress
          </span>
          <span className="font-mono text-xs text-paper-dim">
            <b className="text-paper-text font-bold">{solvedCount}</b> / {totalCount}
          </span>
          <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
            pct >= 50 ? 'bg-sage-bg text-sage' : 'bg-core-bg text-core'
          }`}>
            {exactPct}%
          </span>
        </div>

        {/* Mini Progress Bar (Hidden on small mobile) */}
        <div className="hidden sm:block flex-1 max-w-xs h-2 bg-paper-surface-2 rounded-full overflow-hidden border border-paper-border/60">
          <div
            className="h-full bg-gradient-to-r from-core via-[#ea580c] to-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          ></div>
        </div>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          type="button"
          className="font-mono text-[11px] font-semibold px-2.5 sm:px-3 py-1 rounded-md border border-paper-border bg-paper-surface hover:bg-paper-surface-2 text-paper-text hover:text-core transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
          title="Scroll back to top"
        >
          ↑ Top
        </button>
      </div>
    </div>
  );
}
