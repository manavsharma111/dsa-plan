const test = require('node:test')
const assert = require('node:assert/strict')
const readinessEngine = require('../services/readinessEngine')
const { ReadinessEngine } = require('../services/readinessEngine')
const { READINESS_CONFIG } = require('../config/readinessConfig')



test('Readiness Engine Test Suite', async (t) => {
  await t.test('1. Insufficient Evidence Scenario: User with 3 solved problems', () => {
    const report = readinessEngine.calculateReport({
      solved: { c1: true, c2: true, c3: true },
      mastery: { c1: 'independent', c2: 'independent', c3: 'hint' },
      revision: {},
      interviews: [],
    })

    assert.equal(report.overallScore, null, 'Score must be null when evidence is insufficient')
    assert.equal(report.status, 'insufficient_data', 'Status must be insufficient_data')
    assert.ok(report.confidenceLevel < 35, 'Confidence level must be below 35%')
    assert.match(report.scoreExplanation, /Not enough evidence/i)
    assert.equal(report.metrics.totalCanonicalSolved, 3)

    // Components that lack data must be marked appropriately
    assert.equal(report.components.mockInterview.status, 'unavailable')
    assert.equal(report.components.delayedRecall.status, 'unavailable')

    // Must generate initial benchmark recommendation
    const benchmarkRec = report.recommendations.find((r) => r.id === 'rec_establish_benchmark')
    assert.ok(benchmarkRec, 'Must output rec_establish_benchmark recommendation')
  })

  await t.test('2. Weight Normalization with Missing Components (No Mock Interviews)', () => {
    // User with 20 solved problems, 15 verified, 6 revisions, but 0 mock interviews
    const solved = {}
    const mastery = {}
    const revision = {}
    const now = Date.now()

    for (let i = 1; i <= 20; i++) {
      const id = `c${i}`
      solved[id] = true
      mastery[id] = i % 4 === 0 ? 'hint' : 'independent'
      if (i <= 6) {
        revision[id] = {
          stage: 2,
          count: 2,
          lastRevised: now - 3 * 86400000,
          nextDue: now + 5 * 86400000, // Not overdue
          lastOutcome: 'efficient',
          history: [
            { date: now - 4 * 86400000, outcome: 'initial' },
            { date: now - 1 * 86400000, outcome: 'efficient' },
          ],
        }
      }
    }

    const report = readinessEngine.calculateReport({
      solved,
      mastery,
      revision,
      interviews: [],
      now,
    })

    // Mock interviews component is unavailable
    assert.equal(report.components.mockInterview.status, 'unavailable')
    assert.equal(report.components.mockInterview.effectiveWeight, 0)

    // Other 4 components must have normalized effective weights summing to 100%
    const activeComponents = ['patternMastery', 'independentSolving', 'delayedRecall', 'consistency']
    const sumEffectiveWeights = activeComponents.reduce(
      (sum, key) => sum + report.components[key].effectiveWeight,
      0
    )

    // Sum should be 100 (+/- 0.5 for rounding)
    assert.ok(
      Math.abs(sumEffectiveWeights - 100) <= 0.5,
      `Normalized effective weights must sum to 100%, got ${sumEffectiveWeights}`
    )

    assert.equal(typeof report.overallScore, 'number', 'Overall score should be computed when minimum evidence is met')
    assert.ok(report.overallScore > 0 && report.overallScore <= 100)
    assert.equal(report.status, 'provisional', 'Status should be provisional when mocks are absent')
  })

  await t.test('3. Full Evidence Scenario: Strong User with all pillars active', () => {
    const solved = {}
    const mastery = {}
    const revision = {}
    const now = Date.now()

    // 40 solved problems across patterns
    for (let i = 1; i <= 40; i++) {
      const id = `c${i}`
      solved[id] = true
      mastery[id] = i % 8 === 0 ? 'hint' : i % 5 === 0 ? 'mastered' : 'independent'

      if (i <= 15) {
        revision[id] = {
          stage: 3,
          count: 3,
          lastRevised: now - 2 * 86400000,
          nextDue: now + 7 * 86400000,
          lastOutcome: 'efficient',
          history: [
            { date: now - 14 * 86400000, outcome: 'initial' },
            { date: now - 7 * 86400000, outcome: 'efficient' },
            { date: now - 2 * 86400000, outcome: 'efficient' },
          ],
        }
      }
    }

    const interviews = [
      {
        id: 'inv_1',
        title: 'Mock Interview 1',
        durationMinutes: 45,
        timeTakenSeconds: 2200,
        totalProblems: 2,
        solvedProblems: 2,
        startedAt: now - 7 * 86400000,
        problems: [
          { id: 'c1', name: 'P1', solved: true },
          { id: 'c2', name: 'P2', solved: true },
        ],
      },
      {
        id: 'inv_2',
        title: 'Mock Interview 2',
        durationMinutes: 60,
        timeTakenSeconds: 3100,
        totalProblems: 3,
        solvedProblems: 3,
        startedAt: now - 2 * 86400000,
        problems: [
          { id: 'c3', name: 'P3', solved: true },
          { id: 'c4', name: 'P4', solved: true },
          { id: 'c5', name: 'P5', solved: true },
        ],
      },
      {
        id: 'inv_3',
        title: 'Mock Interview 3',
        durationMinutes: 45,
        timeTakenSeconds: 2400,
        totalProblems: 2,
        solvedProblems: 2,
        startedAt: now - 1 * 86400000,
        problems: [
          { id: 'c6', name: 'P6', solved: true },
          { id: 'c7', name: 'P7', solved: true },
        ],
      },
    ]

    const report = readinessEngine.calculateReport({
      solved,
      mastery,
      revision,
      interviews,
      now,
    })

    assert.equal(typeof report.overallScore, 'number')
    assert.ok(report.overallScore >= 75, `Expected strong score >= 75, got ${report.overallScore}`)
    assert.ok(report.confidenceLevel >= 70, `Expected high confidence >= 70%, got ${report.confidenceLevel}%`)
    assert.equal(report.status, 'confident')

    // All 5 components must be available
    assert.equal(report.components.patternMastery.status, 'available')
    assert.equal(report.components.independentSolving.status, 'available')
    assert.equal(report.components.delayedRecall.status, 'available')
    assert.equal(report.components.mockInterview.status, 'available')
    assert.equal(report.components.consistency.status, 'available')
  })

  await t.test('4. Problem Deduplication: Multiple attempts and slug/id duplicates', () => {
    // Problem c1 is represented both by id 'c1' and slug 'two-sum-ii-input-array-is-sorted'
    const solved = {
      c1: true,
      'two-sum-ii-input-array-is-sorted': true,
      c2: true,
      '3sum': true,
    }
    const mastery = {
      c1: 'independent',
      'two-sum-ii-input-array-is-sorted': 'independent',
      c2: 'independent',
    }

    const report = readinessEngine.calculateReport({
      solved,
      mastery,
      revision: {},
      interviews: [],
    })

    // Canonical solved count must be 2, not 4!
    assert.equal(
      report.metrics.totalCanonicalSolved,
      2,
      `Duplicate representations of c1 and c2 should be deduplicated to 2, got ${report.metrics.totalCanonicalSolved}`
    )
  })

  await t.test('5. Unverified Extension Submissions vs Verified Solves', () => {
    // 10 problems solved via extension (mastery: 'unverified')
    // 5 problems verified manually (mastery: 'independent')
    const solved = {}
    const mastery = {}

    for (let i = 1; i <= 10; i++) {
      solved[`c${i}`] = true
      mastery[`c${i}`] = 'unverified'
    }
    for (let i = 11; i <= 15; i++) {
      solved[`c${i}`] = true
      mastery[`c${i}`] = 'independent'
    }

    const report = readinessEngine.calculateReport({
      solved,
      mastery,
      revision: {},
      interviews: [],
    })

    assert.equal(report.metrics.totalCanonicalSolved, 15)
    assert.equal(report.metrics.verifiedIndependenceCount, 5)
    assert.equal(report.components.independentSolving.metrics.unverifiedCount, 10)
    assert.equal(report.components.independentSolving.metrics.independentCount, 5)
  })

  await t.test('6. Delayed Recall: Overdue Revisions Penalty and Stage Progression', () => {
    const solved = {}
    const revision = {}
    const now = Date.now()

    // 10 problems with 8 of them overdue
    for (let i = 1; i <= 10; i++) {
      const id = `c${i}`
      solved[id] = true
      revision[id] = {
        stage: 1,
        count: 1,
        lastRevised: now - 10 * 86400000,
        nextDue: i <= 8 ? now - 5 * 86400000 : now + 5 * 86400000, // 8 overdue
        lastOutcome: 'efficient',
        history: [
          { date: now - 10 * 86400000, outcome: 'initial' },
          { date: now - 5 * 86400000, outcome: 'efficient' },
        ],
      }
    }

    const reportWithOverdue = readinessEngine.calculateReport({
      solved,
      mastery: {},
      revision,
      interviews: [],
      now,
    })

    assert.equal(reportWithOverdue.components.delayedRecall.metrics.overdueCount, 8)
    assert.ok(
      reportWithOverdue.components.delayedRecall.metrics.overduePenaltyPct > 0,
      'Overdue revisions must incur retention decay penalty'
    )

    // Trigger Recommendation for overdue recall decay
    const decayRec = reportWithOverdue.recommendations.find(
      (r) => r.id === 'rec_delayed_recall_decay'
    )
    assert.ok(decayRec, 'Must generate rec_delayed_recall_decay recommendation')
  })

  await t.test('7. Timed Mock Interview Evaluation: Penalty for Time Overrun and Incompletion', () => {
    const now = Date.now()
    const mockSessions = [
      {
        id: 'bad_mock_1',
        durationMinutes: 30,
        timeTakenSeconds: 2700, // 45m (overtime by 15m)
        totalProblems: 2,
        solvedProblems: 0, // Incomplete
        startedAt: now - 86400000,
      },
    ]

    const report = readinessEngine.calculateReport({
      solved: { c1: true, c2: true },
      interviews: mockSessions,
      now,
    })

    const mockMetrics = report.components.mockInterview.metrics
    assert.equal(mockMetrics.sessionCount, 1)
    assert.equal(mockMetrics.avgScore, 0)
    assert.equal(mockMetrics.skippedQuestions, 2)
    assert.ok(report.components.mockInterview.score < 30)
  })

  await t.test('8. Deterministic Weakness Diagnosis: Hint Dependency Rule', () => {
    const solved = {}
    const mastery = {}
    for (let i = 1; i <= 10; i++) {
      solved[`c${i}`] = true
      mastery[`c${i}`] = i <= 6 ? 'hint' : 'independent' // 60% hint rate
    }

    const report = readinessEngine.calculateReport({
      solved,
      mastery,
      revision: {},
      interviews: [],
    })

    const hintRec = report.recommendations.find((r) => r.id === 'rec_hint_dependency')
    assert.ok(hintRec, 'Must trigger rec_hint_dependency when hint rate is high')
    assert.match(hintRec.evidence, /hint/i)
    assert.ok(hintRec.criterion, 'Recommendation must have measurable criterion')
  })

  await t.test('9. Zero Denominators and Boundary Conditions', () => {
    // Completely empty inputs
    const emptyReport = readinessEngine.calculateReport({})
    assert.equal(emptyReport.overallScore, null)
    assert.equal(emptyReport.status, 'insufficient_data')
    assert.equal(emptyReport.evidenceCoverage, 0)

    // Malformed interview session with 0 problems
    const zeroInvReport = readinessEngine.calculateReport({
      solved: { c1: true },
      interviews: [{ totalProblems: 0, solvedProblems: 0 }],
    })
    assert.equal(zeroInvReport.components.mockInterview.status, 'unavailable')
  })

  await t.test('10. Recommendation Schema Integrity', () => {
    const report = readinessEngine.calculateReport({
      solved: { c1: true, c2: true, c3: true, c4: true, c5: true },
      mastery: { c1: 'hint', c2: 'hint', c3: 'hint', c4: 'hint', c5: 'hint' },
      revision: {
        c1: { stage: 1, nextDue: Date.now() - 1000, history: [{ outcome: 'hint' }] },
      },
      interviews: [],
    })

    assert.ok(report.recommendations.length > 0, 'Must produce recommendations')
    for (const rec of report.recommendations) {
      assert.ok(rec.id, 'Recommendation must have an id')
      assert.ok(rec.issue, 'Recommendation must have an issue')
      assert.ok(rec.evidence, 'Recommendation must have evidence')
      assert.ok(rec.action, 'Recommendation must have an action')
      assert.ok(Array.isArray(rec.patterns), 'Recommendation must have patterns array')
      assert.ok(rec.criterion, 'Recommendation must have a measurable criterion')
    }
  })

  await t.test('11. Exact Minimum Evidence Boundary: Transition from Insufficient to Provisional', () => {
    const now = Date.now()
    // Exactly 9 problems in 1 pattern -> Insufficient Data
    const solved9 = {}
    for (let i = 1; i <= 9; i++) solved9[`c${i}`] = true
    const report9 = readinessEngine.calculateReport({ solved: solved9, now })
    assert.equal(report9.status, 'insufficient_data')
    assert.equal(report9.overallScore, null)

    // Expand to 15 problems across 3 patterns + 3 revisions + 1 mock interview
    const solved15 = {}
    for (let i = 1; i <= 5; i++) solved15[`c${i}`] = true // Two Pointers
    for (let i = 11; i <= 15; i++) solved15[`c${i}`] = true // Sliding Window
    for (let i = 21; i <= 25; i++) solved15[`c${i}`] = true // Fast Slow

    const mastery15 = {}
    for (const id of Object.keys(solved15)) mastery15[id] = 'independent'

    const revision15 = {
      c1: { stage: 2, count: 2, history: [{ outcome: 'initial' }, { outcome: 'efficient' }] },
      c2: { stage: 2, count: 2, history: [{ outcome: 'initial' }, { outcome: 'efficient' }] },
      c11: { stage: 2, count: 2, history: [{ outcome: 'initial' }, { outcome: 'efficient' }] },
    }

    const interviews15 = [
      { id: 'mock1', durationMinutes: 30, timeTakenSeconds: 1500, totalProblems: 2, solvedProblems: 2, startedAt: now - 86400000 },
    ]

    const report15 = readinessEngine.calculateReport({
      solved: solved15,
      mastery: mastery15,
      revision: revision15,
      interviews: interviews15,
      now,
    })

    assert.equal(report15.status, 'provisional', 'Should transition to provisional estimate once minimum threshold is met')
    assert.equal(typeof report15.overallScore, 'number')
    assert.ok(report15.overallScore > 0)
  })

  await t.test('12. Custom Centralized Weights Configuration', () => {
    const customWeights = {
      patternMastery: 50,
      independentSolving: 20,
      delayedRecall: 10,
      mockInterview: 10,
      consistency: 10,
    }

    const solved = {}
    for (let i = 1; i <= 15; i++) solved[`c${i}`] = true

    const report = readinessEngine.calculateReport({
      solved,
      customWeights,
    })

    assert.equal(report.components.patternMastery.nominalWeight, 50)
    assert.equal(report.components.independentSolving.nominalWeight, 20)
  })

  await t.test('13. Patterns Data CommonJS Require Contract: const patternsData = require(\'../data/patternsData\')', () => {
    const patternsData = require('../data/patternsData')


    assert.ok(Array.isArray(patternsData), 'patternsData must be an Array')
    assert.equal(patternsData.length, 28, 'Must load exactly 28 DSA patterns')
    assert.equal(patternsData.patternsData, patternsData, 'Must support .patternsData property')
    const totalProblems = patternsData.reduce((acc, p) => acc + (p.problems ? p.problems.length : 0), 0)
    assert.equal(totalProblems, 260, 'Must contain 260 total canonical problems')
  })
})

