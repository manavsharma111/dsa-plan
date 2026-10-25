import { READINESS_CONFIG } from './clientCatalog'

export function calculateEvidenceCoverage({
  canonicalProgress,
  patternComp,
  independenceComp,
  retentionComp,
  mockComp,
  consistencyComp,
}) {
  const targets = READINESS_CONFIG.THRESHOLDS.FULL_EVIDENCE_TARGETS

  const ePattern = Math.min(
    1.0,
    (canonicalProgress.uniqueSolvedCount / targets.solvedProblems) * 0.6 +
      (patternComp.metrics.activePatterns / targets.activePatterns) * 0.4
  )
  const eIndependence = Math.min(
    1.0,
    canonicalProgress.verifiedCount / targets.verifiedIndependence
  )
  const eRetention = Math.min(
    1.0,
    retentionComp.metrics.reviewCount / targets.delayedReviews
  )
  const eMock = Math.min(
    1.0,
    mockComp.metrics.sessionCount / targets.mockInterviews
  )
  const eConsistency = Math.min(
    1.0,
    consistencyComp.metrics.activeDays30 / targets.consistencyActiveDays
  )

  const weightedCoverage =
    ePattern * 0.25 +
    eIndependence * 0.25 +
    eRetention * 0.20 +
    eMock * 0.20 +
    eConsistency * 0.10

  return Math.round(weightedCoverage * 100)
}

export function calculateNormalizedScore(components, evidenceCoverage, canonicalProgress) {
  const minProblems = READINESS_CONFIG.THRESHOLDS.MIN_SOLVED_PROBLEMS_FOR_SCORE

  const availableKeys = Object.keys(components).filter(
    (k) => components[k].status === 'available' && typeof components[k].score === 'number'
  )

  const hasMinimumEvidence =
    canonicalProgress.uniqueSolvedCount >= minProblems &&
    availableKeys.length >= 2 &&
    evidenceCoverage >= READINESS_CONFIG.THRESHOLDS.CONFIDENCE_LEVELS.INSUFFICIENT_MAX

  const availableNominalWeightSum = availableKeys.reduce(
    (sum, k) => sum + components[k].nominalWeight,
    0
  )

  const normalizedComponents = {}
  let overallScoreAccumulator = 0

  for (const [key, comp] of Object.entries(components)) {
    if (comp.status === 'available' && typeof comp.score === 'number') {
      const effectiveWeight =
        availableNominalWeightSum > 0
          ? Math.round((comp.nominalWeight / availableNominalWeightSum) * 1000) / 10
          : comp.nominalWeight
      const contribution = Math.round(comp.score * (effectiveWeight / 100))

      if (hasMinimumEvidence) {
        overallScoreAccumulator += comp.score * (comp.nominalWeight / availableNominalWeightSum)
      }

      normalizedComponents[key] = {
        ...comp,
        effectiveWeight,
        contribution: hasMinimumEvidence ? contribution : 0,
      }
    } else {
      normalizedComponents[key] = {
        ...comp,
        effectiveWeight: 0,
        contribution: 0,
      }
    }
  }

  if (!hasMinimumEvidence) {
    return {
      overallScore: null,
      status: 'insufficient_data',
      confidenceLevel: evidenceCoverage,
      normalizedComponents,
      scoreExplanation: `Not enough evidence to calculate an interview readiness score (${evidenceCoverage}% coverage). At least ${minProblems} canonical solved problems, 1 timed mock interview, and 2 spaced revision reviews are required.`,
    }
  }

  const overallScore = Math.min(100, Math.max(0, Math.round(overallScoreAccumulator)))
  const isConfident = evidenceCoverage >= READINESS_CONFIG.THRESHOLDS.CONFIDENCE_LEVELS.CONFIDENT_MIN

  const status = isConfident ? 'confident' : 'provisional'
  const confidenceLevel = evidenceCoverage

  const scoreExplanation = isConfident
    ? `Evidence-backed interview readiness score based on ${evidenceCoverage}% evidence coverage across pattern breadth, verified independent solving, spaced recall, and timed mocks.`
    : `Provisional estimate based on partial evidence (${evidenceCoverage}% coverage). Missing components are excluded, and weights are normalized across active pillars.`

  return {
    overallScore,
    status,
    confidenceLevel,
    normalizedComponents,
    scoreExplanation,
  }
}

export function categorizePatterns(patternsList = []) {
  const attempted = patternsList.filter((p) => p.solvedCount > 0)
  const unattempted = patternsList.filter((p) => p.solvedCount === 0)

  const strongest = [...attempted]
    .filter((p) => p.confidence >= 50)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)

  const weakest = [...attempted]
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .slice(0, 5)

  const insufficientEvidence = [
    ...unattempted,
    ...attempted.filter((p) => p.solvedCount < 2),
  ].slice(0, 8)

  return {
    strongest,
    weakest,
    insufficientEvidence,
  }
}
