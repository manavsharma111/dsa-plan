// Client-side Interview Readiness Calculator
// Runs offline in Redux store to calculate real-time readiness benchmarks.


import {
  READINESS_CONFIG,
  canonicalizeProgress,
  resolveCatalogProblem,
} from './readiness/clientCatalog'
import {
  evaluatePatternMastery,
  evaluateIndependentSolving,
  evaluateDelayedRecall,
  evaluateMockInterviews,
  evaluateConsistency,
} from './readiness/clientPillars'
import {
  calculateEvidenceCoverage,
  calculateNormalizedScore,
  categorizePatterns,
} from './readiness/clientScoring'
import { generateRecommendations } from './readiness/clientRecommendations'

export { READINESS_CONFIG, resolveCatalogProblem }

export function calculateClientReadinessReport({
  solved = {},
  mastery = {},
  revision = {},
  interviews = [],
  patternAnalytics = null,
  now = Date.now(),
  customWeights = null,
} = {}) {
  const weights = customWeights || READINESS_CONFIG.WEIGHTS

  // Deduplicate solved problems and tie them to canonical pattern keys
  const canonicalProgress = canonicalizeProgress(solved, mastery, revision)

  // Evaluate the core signals: coverage, independence, retention, mocks, and consistency
  const patternComp = evaluatePatternMastery(canonicalProgress, weights)
  const independenceComp = evaluateIndependentSolving(canonicalProgress, weights)
  const retentionComp = evaluateDelayedRecall(canonicalProgress, now, weights)
  const mockComp = evaluateMockInterviews(interviews, weights)
  const consistencyComp = evaluateConsistency(canonicalProgress, interviews, now, weights)

  // Measure evidence coverage across available inputs
  const evidenceCoverage = calculateEvidenceCoverage({
    canonicalProgress,
    patternComp,
    independenceComp,
    retentionComp,
    mockComp,
    consistencyComp,
  })

  // Normalize component weights so missing sections don't unfairly skew the overall score
  const components = {
    patternMastery: patternComp,
    independentSolving: independenceComp,
    delayedRecall: retentionComp,
    mockInterview: mockComp,
    consistency: consistencyComp,
  }

  const {
    overallScore,
    status,
    confidenceLevel,
    normalizedComponents,
    scoreExplanation,
  } = calculateNormalizedScore(components, evidenceCoverage, canonicalProgress)

  // Sort patterns into strong, emerging, and weak buckets
  const patternBreakdown = categorizePatterns(patternComp.patternsList)

  // Build concrete next steps targeted at the user's biggest gaps
  const recommendations = generateRecommendations({
    canonicalProgress,
    components: normalizedComponents,
    patternBreakdown,
    overallScore,
    status,
    now,
  })

  return {
    overallScore,
    status,
    confidenceLevel,
    evidenceCoverage,
    calculatedAt: new Date(now).toISOString(),
    scoreExplanation,
    components: normalizedComponents,
    metrics: {
      totalCanonicalSolved: canonicalProgress.uniqueSolvedCount,
      verifiedIndependenceCount: canonicalProgress.verifiedCount,
      independentSolveRate: independenceComp.metrics.rawRate,
      delayedRecallReviewsCount: retentionComp.metrics.reviewCount,
      delayedRecallRate: retentionComp.metrics.recallRate,
      mockInterviewsCount: mockComp.metrics.sessionCount,
      mockAverageScore: mockComp.metrics.avgScore,
      activePracticeDaysLast30: consistencyComp.metrics.activeDays30,
      currentDayStreak: consistencyComp.metrics.currentStreak,
    },
    strongestPatterns: patternBreakdown.strongest,
    weakestPatterns: patternBreakdown.weakest,
    insufficientEvidencePatterns: patternBreakdown.insufficientEvidence,
    recommendations,
    configSnapshot: {
      weights,
      thresholds: READINESS_CONFIG.THRESHOLDS,
    },
  }
}
