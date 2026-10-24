export const conceptsData = [
  {
    term: 'Subarray',
    badgeClass: 'bg-core-bg text-core',
    meaning: 'Contiguous part of an array (order preserved).',
    techniques: ["Sliding Window", "Prefix Sum", "Kadane's Algorithm"]
  },
  {
    term: 'Substring',
    badgeClass: 'bg-blue-bg text-blue',
    meaning: 'Contiguous part of a string.',
    techniques: ["Sliding Window", "Two Pointers"]
  },
  {
    term: 'Subsequence',
    badgeClass: 'bg-gold-bg text-gold',
    meaning: 'Delete some elements; order kept, not necessarily contiguous.',
    techniques: ["DP (LCS)", "DP (LIS)", "Recursion"]
  },
  {
    term: 'Subset',
    badgeClass: 'bg-sage-bg text-sage',
    meaning: 'Any selection of elements (order does not matter).',
    techniques: ["Backtracking", "Bitmask"]
  }
];

export const ruleOfThumb = [
  { label: 'Contiguous (Subarray / Substring)', technique: 'Sliding Window or Prefix Sum' },
  { label: 'Ordered, Non-Contiguous (Subsequence)', technique: 'Dynamic Programming (DP)' },
  { label: 'Unordered Selection (Subset)', technique: 'Backtracking / Bitmask' }
];
