import React, { Suspense, lazy } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import CloudSync from './components/CloudSync'
import ProgressBar from './components/ProgressBar'
import FeatureBar from './components/FeatureBar'
import StickyHeader from './components/StickyHeader'
import PatternsMasterView from './components/PatternsMasterView'
import Toast from './components/Toast'
import {
  selectExtensionModalOpen,
  setExtensionModalOpen,
} from './store/progressSlice'

// Dynamic lazy imports for non-critical views and modals to slash initial JS bundle
const SpacedRevisionSection = lazy(() => import('./components/SpacedRevisionSection'))
const WeakPatternAnalytics = lazy(() => import('./components/WeakPatternAnalytics'))
const InterviewAnalysisSection = lazy(() => import('./components/InterviewAnalysisSection'))
const ReadinessDashboard = lazy(() => import('./components/ReadinessDashboard'))
const InterviewModeModal = lazy(() => import('./components/InterviewModeModal'))
const RevisionChecklistModal = lazy(() => import('./components/RevisionChecklistModal'))
const ExtensionGuideModal = lazy(() => import('./components/ExtensionGuideModal'))

export default function App() {
  const dispatch = useDispatch()
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

        {/* Feature Views via React Router */}
        <Suspense
          fallback={
            <div className="py-12 text-center font-mono text-xs text-paper-dim flex flex-col items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-core border-t-transparent rounded-full animate-spin" />
              <span>Loading section...</span>
            </div>
          }
        >
          <Routes>
            {/* Master Patterns View */}
            <Route path="/" element={<PatternsMasterView />} />
            <Route path="/patterns" element={<PatternsMasterView />} />
            <Route path="/pattern/:patternId" element={<PatternsMasterView />} />

            {/* Standalone Route Views */}
            <Route path="/readiness" element={<ReadinessDashboard />} />
            <Route path="/revision" element={<SpacedRevisionSection />} />
            <Route path="/analytics" element={<WeakPatternAnalytics />} />
            <Route path="/weak-patterns" element={<Navigate to="/analytics" replace />} />
            <Route path="/interviews" element={<InterviewAnalysisSection />} />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

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
