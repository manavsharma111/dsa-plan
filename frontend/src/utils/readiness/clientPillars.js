import { patternsData } from '../../data/patternsData'
import { READINESS_CONFIG } from './clientCatalog'

export function evaluatePatternMastery(canonicalProgress, weights) {
  const patternMap = new Map()
  patternsData.forEach((pat) => {
    patternMap.set(pat.title, {
      title: pat.title,
      totalInPattern: pat.problems.length,
      solvedCount: 0,
      soloCount: 0,
      masteredCount: 0,
      hintCount: 0,
      unverifiedCount: 0,
    })
  })

  for (const p of canonicalProgress.solvedList) {
    if (patternMap.has(p.patternTitle)) {
      const group = patternMap.get(p.patternTitle)
      group.solvedCount++
      if (p.mastery === 'hint') group.hintCount++
      else if (p.mastery === 'mastered') group.masteredCount++
      else if (p.mastery === 'independent') group.soloCount++
      else group.unverifiedCount++
    }
  }

  const patternsList = []
  let activePatternsCount = 0
  let totalConfidenceAccumulator = 0

  for (const group of patternMap.values()) {
    const {
      title,
      totalInPattern,
      solvedCount,
      soloCount,
      masteredCount,
      hintCount,
      unverifiedCount,
    } = group

    if (solvedCount > 0) activePatternsCount++

    const qualityFactor =
      solvedCount > 0
        ? (masteredCount * 1.0 + soloCount * 0.85 + unverifiedCount * 0.70 + hintCount * 0.35) /
          solvedCount
        : 0

    const benchmarkTarget = Math.max(1, Math.min(totalInPattern, 8))
    const completionFactor = Math.min(1.0, solvedCount / benchmarkTarget)
    const confidence = Math.round(qualityFactor * completionFactor * 100)

    let status = 'unattempted'
    if (solvedCount === 0) status = 'unattempted'
    else if (confidence >= 70) status = 'strong'
    else if (confidence >= 40) status = 'moderate'
    else status = 'weak'

    patternsList.push({
      title,
      totalInPattern,
      solvedCount,
      soloCount,
      masteredCount,
      hintCount,
      unverifiedCount,
      confidence,
      status,
      weaknessScore: hintCount * 2.5 + (totalInPattern - solvedCount) * 0.8,
    })

    if (solvedCount > 0) {
      totalConfidenceAccumulator += confidence
    }
  }

  const breadthScore = Math.min(1.0, activePatternsCount / 18) * 100
  const depthScore =
    activePatternsCount > 0 ? totalConfidenceAccumulator / activePatternsCount : 0
  const rawPatternScore = Math.round(breadthScore * 0.40 + depthScore * 0.60)
  const isPatternAvailable = canonicalProgress.uniqueSolvedCount > 0

  return {
    score: isPatternAvailable ? Math.min(100, Math.max(0, rawPatternScore)) : null,
    status: isPatternAvailable ? 'available' : 'insufficient_data',
    nominalWeight: weights.patternMastery,
    metrics: {
      activePatterns: activePatternsCount,
      totalPatterns: patternMap.size,
      totalSolved: canonicalProgress.uniqueSolvedCount,
      breadthScore: Math.round(breadthScore),
      depthScore: Math.round(depthScore),
    },
    patternsList,
    explanation: isPatternAvailable
      ? `Evaluated across ${activePatternsCount}/${patternMap.size} active patterns and ${canonicalProgress.uniqueSolvedCount} canonical problems. Breadth: ${Math.round(breadthScore)}%, Depth Quality: ${Math.round(depthScore)}%.`
      : 'No problems solved yet. Solve problems across diverse patterns to build coverage.',
  }
}

export function evaluateIndependentSolving(canonicalProgress, weights) {
  const minVerified = READINESS_CONFIG.THRESHOLDS.MIN_VERIFIED_INDEPENDENCE
  const { verifiedCount, verifiedSoloCount, verifiedMasteredCount, verifiedHintCount, unverifiedCount } = canonicalProgress

  if (verifiedCount < minVerified) {
    return {
      score: null,
      status: 'unavailable',
      nominalWeight: weights.independentSolving,
      metrics: {
        verifiedCount,
        independentCount: verifiedSoloCount + verifiedMasteredCount,
        hintCount: verifiedHintCount,
        unverifiedCount,
        rawRate: 0,
      },
      explanation: `Requires at least ${minVerified} verified problem outcomes (currently ${verifiedCount}). Mark problems as Solved Solo (🧠) or Needed Hint (💡) to verify independent solving.`,
    }
  }

  const independentCount = verifiedSoloCount + verifiedMasteredCount
  const rawRate = Math.round((independentCount / verifiedCount) * 100)
  const sampleCredibility = Math.min(1.0, 0.45 + 0.55 * (verifiedCount / 25))
  const indepScore = Math.round(rawRate * sampleCredibility)

  return {
    score: Math.min(100, Math.max(0, indepScore)),
    status: 'available',
    nominalWeight: weights.independentSolving,
    metrics: {
      verifiedCount,
      independentCount,
      hintCount: verifiedHintCount,
      unverifiedCount,
      rawRate,
      sampleCredibility: Math.round(sampleCredibility * 100),
    },
    explanation: `${independentCount}/${verifiedCount} verified problems solved independently without hints (${rawRate}% raw rate). ${unverifiedCount} extension-captured submissions remain unverified.`,
  }
}

