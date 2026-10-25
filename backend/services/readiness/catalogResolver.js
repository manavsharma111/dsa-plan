const patternsData = require('../../data/patternsData')
const { PROBLEM_CATALOG, resolveProblem } = require('../../config/problemCatalog')

// Normalize patterns list from patternsData
const rawPatterns = Array.isArray(patternsData)
  ? patternsData
  : patternsData.patternsData || []

// Build lookup maps
const CANONICAL_ID_MAP = new Map()
const SLUG_MAP = new Map()

rawPatterns.forEach((pat) => {
  if (Array.isArray(pat.problems)) {
    pat.problems.forEach((p) => {
      const item = {
        id: p.id,
        name: p.name,
        slug: p.slug || '',
        patternTitle: pat.title,
      }
      CANONICAL_ID_MAP.set(String(p.id).toLowerCase(), item)
      if (p.slug) {
        SLUG_MAP.set(String(p.slug).toLowerCase().trim(), item)
      }
      if (p.name) {
        const clean = p.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        SLUG_MAP.set(clean, item)
      }
    })
  }
})

// Fallback to PROBLEM_CATALOG if any extra slugs exist
for (const p of Object.values(PROBLEM_CATALOG)) {
  if (p && p.id && !CANONICAL_ID_MAP.has(String(p.id).toLowerCase())) {
    CANONICAL_ID_MAP.set(String(p.id).toLowerCase(), p)
  }
  if (p && p.slug && !SLUG_MAP.has(String(p.slug).toLowerCase().trim())) {
    SLUG_MAP.set(String(p.slug).toLowerCase().trim(), p)
  }
}

function resolveCatalogProblem(key) {
  if (!key) return null
  const clean = String(key).trim().toLowerCase()
  if (CANONICAL_ID_MAP.has(clean)) return CANONICAL_ID_MAP.get(clean)
  if (SLUG_MAP.has(clean)) return SLUG_MAP.get(clean)
  const sanitized = clean
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (SLUG_MAP.has(sanitized)) return SLUG_MAP.get(sanitized)
  return resolveProblem(key)
}

/**
 * Resolve and deduplicate user progress to canonical problem keys
 * Prevents double-counting problems marked both by slug and id
 * Separates verified manual solves from unverified extension auto-captures
 */
function canonicalizeProgress(solved, mastery, revision) {
  const canonicalProblems = new Map()
  const allKeys = new Set([
    ...Object.keys(solved || {}),
    ...Object.keys(mastery || {}),
    ...Object.keys(revision || {}),
  ])

  for (const key of allKeys) {
    if (!key) continue

    // Resolve problem using catalog
    const matched = resolveCatalogProblem(key)
    const canonicalId = matched ? matched.id : String(key).trim().toLowerCase()
    const patternTitle = matched ? matched.patternTitle : 'General Practice'
    const problemName = matched ? matched.name : key

    // Check if problem is solved
    const isSolved = Boolean(solved[key] || solved[canonicalId] || (matched && matched.slug && solved[matched.slug]))

    // Retrieve mastery level
    const rawMastery = mastery[canonicalId] || mastery[key] || (matched && matched.slug && mastery[matched.slug]) || null

    // Retrieve revision details
    const rev = revision[canonicalId] || revision[key] || (matched && matched.slug && revision[matched.slug]) || null

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
    rawSolved: solved,
    rawMastery: mastery,
    rawRevision: revision,
  }
}

module.exports = {
  rawPatterns,
  CANONICAL_ID_MAP,
  SLUG_MAP,
  resolveCatalogProblem,
  canonicalizeProgress,
}
