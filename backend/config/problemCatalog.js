// Auto-generated Problem Catalog for Extension <-> Tracker Matching
// Supports full multi-index matching across all 28 patterns and 260 problem occurrences
const path = require('path')
let PATTERNS = []
try {
  PATTERNS = require('../data/patternsData.json')
} catch (e) {
  try {
    PATTERNS = require(path.join(__dirname, '../data/patternsData.json'))
  } catch (err) {
    PATTERNS = []
  }
}

const ID_MAP = new Map()
const SLUG_MAP = new Map()
const TITLE_MAP = new Map()
const LC_MAP = new Map()
const FLAT_CATALOG = {}

function normalize(str) {
  if (!str) return ''
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Build multi-index in memory
PATTERNS.forEach((pattern) => {
  const patternTitle = pattern.title || ''
  if (Array.isArray(pattern.problems)) {
    pattern.problems.forEach((prob) => {
      const entry = {
        ...prob,
        patternTitle,
      }

      // ID Index
      if (prob.id) {
        ID_MAP.set(String(prob.id), entry)
      }

      // Slug Index
      if (prob.slug) {
        const slugKey = normalize(prob.slug)
        if (!SLUG_MAP.has(slugKey)) SLUG_MAP.set(slugKey, [])
        SLUG_MAP.get(slugKey).push(entry)
        FLAT_CATALOG[slugKey] = entry
      }

      // Title Index
      if (prob.name) {
        const titleKey = normalize(prob.name)
        if (!TITLE_MAP.has(titleKey)) TITLE_MAP.set(titleKey, [])
        TITLE_MAP.get(titleKey).push(entry)
        if (!FLAT_CATALOG[titleKey]) FLAT_CATALOG[titleKey] = entry
      }

      // LC Number Index
      if (prob.lc) {
        const numOnly = prob.lc.replace(/[^0-9]/g, '')
        if (numOnly) {
          if (!LC_MAP.has(numOnly)) LC_MAP.set(numOnly, [])
          LC_MAP.get(numOnly).push(entry)
        }
      }
    })
  }
})

/**
 * Resolves ALL matching problem entries across all patterns.
 * Essential for problems appearing in multiple patterns (e.g. Sort Colors in Two Pointers 'c6' & Sorting 'c49').
 */
function resolveAllProblems(query) {
  if (!query) return []
  const raw = String(query).trim()
  const key = normalize(raw)

  // 1. Direct ID match
  if (ID_MAP.has(raw)) {
    const direct = ID_MAP.get(raw)
    // Also include any siblings with same slug
    if (direct.slug && SLUG_MAP.has(normalize(direct.slug))) {
      return SLUG_MAP.get(normalize(direct.slug))
    }
    return [direct]
  }

  // 2. Slug match
  if (SLUG_MAP.has(key)) {
    return SLUG_MAP.get(key)
  }

  // 3. Title match
  if (TITLE_MAP.has(key)) {
    return TITLE_MAP.get(key)
  }

  // 4. LC number match
  const numOnly = raw.replace(/[^0-9]/g, '')
  if (numOnly && LC_MAP.has(numOnly)) {
    return LC_MAP.get(numOnly)
  }

  // 5. Substring / fuzzy search
  for (const [slug, list] of SLUG_MAP.entries()) {
    if (slug.includes(key) || key.includes(slug)) {
      return list
    }
  }

  return []
}

/**
 * Resolves the primary matching problem.
 */
function resolveProblem(query) {
  const matches = resolveAllProblems(query)
  return matches.length > 0 ? matches[0] : null
}

module.exports = {
  PROBLEM_CATALOG: FLAT_CATALOG,
  resolveProblem,
  resolveAllProblems,
}

