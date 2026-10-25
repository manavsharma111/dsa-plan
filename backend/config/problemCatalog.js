// Auto-generated Problem Catalog for Extension <-> Tracker Matching
const PROBLEM_CATALOG = require('./problemCatalog.json')

function resolveProblem(slugOrTitle) {
  if (!slugOrTitle) return null
  const key = String(slugOrTitle)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return (
    PROBLEM_CATALOG[key] ||
    PROBLEM_CATALOG[String(slugOrTitle).toLowerCase().trim()] ||
    null
  )
}

module.exports = {
  PROBLEM_CATALOG,
  resolveProblem,
}
