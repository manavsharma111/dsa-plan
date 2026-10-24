/**
 * Pattern-Aware DSA Code Analyzer
 * Analyzes code pasted from LeetCode, GFG, or auto-captured via Chrome Extension.
 *
 * Evaluates complexity RELATIVE to the specific Pattern / Problem Category:
 * - Matrix / Grid: O(N²) or O(N×M) is optimal; O(1) in-place is praised.
 * - Graph / BFS / DFS / Tree: O(V+E) or O(N) is optimal; O(V) space for visited/queue is optimal.
 * - 2D Dynamic Programming: O(N×M) is optimal; O(M) or O(N×M) space is expected.
 * - Two Pointers / Sliding Window: O(N) time and O(1) space is optimal.
 */

export function analyzeSubmittedCode(code = '', patternContext = '') {
  if (!code || typeof code !== 'string' || !code.trim()) {
    return null
  }

  const raw = code.trim()
  const lines = raw.split('\n')
  const totalLines = lines.length
  const codeLines = lines.filter(
    (l) => l.trim().length > 0 && !l.trim().startsWith('//') && !l.trim().startsWith('#')
  ).length

  const patternLower = (patternContext || '').toLowerCase()

  // 1. Language Detection
  let language = 'Unknown'
  if (
    raw.includes('#include') ||
    raw.includes('std::') ||
    raw.includes('vector<') ||
    raw.includes('cout')
  ) {
    language = 'C++'
  } else if (
    raw.includes('public class') ||
    raw.includes('System.out') ||
    raw.includes('int[]') ||
    raw.includes('HashMap<')
  ) {
    language = 'Java'
  } else if (
    raw.includes('def ') ||
    raw.includes('elif ') ||
    raw.includes('self.') ||
    (raw.includes(':') && raw.includes('in range'))
  ) {
    language = 'Python'
  } else if (
    raw.includes('function') ||
    raw.includes('const ') ||
    raw.includes('let ') ||
    raw.includes('=>')
  ) {
    language = 'JavaScript'
  }

  // 2. Loop & Nesting Detection
  const loopMatches = raw.match(/\b(for|while)\b/g) || []
  const loopCount = loopMatches.length

  let maxNesting = 0
  let currentBraceDepth = 0
  let loopDepths = []

  const tokens = raw.split(/([{}])/)
  for (const token of tokens) {
    if (token === '{') {
      currentBraceDepth++
    } else if (token === '}') {
      currentBraceDepth = Math.max(0, currentBraceDepth - 1)
    } else if (/\b(for|while)\b/.test(token)) {
      loopDepths.push(currentBraceDepth)
    }
  }

  if (loopDepths.length >= 2) {
    for (let i = 1; i < loopDepths.length; i++) {
      if (loopDepths[i] > loopDepths[i - 1]) {
        maxNesting = Math.max(maxNesting, 2)
      }
      if (i >= 2 && loopDepths[i] > loopDepths[i - 1] && loopDepths[i - 1] > loopDepths[i - 2]) {
        maxNesting = Math.max(maxNesting, 3)
      }
    }
  }

  if (language === 'Python') {
    let prevIndent = -1
    for (const line of lines) {
      if (/^\s*(for|while)\b/.test(line)) {
        const indent = line.search(/\S/)
        if (prevIndent !== -1 && indent > prevIndent) {
          maxNesting = Math.max(maxNesting, 2)
        }
        prevIndent = indent
      }
    }
  }

  // Binary search indicator
  const hasBinarySearch =
    /\b(low|left)\s*<=\s*(high|right)\b/i.test(raw) ||
    /\bmid\s*=\s*\(?(low|left)\s*\+\s*(high|right)\)?\s*(\/|\>\>)\s*2/i.test(raw) ||
    /\bbisect\b/i.test(raw)

  // Recursion indicator
  const hasRecursion = /\breturn\s+[a-zA-Z0-9_]+\s*\(/.test(raw) && /\bif\b/.test(raw)

  // Estimate Raw Time Complexity
  let estimatedTime = 'O(1)'
  if (hasBinarySearch && maxNesting === 0) {
    estimatedTime = 'O(log N)'
  } else if (maxNesting >= 3) {
    estimatedTime = 'O(N³)'
  } else if (maxNesting === 2) {
    estimatedTime = 'O(N²)'
  } else if (loopCount >= 1 && hasBinarySearch) {
    estimatedTime = 'O(N log N)'
  } else if (loopCount >= 1) {
    estimatedTime = 'O(N)'
  } else if (hasRecursion) {
    estimatedTime = 'O(V+E) / O(2ⁿ) Recursion'
  }

  // 3. Space Complexity Detection
  const has2DArray =
    /\[\s*\w+\s*\]\s*\[\s*\w+\s*\]/.test(raw) ||
    /vector<\s*vector</.test(raw) ||
    /new\s+int\s*\[[^\]]+\]\s*\[[^\]]+\]/.test(raw) ||
    /\[\s*\[0\s*\]\s*\*\s*\w+\s*for\b/.test(raw)

  const hasLinearDataStructures =
    /\b(map|set|hashmap|hashset|unordered_map|unordered_set|dict|vector|list|queue|stack)\b/i.test(
      raw
    ) || /new\s+(int|Array|ArrayList|HashMap|HashSet)\s*\[/.test(raw)

  let estimatedSpace = 'O(1) In-Place'
  if (has2DArray) {
    estimatedSpace = 'O(N × M) Grid/Matrix'
  } else if (hasLinearDataStructures) {
    estimatedSpace = 'O(N) Extra Memory'
  }

  // 4. Pattern-Aware Evaluation & Theoretical Optimality
  const isMatrixProblem = patternLower.includes('matrix') || patternLower.includes('grid')
  const isGraphProblem =
    patternLower.includes('graph') ||
    patternLower.includes('bfs') ||
    patternLower.includes('dfs') ||
    patternLower.includes('tree')
  const isDPProblem = patternLower.includes('dynamic programming') || patternLower.includes('dp')

  let complexityVerdict = 'Standard'
  let optimalityTag = ''

  if (isMatrixProblem) {
    // In Matrix, O(N²) or O(N*M) is the mandatory lower bound because every cell must be visited!
    if (estimatedTime === 'O(N²)' || maxNesting === 2) {
      estimatedTime = 'O(N × M) Optimal'
      optimalityTag = '⭐ Optimal Bound (Every cell visited)'
    }
    if (estimatedSpace.includes('O(1)')) {
      optimalityTag += ' • ⚡ 100% In-Place Swap'
    }
  } else if (isGraphProblem) {
    // In Graphs, O(V+E) time and O(V) space for visited array / queue is optimal!
    if (estimatedTime.includes('Recursion') || estimatedTime === 'O(N)') {
      estimatedTime = 'O(V + E) Optimal'
      optimalityTag = '⭐ Optimal Graph Traversal'
    }
    if (estimatedSpace === 'O(N) Extra Memory') {
      estimatedSpace = 'O(V) Visited/Queue'
      optimalityTag += ' • 🛡️ Valid Visited Set'
    }
  } else if (isDPProblem) {
    if (estimatedTime === 'O(N²)' || maxNesting === 2) {
      estimatedTime = 'O(N × M) DP Optimal'
      optimalityTag = '⭐ Optimal 2D State Table'
    }
  }

  // 5. Edge Cases Handled Check
  const edgeCaseKeywords = []
  if (/\b(null|nullptr|None|nil)\b/i.test(raw)) {
    edgeCaseKeywords.push('Null / Empty Pointer')
  }
  if (/\.(length|size\(\)|len\()\s*(==|<=|===)\s*0\b/i.test(raw) || /empty\(\)/i.test(raw)) {
    edgeCaseKeywords.push('Empty Input (length 0)')
  }
  if (/\b(length|size\(\)|len\()\s*(==|===)\s*1\b/i.test(raw)) {
    edgeCaseKeywords.push('Single Element')
  }
  if (/\b(Integer\.MAX_VALUE|INT_MAX|float\('inf'\)|Number\.MAX_SAFE_INTEGER)\b/i.test(raw)) {
    edgeCaseKeywords.push('Infinity / Overflow Guard')
  }

  // 6. Pattern Keywords
  const detectedTags = []
  if (
    /\b(left|right|slow|fast|i|j)\b/i.test(raw) &&
    (raw.includes('++') || raw.includes('+=') || raw.includes('-='))
  ) {
    detectedTags.push('Pointers Manipulation')
  }
  if (/\b(dp|memo|cache)\b/i.test(raw)) {
    detectedTags.push('Dynamic Programming / Memoization')
  }
  if (/\b(stack|deque|queue)\b/i.test(raw) || /push|pop|shift/i.test(raw)) {
    detectedTags.push('Stack / Queue Operation')
  }
  if (/\b(swap|reverse)\b/i.test(raw)) {
    detectedTags.push('In-Place Swap')
  }

  // 7. Overall Quality Score (1 to 10)
  // Give high scores when optimal relative to pattern!
  let qualityScore = 7
  if (isMatrixProblem && (estimatedTime.includes('Optimal') || estimatedSpace.includes('O(1)'))) {
    qualityScore = 9
  } else if (isGraphProblem && estimatedTime.includes('Optimal')) {
    qualityScore = 9
  } else if (isDPProblem && estimatedTime.includes('Optimal')) {
    qualityScore = 9
  }

  if (edgeCaseKeywords.length >= 2) qualityScore = Math.min(10, qualityScore + 1)
  if (codeLines > 100) qualityScore = Math.max(qualityScore - 1, 6)

  return {
    language,
    totalLines,
    codeLines,
    estimatedTime,
    estimatedSpace,
    edgeCasesHandled: edgeCaseKeywords,
    detectedTags,
    qualityScore,
    optimalityTag,
    analyzedAt: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}