export function evaluateDelayedRecall(canonicalProgress, now, weights) {
  const minReviews = READINESS_CONFIG.THRESHOLDS.MIN_DELAYED_REVIEWS
  let totalReviews = 0
  let successfulRecallCount = 0
  let failedRecallCount = 0
  let overdueCount = 0
  let stage3PlusCount = 0

  for (const p of canonicalProgress.solvedList) {
    const rev = p.revision
    if (!rev) continue
    if (rev.stage >= 3) stage3PlusCount++
    if (rev.nextDue && rev.nextDue <= now) overdueCount++

    if (Array.isArray(rev.history) && rev.history.length > 0) {
      for (const entry of rev.history) {
        if (!entry || !entry.outcome) continue
        const out = entry.outcome
        if (out === 'efficient' || out === 'slow') {
          totalReviews++
          successfulRecallCount++
        } else if (out === 'hint' || out === 'solution' || out === 'repeat_mistake') {
          totalReviews++
          failedRecallCount++
        }
      }
    } else if (rev.stage >= 2 && rev.count >= 2) {
      totalReviews++
      if (rev.lastOutcome === 'efficient' || rev.lastOutcome === 'slow' || rev.lastOutcome === 'manual') {
        successfulRecallCount++
      } else {
        failedRecallCount++
      }
    }
  }

  if (totalReviews < minReviews) {
    return {
      score: null,
      status: 'unavailable',
      nominalWeight: weights.delayedRecall,
      metrics: {
        reviewCount: totalReviews,
        successfulRecallCount,
        failedRecallCount,
        overdueCount,
        stage3PlusCount,
        recallRate: 0,
      },
      explanation: `Requires at least ${minReviews} spaced revision review events (currently ${totalReviews}). Review problems in the Spaced Revision queue when due on Day 1, 3, 7, 14, or 28.`,
    }
  }

  const recallRate = Math.round((successfulRecallCount / totalReviews) * 100)
  const overduePenaltyPct = Math.min(50, overdueCount * 4)
  const decayMultiplier = (100 - overduePenaltyPct) / 100
  const progressionRate =
    canonicalProgress.uniqueSolvedCount > 0
      ? Math.min(1.0, stage3PlusCount / canonicalProgress.uniqueSolvedCount)
      : 0
  const baseRetention = recallRate * 0.70 + progressionRate * 100 * 0.30
  const credibility = Math.min(1.0, 0.50 + 0.50 * (totalReviews / 12))
  const retScore = Math.round(baseRetention * decayMultiplier * credibility)

  return {
    score: Math.min(100, Math.max(0, retScore)),
    status: 'available',
    nominalWeight: weights.delayedRecall,
    metrics: {
      reviewCount: totalReviews,
      successfulRecallCount,
      failedRecallCount,
      overdueCount,
      stage3PlusCount,
      recallRate,
      overduePenaltyPct,
    },
    explanation: `${successfulRecallCount}/${totalReviews} delayed recall reviews succeeded without hints (${recallRate}%). ${overdueCount} revisions overdue (-${overduePenaltyPct}% retention decay). ${stage3PlusCount} problems in Stage 3+.`,
  }
}

