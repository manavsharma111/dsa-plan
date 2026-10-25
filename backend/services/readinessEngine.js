// Interview Readiness Engine
// Evaluates problem coverage, independent solving, revision retention, mock tests, and practice consistency.

const { READINESS_CONFIG } = require('../config/readinessConfig')
const {
  resolveCatalogProblem,
  canonicalizeProgress,
} = require('./readiness/catalogResolver')
const {
  evaluatePatternMastery,
  evaluateIndependentSolving,
  evaluateDelayedRecall,
  evaluateMockInterviews,
  evaluateConsistency,
} = require('./readiness/pillarEvaluators')
const {
  calculateEvidenceCoverage,
  calculateNormalizedScore,
  categorizePatterns,
} = require('./readiness/scoringNormalizer')
const {
  generateRecommendations,
} = require('./readiness/recommendationEngine')

class ReadinessEngine {
  constructor(config = READINESS_CONFIG) {
    this.config = config
  }

  // Calculates complete readiness assessment based on available user data
  calculateReport({
    solved = {},
    mastery = {},
    revision = {},
    interviews = [],
    patternAnalytics = null,
    now = Date.now(),
    customWeights = null,
  } = {}) {
    const weights = customWeights || this.config.WEIGHTS

    // Deduplicate solved problems against the catalog
    const canonicalProgress = canonicalizeProgress(solved, mastery, revision)

    // Compute individual scores across patterns, solo solves, recall, mocks, and consistency
    const patternComp = evaluatePatternMastery(canonicalProgress)
    const independenceComp = evaluateIndependentSolving(
      canonicalProgress,
      this.config.THRESHOLDS
    )
    const retentionComp = evaluateDelayedRecall(
      canonicalProgress,
      now,
      this.config.THRESHOLDS
    )
    const mockComp = evaluateMockInterviews(interviews, now)
    const consistencyComp = evaluateConsistency(canonicalProgress, interviews, now)

    // Check how much total evidence we have before declaring confidence
    const evidenceCoverage = calculateEvidenceCoverage({
      canonicalProgress,
      patternComp,
      independenceComp,
      retentionComp,
      mockComp,
      consistencyComp,
      targets: this.config.THRESHOLDS.FULL_EVIDENCE_TARGETS,
    })

    // Rebalance weights so inactive features don't drag down the user's score
    const components = {
      patternMastery: {
        ...patternComp,
        nominalWeight: weights.patternMastery,
      },
      independentSolving: {
        ...independenceComp,
        nominalWeight: weights.independentSolving,
      },
      delayedRecall: {
        ...retentionComp,
        nominalWeight: weights.delayedRecall,
      },
      mockInterview: {
        ...mockComp,
        nominalWeight: weights.mockInterview,
      },
      consistency: {
        ...consistencyComp,
        nominalWeight: weights.consistency,
      },
    }

    const {
      overallScore,
      status,
      confidenceLevel,
      normalizedComponents,
      scoreExplanation,
    } = calculateNormalizedScore(
      components,
      evidenceCoverage,
      canonicalProgress,
      this.config.THRESHOLDS
    )

    // Group patterns into strong, emerging, and weak buckets
    const patternBreakdown = categorizePatterns(patternComp.patternsList)

    // Build actionable guidance focused on the biggest improvement areas
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
      status, // 'insufficient_data' | 'provisional' | 'confident'
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
        thresholds: this.config.THRESHOLDS,
      },
    }
  }

  // Internal delegates for test suite compatibility
  _canonicalizeProgress(solved, mastery, revision) {
    return canonicalizeProgress(solved, mastery, revision)
  }

  _evaluatePatternMastery(progress) {
    return evaluatePatternMastery(progress)
  }

  _evaluateIndependentSolving(progress) {
    return evaluateIndependentSolving(progress, this.config.THRESHOLDS)
  }

  _evaluateDelayedRecall(progress, now) {
    return evaluateDelayedRecall(progress, now, this.config.THRESHOLDS)
  }

  _evaluateMockInterviews(interviews, now) {
    return evaluateMockInterviews(interviews, now)
  }

  _evaluateConsistency(progress, interviews, now) {
    return evaluateConsistency(progress, interviews, now)
  }

  _calculateEvidenceCoverage(opts) {
    return calculateEvidenceCoverage({
      ...opts,
      targets: this.config.THRESHOLDS.FULL_EVIDENCE_TARGETS,
    })
  }

  _calculateNormalizedScore(components, evidenceCoverage, canonicalProgress) {
    return calculateNormalizedScore(
      components,
      evidenceCoverage,
      canonicalProgress,
      this.config.THRESHOLDS
    )
  }

  _categorizePatterns(patternsList) {
    return categorizePatterns(patternsList)
  }

  _generateRecommendations(opts) {
    return generateRecommendations(opts)
  }
}

const readinessEngine = new ReadinessEngine()
readinessEngine.ReadinessEngine = ReadinessEngine
readinessEngine.resolveCatalogProblem = resolveCatalogProblem

module.exports = readinessEngine
module.exports.ReadinessEngine = ReadinessEngine
module.exports.resolveCatalogProblem = resolveCatalogProblem
