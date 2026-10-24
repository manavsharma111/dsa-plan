import React, { Suspense } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Header from './components/Header'
import CloudSync from './components/CloudSync'
import ProgressBar from './components/ProgressBar'
import FeatureBar from './components/FeatureBar'
import PatternBreakdown from './components/PatternBreakdown'
import KeyConcepts from './components/KeyConcepts'
import StickyHeader from './components/StickyHeader'
import PatternSection from './components/PatternSection'
import Toast from './components/Toast'
import { patternsData } from './data/patternsData'
import {
  selectActiveTab,
  selectExtensionModalOpen,
  setExtensionModalOpen,
} from './store/progressSlice'

// Dynamic lazy imports for non-critical views and modals to slash initial JS bundle
const SpacedRevisionSection = React.lazy(() => import('./components/SpacedRevisionSection'))
const WeakPatternAnalytics = React.lazy(() => import('./components/WeakPatternAnalytics'))
const InterviewAnalysisSection = React.lazy(() => import('./components/InterviewAnalysisSection'))
const InterviewModeModal = React.lazy(() => import('./components/InterviewModeModal'))
const RevisionChecklistModal = React.lazy(() => import('./components/RevisionChecklistModal'))
const ExtensionGuideModal = React.lazy(() => import('./components/ExtensionGuideModal'))

export default function App() {
  const dispatch = useDispatch()
  const activeTab = useSelector(selectActiveTab)
  const isExtensionOpen = useSelector(selectExtensionModalOpen)

  return (
    <div className="min-h-screen bg-paper-bg text-paper-text font-sans antialiased bg-grid-pattern">
      {/* Sticky Header on Scroll */}
      <StickyHeader />

      {/* Main Container */}
      <main id="main-content" className="max-w-[1000px] mx-auto px-3.5 sm:px-6 pb-24 sm:pb-20">
        <Header />
        <CloudSync />
        <ProgressBar />
        <FeatureBar />

        {/* View 1: Spaced Revision View */}
        <Suspense fallback={<div className="py-8 text-center font-mono text-xs text-paper-dim">Loading section...</div>}>
          {activeTab === 'revision' && <SpacedRevisionSection />}
          {activeTab === 'analytics' && <WeakPatternAnalytics />}
          {activeTab === 'interviews' && <InterviewAnalysisSection />}
        </Suspense>

        {/* View 4: All 28 Patterns Master View */}
        {activeTab === 'all' && (
          <>
            <PatternBreakdown />
            <KeyConcepts />

            {/* All 28 Patterns */}
            <div className="space-y-4">
              {patternsData.map((pattern) => (
                <PatternSection key={pattern.id} pattern={pattern} />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-14 pt-6 border-t-2 border-paper-border font-mono text-xs text-paper-faint flex flex-col sm:flex-row justify-between items-center gap-2.5">
          <span>DSA Pattern Master List &middot; 28 Patterns &middot; 260 Questions</span>
          <span>
            Built by <strong className="text-paper-text font-medium">Manav Sharma</strong> &middot;
            &copy; 2026 All Rights Reserved
          </span>
        </footer>
      </main>

      {/* Lazy Modals (Rendered only on-demand) */}
      <Suspense fallback={null}>
        <InterviewModeModal />
        <RevisionChecklistModal />
        <ExtensionGuideModal
          isOpen={isExtensionOpen}
          onClose={() => dispatch(setExtensionModalOpen(false))}
        />
      </Suspense>

      {/* Global Toast */}
      <Toast />
    </div>
  )
}
