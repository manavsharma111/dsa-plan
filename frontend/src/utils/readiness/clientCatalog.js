import { patternsData } from '../../data/patternsData'

export const READINESS_CONFIG = {
  WEIGHTS: {
    patternMastery: 25,
    independentSolving: 25,
    delayedRecall: 20,
    mockInterview: 20,
    consistency: 10,
  },
  THRESHOLDS: {
    MIN_SOLVED_PROBLEMS_FOR_SCORE: 10,
    MIN_VERIFIED_INDEPENDENCE: 3,
    MIN_DELAYED_REVIEWS: 2,
    MIN_MOCK_INTERVIEWS: 1,
    FULL_EVIDENCE_TARGETS: {
      solvedProblems: 50,
      activePatterns: 18,
      verifiedIndependence: 25,
      delayedReviews: 12,
      mockInterviews: 3,
      consistencyActiveDays: 12,
    },
    CONFIDENCE_LEVELS: {
      INSUFFICIENT_MAX: 29,
      PROVISIONAL_MAX: 69,
      CONFIDENT_MIN: 70,
    },
  },
}

// Build index maps from patternsData
export const CANONICAL_ID_MAP = new Map()
export const SLUG_MAP = new Map()

patternsData.forEach((pat) => {
  pat.problems.forEach((p) => {
    const item = {
      id: p.id,
      name: p.name,
      slug: p.slug || '',
      patternTitle: pat.title,
    }
    CANONICAL_ID_MAP.set(p.id.toLowerCase(), item)
    if (p.slug) {
      SLUG_MAP.set(p.slug.toLowerCase().trim(), item)
    }
    if (p.name) {
      const clean = p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      SLUG_MAP.set(clean, item)
    }
  })
})

export function resolveCatalogProblem(key) {
  if (!key) return null
  const clean = String(key).trim().toLowerCase()
  if (CANONICAL_ID_MAP.has(clean)) return CANONICAL_ID_MAP.get(clean)
  if (SLUG_MAP.has(clean)) return SLUG_MAP.get(clean)
  const sanitized = clean.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (SLUG_MAP.has(sanitized)) return SLUG_MAP.get(sanitized)
  return null
}

export function canonicalizeProgress(solved = {}, mastery = {}, revision = {}) {
  const canonicalProblems = new Map()
  const allKeys = new Set([
    ...Object.keys(solved || {}),
    ...Object.keys(mastery || {}),
    ...Object.keys(revision || {}),
  ])

  for (const key of allKeys) {
    if (!key) continue
    const matched = resolveCatalogProblem(key)
    const canonicalId = matched ? matched.id : String(key).trim().toLowerCase()
    const patternTitle = matched ? matched.patternTitle : 'General Practice'
    const problemName = matched ? matched.name : key

    const isSolved = Boolean(
      solved[key] ||
        solved[canonicalId] ||
        (matched && matched.slug && solved[matched.slug])
    )
    const rawMastery =
      mastery[canonicalId] ||
      mastery[key] ||
      (matched && matched.slug && mastery[matched.slug]) ||
      null
    const rev =
      revision[canonicalId] ||
      revision[key] ||
      (matched && matched.slug && revision[matched.slug]) ||
      null

    if (!canonicalProblems.has(canonicalId)) {
      canonicalProblems.set(canonicalId, {
        id: canonicalId,
        name: problemName,
        slug: matched ? matched.slug : '',
        patternTitle,
        isSolved,
        mastery: rawMastery,
        revision: rev,
      })
    } else {
      const existing = canonicalProblems.get(canonicalId)
      if (isSolved) existing.isSolved = true
      if (rawMastery && (!existing.mastery || existing.mastery === 'unverified')) {
        existing.mastery = rawMastery
      }
      if (rev && !existing.revision) existing.revision = rev
    }
  }

  const problemList = Array.from(canonicalProblems.values())
  const solvedList = problemList.filter((p) => p.isSolved)

  let verifiedSoloCount = 0
  let verifiedMasteredCount = 0
  let verifiedHintCount = 0
  let unverifiedCount = 0

  for (const p of solvedList) {
    const m = p.mastery
    const hasManualOutcome =
      p.revision &&
      (p.revision.lastOutcome === 'efficient' ||
        p.revision.lastOutcome === 'slow' ||
        p.revision.lastOutcome === 'hint' ||
        p.revision.lastOutcome === 'solution' ||
        p.revision.lastOutcome === 'manual')

    if (m === 'hint' || (p.revision && p.revision.lastOutcome === 'hint')) {
      verifiedHintCount++
    } else if (m === 'mastered') {
      verifiedMasteredCount++
    } else if (m === 'independent' || hasManualOutcome) {
      verifiedSoloCount++
    } else {
      unverifiedCount++
    }
  }

  const verifiedCount = verifiedSoloCount + verifiedMasteredCount + verifiedHintCount
  return {
    allProblems: problemList,
    solvedList,
    uniqueSolvedCount: solvedList.length,
    verifiedSoloCount,
    verifiedMasteredCount,
    verifiedHintCount,
    verifiedCount,
    unverifiedCount,
  }
}
