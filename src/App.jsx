import React from 'react';
import Header from './components/Header';
import CloudSync from './components/CloudSync';
import ProgressBar from './components/ProgressBar';
import PatternBreakdown from './components/PatternBreakdown';
import KeyConcepts from './components/KeyConcepts';
import StickyHeader from './components/StickyHeader';
import PatternSection from './components/PatternSection';
import Toast from './components/Toast';
import { patternsData } from './data/patternsData';

export default function App() {
  return (
    <div className="min-h-screen bg-paper-bg text-paper-text font-sans antialiased bg-grid-pattern">
      {/* Sticky Header on Scroll */}
      <StickyHeader />

      {/* Main Container */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pb-20">
        <Header />
        <CloudSync />
        <ProgressBar />
        <PatternBreakdown />
        <KeyConcepts />

        {/* All 28 Patterns */}
        <div className="space-y-4">
          {patternsData.map((pattern) => (
            <PatternSection key={pattern.id} pattern={pattern} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-14 pt-5 border-t-2 border-paper-border font-mono text-xs text-paper-faint flex justify-between items-center flex-wrap gap-2">
          <span>DSA Pattern Master List &middot; 28 patterns</span>
          <span>practice repeatedly &middot; cover all patterns</span>
        </footer>
      </div>

      {/* Global Toast */}
      <Toast />
    </div>
  );
}
