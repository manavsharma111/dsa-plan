import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsSolved, toggleProblem, autoSaveToCloud } from '../store/progressSlice';

export default function ProblemItem({ problem }) {
  const dispatch = useDispatch();
  const isSolved = useSelector(selectIsSolved(problem.id));

  const handleChange = () => {
    dispatch(toggleProblem(problem.id));
    dispatch(autoSaveToCloud());
  };

  // Difficulty badge styling
  const getDifficultyBadge = (df) => {
    switch (df) {
      case 'E':
        return <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded text-sage bg-sage-bg">E</span>;
      case 'H':
        return <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded text-core bg-core-bg">H</span>;
      case 'M':
      default:
        return <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded text-gold bg-gold-bg">M</span>;
    }
  };

  // Tag pill styling
  const getTagPill = (tag, idx) => {
    switch (tag) {
      case 'done':
        return <span key={idx} className="font-mono text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-sage bg-sage-bg">done</span>;
      case 'Striver':
        return <span key={idx} className="font-mono text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-blue bg-blue-bg">Striver</span>;
      case 'Babbar':
        return <span key={idx} className="font-mono text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-gold bg-gold-bg">Babbar</span>;
      case 'Plan':
        return <span key={idx} className="font-mono text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-core bg-core-bg">Plan</span>;
      default:
        return <span key={idx} className="font-mono text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full text-paper-dim bg-paper-surface-2">{tag}</span>;
    }
  };

  return (
    <li className={`flex items-center gap-2.5 sm:gap-3 bg-paper-surface border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm transition-all ${
      isSolved ? 'border-sage/40 bg-sage-bg/10' : 'border-paper-border hover:border-paper-border/80'
    }`}>
      {/* Checkbox */}
      <input
        type="checkbox"
        id={problem.id}
        checked={isSolved}
        onChange={handleChange}
        className="w-[18px] h-[18px] sm:w-[19px] sm:h-[19px] accent-sage cursor-pointer flex-shrink-0 rounded"
      />

      {/* Problem Title */}
      <label htmlFor={problem.id} className={`flex-1 min-w-0 cursor-pointer select-none leading-snug break-words ${
        isSolved ? 'line-through text-paper-dim' : 'text-paper-text font-medium'
      }`}>
        {problem.name}
      </label>

      {/* Meta Pills */}
      <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
        {problem.lc && problem.lc !== '—' && (
          <span className="font-mono text-[11px] text-paper-faint">{problem.lc}</span>
        )}
        {getDifficultyBadge(problem.difficulty)}
        {problem.tags && problem.tags.map((tag, i) => getTagPill(tag, i))}
      </div>
    </li>
  );
}
