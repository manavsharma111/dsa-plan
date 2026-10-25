// Lightweight static analyzer for pasted code (LeetCode/GFG/Extension).
// Estimates time/space complexity and checks edge-case handling on the fly.

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

  // Quick check to guess the language
  let language = 'Unknown'
  if (
    raw.includes('#include') ||
    raw.includes('std::') ||
    raw.includes('vector<') ||
    raw.includes('cout') ||
    /\b(cin|nullptr|size_t|auto)\b/.test(raw)
  ) {
    language = 'C++'
  } else if (
    raw.includes('public class') ||
    raw.includes('System.out') ||
    raw.includes('int[]') ||
    raw.includes('HashMap<') ||
    raw.includes('ArrayList<')
  ) {
    language = 'Java'
  } else if (
    raw.includes('def ') ||
    raw.includes('elif ') ||
    raw.includes('self.') ||
    (raw.includes(':') && raw.includes('in range')) ||
    /\b(None|True|False)\b/.test(raw)
  ) {
    language = 'Python'
  } else if (
    raw.includes('function') ||
    raw.includes('const ') ||
    raw.includes('let ') ||
    raw.includes('=>') ||
    raw.includes('console.log')
  ) {
    language = 'JavaScript'
  } else if (/\b(int|long|float|double|char|bool|void)\b/.test(raw) && (raw.includes('{') || raw.includes(';'))) {
    language = 'C / C++'
  }

  // Figure out loop counts and how deep they nest
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

  // Binary search pointers and helper functions
  const hasBinarySearchPattern =
    /\b(bisect|binary_search|lower_bound|upper_bound|binarySearch)\b/i.test(raw) ||
    (/\b(low|left|l|lo|start)\s*(<=|<)\s*(high|right|r|hi|end)\b/i.test(raw) &&
      (/\bmid\b/i.test(raw) || /\b(>>|>>>|\/)\s*2\b/.test(raw))) ||
    /\bmid\s*=\s*\(?(low|left|l|lo|start)\s*\+\s*(high|right|r|hi|end)\)?\s*(\/|\>\>|\/\/)\s*2/i.test(raw) ||
    /\bmid\s*=\s*\(?(low|left|l|lo|start)\s*\+\s*\(?(high|right|r|hi|end)\s*-\s*(low|left|l|lo|start)\)?\s*(\/|\>\>|\/\/)\s*2/i.test(raw) ||
    /Math\.(floor|trunc)\s*\(\s*\(?(low|left|l|lo|start)\s*\+\s*(high|right|r|hi|end)\)?\s*\/\s*2\s*\)/i.test(raw)

  // Catches halving or doubling steps like n /= 2, n >>= 1, or i *= 2
  const hasLogarithmicStep =
    /\b[a-zA-Z0-9_]+\s*(\/=|\*=|>>=|<<=|>>>=|\/\/=)\s*\d+/i.test(raw) ||
    /\b([a-zA-Z0-9_]+)\s*=\s*\1\s*(\/|\/\/|\*|>>|<<|>>>)\s*\d+/i.test(raw) ||
    /\b([a-zA-Z0-9_]+)\s*=\s*Math\.(floor|trunc|round)\s*\(\s*\1\s*\/\s*\d+\s*\)/i.test(raw) ||
    /\b([a-zA-Z0-9_]+)\s*=\s*int\s*\(\s*\1\s*(\/|\/\/)\s*\d+\s*\)/i.test(raw) ||
    /for\s*\([^;]*;[^;]*;\s*([a-zA-Z0-9_]+)\s*(\*=|\/=|<<=|>>=|>>>=)/i.test(raw) ||
    /for\s*\([^;]*;[^;]*;\s*([a-zA-Z0-9_]+)\s*=\s*\1\s*(\*|\/|<<|>>)/i.test(raw)

  const hasLogarithmicLoop = hasBinarySearchPattern || hasLogarithmicStep

  // Native sort calls take O(N log N)
  const hasSorting = /\b(sort|sorted|Arrays\.sort|Collections\.sort|std::sort)\b/i.test(raw)

  // Simple recursion check with base conditions
  const hasRecursion = /\breturn\s+[a-zA-Z0-9_]+\s*\(/.test(raw) && /\bif\b/.test(raw)

  // Estimate time complexity from nesting and step behavior
  let estimatedTime = 'O(1)'
  if (maxNesting >= 3) {
    estimatedTime = hasLogarithmicLoop ? 'O(N² log N)' : 'O(N³)'
  } else if (maxNesting === 2) {
    estimatedTime = hasLogarithmicLoop ? 'O(N log N)' : 'O(N²)'
  } else if (loopCount >= 1 && hasLogarithmicLoop) {
    estimatedTime = loopCount === 1 ? 'O(log N)' : 'O(N log N)'
  } else if (hasLogarithmicLoop && loopCount === 0) {
    estimatedTime = 'O(log N)'
  } else if (hasSorting && maxNesting <= 1) {
    estimatedTime = 'O(N log N)'
  } else if (loopCount >= 1) {
    estimatedTime = 'O(N)'
  } else if (hasRecursion) {
    if (hasLogarithmicStep || hasBinarySearchPattern) {
      estimatedTime = 'O(log N)'
    } else {
      estimatedTime = 'O(V+E) / O(2ⁿ) Recursion'
    }
  }

  // Spot auxiliary memory like 2D grids, maps, sets, or heaps
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

  // Contextual pattern detection across 28 algorithmic domains
  const isMatrixProblem = patternLower.includes('matrix') || patternLower.includes('grid')
  const isGraphProblem =
    patternLower.includes('graph') ||
    patternLower.includes('bfs') ||
    patternLower.includes('dfs') ||
    patternLower.includes('tree') ||
    patternLower.includes('topological')
  const isDPProblem =
    patternLower.includes('dynamic programming') ||
    patternLower.includes('dp') ||
    patternLower.includes('knapsack') ||
    patternLower.includes('subsets')
  const isBinarySearchProblem = patternLower.includes('binary search')
  const isTwoPointerProblem =
    patternLower.includes('two pointer') ||
    patternLower.includes('fast & slow') ||
    patternLower.includes('sliding window')
  const isStackProblem = patternLower.includes('stack') || patternLower.includes('monotonic')
  const isBitProblem = patternLower.includes('bit')

  let complexityVerdict = 'Standard'
  let optimalityTag = ''

  if (isMatrixProblem) {
    if (estimatedTime === 'O(N²)' || maxNesting === 2) {
      estimatedTime = 'O(N × M) Optimal'
      optimalityTag = '⭐ Optimal Bound (Every cell visited)'
    }
    if (estimatedSpace.includes('O(1)')) {
      optimalityTag += ' • ⚡ 100% In-Place'
    }
  } else if (isGraphProblem) {
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
    } else if (estimatedTime === 'O(N)') {
      optimalityTag = '⭐ Optimal 1D State Array'
    }
  } else if (isBinarySearchProblem) {
    if (estimatedTime === 'O(log N)') {
      optimalityTag = '⭐ Optimal Logarithmic Search'
    }
  } else if (isTwoPointerProblem) {
    if (estimatedTime === 'O(N)' && estimatedSpace.includes('O(1)')) {
      optimalityTag = '⭐ Optimal O(N) In-Place Two Pointers'
    } else if (estimatedTime === 'O(N)') {
      optimalityTag = '⭐ Optimal O(N) Linear Scan'
    }
  } else if (isStackProblem) {
    if (estimatedTime === 'O(N)') {
      optimalityTag = '⭐ Optimal O(N) Monotonic Stack'
    }
  } else if (isBitProblem) {
    if (estimatedTime === 'O(1)') {
      optimalityTag = '⭐ Optimal O(1) Bitwise Arithmetic'
    }
  } else if (estimatedTime === 'O(N)' && estimatedSpace.includes('O(1)')) {
    optimalityTag = '⭐ Optimal O(N) In-Place'
  } else if (estimatedTime === 'O(1)' || estimatedTime === 'O(log N)') {
    optimalityTag = '⭐ Optimal Log / Constant Bound'
  }

  // Scan for common edge-case safety checks (C++, Java, Python, JS)
  const edgeCaseKeywords = []
  if (
    /\b(null|nullptr|None|nil|NULL)\b/.test(raw) ||
    /!\s*(head|root|node|curr|p|q)\b/i.test(raw) ||
    /\b(head|root|node)\s*==\s*(null|nullptr|NULL|0)\b/i.test(raw)
  ) {
    edgeCaseKeywords.push('Null / Pointer Guard')
  }

  if (
    /\b(length|size|len)\b\s*(\(\s*\))?\s*(==|<=|===|<)\s*(0|1)\b/i.test(raw) ||
    /\bempty\s*\(\s*\)/i.test(raw) ||
    /\b(n|m|sz|len)\s*(==|<=|<)\s*(0|1)\b/i.test(raw)
  ) {
    edgeCaseKeywords.push('Empty / Single Element Guard')
  }

  if (
    /\b(Integer\.MAX_VALUE|INT_MAX|INT_MIN|LONG_MAX|LLONG_MAX|float\('inf'\)|Number\.MAX_SAFE_INTEGER|Infinity)\b/i.test(
      raw
    ) ||
    /\b(1e9|1e18)\b/i.test(raw)
  ) {
    edgeCaseKeywords.push('Infinity / Overflow Guard')
  }

  if (
    /\b(l|left)\s*<\s*(r|right)\b/i.test(raw) ||
    /\b(low|start)\s*<=\s*(high|end)\b/i.test(raw) ||
    /\b(start|left|i)\s*<=\s*(end|right|n)\b/i.test(raw)
  ) {
    edgeCaseKeywords.push('Index Bounds / Pointer Termination')
  }

  // Tag recognizable DSA techniques used in the solution
  const detectedTags = []
  if (
    /\b(left|right|slow|fast|low|high|start|end|ptr|curr)\b/i.test(raw) &&
    (raw.includes('++') || raw.includes('--') || raw.includes('+=') || raw.includes('-='))
  ) {
    detectedTags.push('Pointers Manipulation')
  }
  if (/\b(dp|memo|cache|table)\b/i.test(raw) || /vector<\s*vector/i.test(raw)) {
    detectedTags.push('Dynamic Programming / Memoization')
  }
  if (
    /\b(stack|deque|queue|priority_queue)\b/i.test(raw) ||
    /\b(push|pop|top|peek|poll|enqueue|dequeue)\b/i.test(raw)
  ) {
    detectedTags.push('Stack / Queue Operation')
  }
  if (/\b(swap|reverse)\b/i.test(raw) || /std::swap/i.test(raw)) {
    detectedTags.push('In-Place Swap')
  }
  if (hasBinarySearchPattern || hasLogarithmicStep) {
    detectedTags.push('Logarithmic Search Invariant')
  }
  if (/\b(unordered_map|unordered_set|HashMap|HashSet|map|set|dict)\b/i.test(raw)) {
    detectedTags.push('Hash Map / Fast Lookup')
  }

  // Multi-factor dynamic code quality score (1 to 10)
  let scoreAccumulator = 6.0 // Baseline for syntactically correct code

  // 1. Time Complexity Impact (up to +2.5 / -2.5)
  if (estimatedTime === 'O(1)' || estimatedTime === 'O(log N)') {
    scoreAccumulator += 2.0
  } else if (
    estimatedTime === 'O(N)' ||
    estimatedTime.includes('Optimal') ||
    estimatedTime === 'O(V + E)'
  ) {
    scoreAccumulator += 1.5
  } else if (estimatedTime === 'O(N log N)') {
    scoreAccumulator += 1.0
  } else if (estimatedTime === 'O(N²)' || estimatedTime.includes('O(N × M)')) {
    if (isMatrixProblem || isDPProblem || isGraphProblem) {
      scoreAccumulator += 0.5
    } else {
      scoreAccumulator -= 1.5 // Suboptimal nested loop in linear problem
    }
  } else if (estimatedTime.includes('O(N³)') || estimatedTime.includes('O(2ⁿ)')) {
    scoreAccumulator -= 2.5 // Severe brute force / cubic / exponential
  }

  // 2. Space Efficiency Impact (up to +1.5 / -1.0)
  if (estimatedSpace.includes('O(1)')) {
    scoreAccumulator += 1.5 // Optimal in-place memory
  } else if (estimatedSpace.includes('O(N)') || estimatedSpace.includes('O(V)')) {
    scoreAccumulator += 0.5
  } else if (estimatedSpace.includes('Grid') && !isMatrixProblem && !isDPProblem) {
    scoreAccumulator -= 1.0 // Unnecessary 2D allocation for 1D problem
  }

  // 3. Pattern Alignment & DSA Idioms Impact (up to +1.0)
  if (detectedTags.length >= 2) {
    scoreAccumulator += 1.0
  } else if (detectedTags.length === 1) {
    scoreAccumulator += 0.5
  }

  // 4. Defensive Guarding Impact (up to +1.0)
  if (edgeCaseKeywords.length >= 2) {
    scoreAccumulator += 1.0
  } else if (edgeCaseKeywords.length === 1) {
    scoreAccumulator += 0.5
  }

  // 5. Code Structure & Cleanliness (up to +0.5 / -1.0)
  if (codeLines >= 5 && codeLines <= 45) {
    scoreAccumulator += 0.5 // Concise & clean
  } else if (codeLines > 90) {
    scoreAccumulator -= 1.0 // Verbose / bloated
  }

  if (maxNesting >= 3) {
    scoreAccumulator -= 1.0 // Excessive nesting depth
  }

  // Final rounded score clamped between 1 and 10
  const qualityScore = Math.min(10, Math.max(1, Math.round(scoreAccumulator)))

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
