// Central configuration for readiness score weights and thresholds

const READINESS_CONFIG = {
  // Base weights summing to 100
  WEIGHTS: {
    patternMastery: 25,
    independentSolving: 25,
    delayedRecall: 20,
    mockInterview: 20,
    consistency: 10,
  },

  // Minimum data points needed before activating components
  THRESHOLDS: {
    MIN_SOLVED_PROBLEMS_FOR_SCORE: 10,
    MIN_VERIFIED_INDEPENDENCE: 3,
    MIN_DELAYED_REVIEWS: 2,
    MIN_MOCK_INTERVIEWS: 1,

    // Targets for full evidence coverage in each dimension
    FULL_EVIDENCE_TARGETS: {
      solvedProblems: 50,
      activePatterns: 18,
      verifiedIndependence: 25,
      delayedReviews: 12,
      mockInterviews: 3,
      consistencyActiveDays: 12,
    },

    // Confidence tiers based on coverage percentage
    CONFIDENCE_LEVELS: {
      INSUFFICIENT_MAX: 29, // Under 30%: insufficient data
      PROVISIONAL_MAX: 69,  // 30% - 69%: provisional estimate
      CONFIDENT_MIN: 70,    // 70%+: confident benchmark
    },
  },

  TOTAL_PATTERNS: 28,
  TOTAL_CANONICAL_PROBLEMS: 260,

  // Spaced revision intervals (in days)
  REVISION_INTERVALS_DAYS: [1, 3, 7, 14, 28],
}

module.exports = { READINESS_CONFIG }
