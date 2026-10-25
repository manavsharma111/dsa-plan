// Suggests concrete next steps based on gaps in revision, independence, speed, or pattern breadth
function generateRecommendations({
  canonicalProgress,
  components,
  patternBreakdown,
  overallScore,
  status,
  now,
}) {
  const recs = []

  // Warn if revision cards are piling up overdue or retention dropped
  const retention = components.delayedRecall
  if (
    retention.status === 'available' &&
    (retention.metrics.overdueCount >= 4 ||
      (retention.metrics.reviewCount >= 3 && retention.metrics.recallRate < 55))
  ) {
    recs.push({
      id: 'rec_delayed_recall_decay',
      priority: 'high',
      category: 'Spaced Revision',
      issue: 'Retention Decay: High Overdue Backlog in Spaced Repetition',
      evidence: `${retention.metrics.overdueCount} problems are currently overdue for review, and delayed recall accuracy is ${retention.metrics.recallRate}%.`,
      action: 'Clear your overdue spaced revision queue before learning new patterns. Complete problems independently on Day 1, 3, 7, or 14 intervals.',
      patterns: ['Spaced Revision Queue'],
      criterion: `Complete all ${retention.metrics.overdueCount} overdue problem reviews with an 'efficient' or 'slow' rating.`,
    })
  }

  // Flag when someone leans heavily on hints rather than solving solo
  const indep = components.independentSolving
  if (
    indep.status === 'available' &&
    indep.metrics.verifiedCount >= 5 &&
    indep.metrics.hintCount / indep.metrics.verifiedCount >= 0.35
  ) {
    recs.push({
      id: 'rec_hint_dependency',
      priority: 'high',
      category: 'Solve Independence',
      issue: 'Hint Dependency: Frequent Reliance on Hints or Editorial Code',
      evidence: `Hints were needed on ${indep.metrics.hintCount} of ${indep.metrics.verifiedCount} verified problems (${Math.round((indep.metrics.hintCount / indep.metrics.verifiedCount) * 100)}% hint rate).`,
      action: 'Re-attempt hint-assisted problems solo without looking at editorial solutions. Utilize the 5-Point Revision Checklist to structure your thoughts.',
      patterns: ['Hint-Assisted Problem Queue'],
      criterion: `Re-solve 4 hint-assisted problems to graduate them to 'Solved Solo' (🧠).`,
    })
  }

  // Catch cases where untimed practice is solid but timed mocks fall short
  const mock = components.mockInterview
  const pattern = components.patternMastery
  if (
    mock.status === 'available' &&
    pattern.status === 'available' &&
    pattern.score >= 50 &&
    (mock.score < 45 || mock.metrics.avgScore < 50)
  ) {
    recs.push({
      id: 'rec_time_pressure_gap',
      priority: 'high',
      category: 'Timed Mock Practice',
      issue: 'Time Pressure Vulnerability: Performance Drops Under Timed Constraints',
      evidence: `Untimed pattern mastery is ${pattern.score}%, but mock interview average is ${mock.metrics.avgScore}% with ${mock.metrics.skippedQuestions} skipped/incomplete questions.`,
      action: 'Run 30-minute Sprint mock interviews focusing on Medium-difficulty problems to cultivate time pacing and rapid problem recognition.',
      patterns: ['Timed Mock Interviews'],
      criterion: 'Score at least 75% on two consecutive timed mock interviews within the allowed duration.',
    })
  }

  // Make sure high-frequency interview patterns aren't completely untouched
  const corePatterns = [
    'Two Pointers',
    'Sliding Window',
    'Fast & Slow Pointers',
    'Tree BFS',
    'Tree DFS',
    'Topological Sort (Graph)',
    '0/1 Knapsack (DP)',
    'Two Heaps',
  ]

  const untouchedCore = corePatterns.filter((title) => {
    const match = patternBreakdown.insufficientEvidence.find((p) => p.title === title)
    return Boolean(match && match.solvedCount === 0)
  })

  if (untouchedCore.length >= 2) {
    recs.push({
      id: 'rec_core_pattern_blindspots',
      priority: 'medium',
      category: 'Pattern Coverage',
      issue: 'Core Pattern Blindspots: High-Frequency Interview Patterns Unexplored',
      evidence: `Key interview patterns (${untouchedCore.slice(0, 3).join(', ')}) have zero completed problems.`,
      action: 'Solve the first 2 foundation problems in each unattempted core pattern to ensure foundational breadth.',
      patterns: untouchedCore.slice(0, 3),
      criterion: 'Complete at least 2 canonical problems in each flagged core pattern.',
    })
  }

  // Target the specific pattern with lowest confidence
  if (patternBreakdown.weakest.length > 0 && patternBreakdown.weakest[0].confidence < 45) {
    const targetWeak = patternBreakdown.weakest[0]
    recs.push({
      id: `rec_weak_pattern_${targetWeak.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      priority: 'medium',
      category: 'Targeted Pattern Practice',
      issue: `Pattern Vulnerability in "${targetWeak.title}"`,
      evidence: `Confidence is only ${targetWeak.confidence}% with ${targetWeak.hintCount} hint-assisted solves and ${targetWeak.totalInPattern - targetWeak.solvedCount} unattempted problems.`,
      action: `Review the pattern intuition note and solve 2 additional problems in ${targetWeak.title} independently.`,
      patterns: [targetWeak.title],
      criterion: `Solve 2 problems in ${targetWeak.title} solo to boost pattern confidence above 60%.`,
    })
  }

  // If there's not enough data yet, show the fastest checklist to unlock the score
  if (status === 'insufficient_data') {
    const needed = []
    if (canonicalProgress.uniqueSolvedCount < 10) {
      needed.push(`${10 - canonicalProgress.uniqueSolvedCount} more solved problems`)
    }
    if (mock.status === 'unavailable') {
      needed.push('1 completed mock interview')
    }
    if (retention.status === 'unavailable') {
      needed.push('2 spaced revision reviews')
    }

    recs.unshift({
      id: 'rec_establish_benchmark',
      priority: 'urgent',
      category: 'Assessment Data',
      issue: 'Insufficient Evidence to Generate Reliable Interview Readiness Benchmark',
      evidence: `Currently tracking ${canonicalProgress.uniqueSolvedCount} canonical problems and ${mock.metrics.sessionCount} mock interviews.`,
      action: `Complete initial benchmarks: ${needed.join(', ')} to activate your Evidence-Based Readiness Score.`,
      patterns: ['Foundation Problems', 'Spaced Revision', 'Timed Mocks'],
      criterion: 'Unlock provisional readiness score by satisfying minimum empirical evidence thresholds.',
    })
  }

  return recs
}

module.exports = {
  generateRecommendations,
}