export function evaluateMockInterviews(interviews = [], weights) {
  const validSessions = (interviews || []).filter(
    (inv) => inv && (inv.totalProblems > 0 || (Array.isArray(inv.problems) && inv.problems.length > 0))
  )

  if (validSessions.length === 0) {
    return {
      score: null,
      status: 'unavailable',
      nominalWeight: weights.mockInterview,
      metrics: {
        sessionCount: 0,
        totalAttempted: 0,
        totalSolved: 0,
        skippedQuestions: 0,
        avgScore: 0,
        avgTimeMinutes: 0,
        timeEfficiencyScore: 0,
      },
      explanation: 'No completed timed mock interviews recorded. Complete a 30m or 60m timed mock session to test speed and problem-solving under pressure.',
    }
  }

  let totalAttempted = 0
  let totalSolved = 0
  let totalTimeTakenSeconds = 0
  let totalAllowedSeconds = 0
  let weightedScoreSum = 0
  let weightSum = 0

  const sorted = [...validSessions].sort(
    (a, b) => (a.startedAt || 0) - (b.startedAt || 0)
  )

  sorted.forEach((session, idx) => {
    const total = session.totalProblems || (session.problems ? session.problems.length : 1)
    const solvedCount = session.solvedProblems || (session.problems ? session.problems.filter((p) => p.solved).length : 0)
    const durationSec = (session.durationMinutes || 60) * 60
    const timeTakenSec = session.timeTakenSeconds || durationSec

    totalAttempted += total
    totalSolved += solvedCount
    totalTimeTakenSeconds += timeTakenSec
    totalAllowedSeconds += durationSec

    const accuracyPct = Math.round((solvedCount / total) * 100)
    let timeScore = 80
    if (timeTakenSec <= durationSec && solvedCount === total) {
      timeScore = 100
    } else if (timeTakenSec <= durationSec) {
      timeScore = Math.max(50, 100 - (1 - solvedCount / total) * 40)
    } else {
      const overtimeRatio = (timeTakenSec - durationSec) / durationSec
      timeScore = Math.max(20, 100 - overtimeRatio * 80)
    }

    const composite = accuracyPct * 0.75 + timeScore * 0.25
    const recWeight = 1.0 + idx * 0.25
    weightedScoreSum += composite * recWeight
    weightSum += recWeight
  })

  const weightedAvg = weightSum > 0 ? weightedScoreSum / weightSum : 0
  const skippedQuestions = Math.max(0, totalAttempted - totalSolved)
  const avgScore = totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0
  const avgTimeMinutes = validSessions.length > 0 ? Math.round(totalTimeTakenSeconds / (validSessions.length * 60)) : 0
  const credibility = Math.min(1.0, 0.65 + 0.35 * (validSessions.length / 3))
  const mockScore = Math.round(weightedAvg * credibility)

  return {
    score: Math.min(100, Math.max(0, mockScore)),
    status: 'available',
    nominalWeight: weights.mockInterview,
    metrics: {
      sessionCount: validSessions.length,
      totalAttempted,
      totalSolved,
      skippedQuestions,
      avgScore,
      avgTimeMinutes,
      timeEfficiencyScore: Math.round(weightedAvg),
    },
    explanation: `${validSessions.length} timed interview session(s). Solved ${totalSolved}/${totalAttempted} problems (${avgScore}% overall score), ${skippedQuestions} skipped/left. Average pace: ${avgTimeMinutes}m per interview.`,
  }
}

export function evaluateConsistency(canonicalProgress, interviews = [], now, weights) {
  const activityDates = new Set()
  const thirtyDaysAgo = now - 30 * 86400000

  for (const p of canonicalProgress.solvedList) {
    if (p.revision) {
      if (p.revision.lastRevised && p.revision.lastRevised >= thirtyDaysAgo) {
        activityDates.add(new Date(p.revision.lastRevised).toDateString())
      }
      if (Array.isArray(p.revision.history)) {
        for (const h of p.revision.history) {
          if (h && h.date && h.date >= thirtyDaysAgo) {
            activityDates.add(new Date(h.date).toDateString())
          }
        }
      }
    }
  }

  for (const inv of interviews || []) {
    if (inv && inv.startedAt && inv.startedAt >= thirtyDaysAgo) {
      activityDates.add(new Date(inv.startedAt).toDateString())
    }
  }

  const activeDays30 = activityDates.size
  let currentStreak = 0
  let checkDate = new Date(now)

  const todayStr = checkDate.toDateString()
  checkDate.setDate(checkDate.getDate() - 1)
  const yesterdayStr = checkDate.toDateString()

  if (activityDates.has(todayStr) || activityDates.has(yesterdayStr)) {
    currentStreak = 1
    let d = new Date(activityDates.has(todayStr) ? now : checkDate.getTime())
    for (let i = 1; i < 30; i++) {
      d.setDate(d.getDate() - 1)
      if (activityDates.has(d.toDateString())) {
        currentStreak++
      } else {
        break
      }
    }
  }

  const baseScore = Math.min(1.0, activeDays30 / 12) * 80
  const streakBonus = Math.min(20, currentStreak * 4)
  const score = Math.round(baseScore + streakBonus)

  return {
    score: Math.min(100, Math.max(0, score)),
    status: 'available',
    nominalWeight: weights.consistency,
    metrics: {
      activeDays30,
      currentStreak,
      targetActiveDays: 12,
    },
    explanation: `${activeDays30} active practice day(s) in the past 30 days. Current streak: ${currentStreak} day(s).`,
  }
}
