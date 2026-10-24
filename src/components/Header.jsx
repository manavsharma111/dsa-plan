import React from 'react'
import { useSelector } from 'react-redux'
import { selectTotalSolved } from '../store/progressSlice'
import { totalQuestions } from '../data/patternsData'

export default function Header() {
  const solvedCount = useSelector(selectTotalSolved)
  const todoCount = totalQuestions - solvedCount

  return (
    <header className="pt-10 pb-6 md:pt-13 md:pb-7 border-b-2 border-paper-border mb-2">
      {/* Kicker */}
      <div className="font-mono text-xs tracking-widest uppercase text-core mb-4 flex items-center gap-2">
        <img
          src="/dsa.jpg"
          alt="DSA"
          className="w-5 h-5 rounded-full object-cover border border-core/30 flex-shrink-0"
        />
        <span className="inline-block w-4 h-[2px] bg-core"></span>
        <span>DSA &middot; Must-Practice Master List</span>
      </div>

      {/* Main Heading */}
      <h1 className="font-serif font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight mb-4 tracking-tight">
        DSA <em className="italic text-core not-italic font-semibold">Pattern</em> Master List
      </h1>

      {/* Subtitle */}
      <p className="text-sm md:text-base text-paper-dim max-w-3xl mb-6 leading-relaxed">
        The questions to practice again and again &mdash; one heading per pattern, covering
        everything a company can ask. Built from the Striver A2Z and Love Babbar sheets,
        cross-checked with what you have already solved. Tick each one as you revise it.
      </p>

      {/* Hero Stats */}
      <div className="flex gap-6 sm:gap-8 flex-wrap">
        <div>
          <div className="font-mono text-xl sm:text-2xl font-semibold">28</div>
          <div className="font-mono text-[10px] tracking-wider uppercase text-paper-faint">
            Patterns
          </div>
        </div>
        <div>
          <div className="font-mono text-xl sm:text-2xl font-semibold">{totalQuestions}</div>
          <div className="font-mono text-[10px] tracking-wider uppercase text-paper-faint">
            Must-practice Qs
          </div>
        </div>
        <div>
          <div className="font-mono text-xl sm:text-2xl font-semibold text-sage">{solvedCount}</div>
          <div className="font-mono text-[10px] tracking-wider uppercase text-paper-faint">
            Solved / Revise
          </div>
        </div>
        <div>
          <div className="font-mono text-xl sm:text-2xl font-semibold text-core">{todoCount}</div>
          <div className="font-mono text-[10px] tracking-wider uppercase text-paper-faint">
            To do
          </div>
        </div>
      </div>

      {/* Tags Legend */}
      <div className="flex gap-3 sm:gap-4 flex-wrap mt-6 text-xs text-paper-dim items-center">
        <span className="font-mono font-medium">Tags:</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9.5px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full text-sage bg-sage-bg">
            done
          </span>
          <span>= you already solved it (revise)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9.5px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full text-blue bg-blue-bg">
            Striver
          </span>
          <span>= in Striver A2Z</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9.5px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full text-gold bg-gold-bg">
            Babbar
          </span>
          <span>= in Love Babbar 450</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9.5px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full text-core bg-core-bg">
            Plan
          </span>
          <span>= in your Pattern-Mastery Plan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9.5px] font-semibold tracking-wide px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-300">
            GFG
          </span>
          <span>= Free GeeksforGeeks alternative (unlocks LC Premium)</span>
        </div>
      </div>
    </header>
  )
}
