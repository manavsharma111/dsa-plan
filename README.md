# ⚡ DSA Pattern Master & Spaced Revision Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-dsa--plan--sigma.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://dsa-plan-sigma.vercel.app/)
[![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-99%2F100-success?style=for-the-badge&logo=lighthouse&logoColor=white)](https://dsa-plan-sigma.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.2.8-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.13-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-5.3.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_9.11-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-FFCC00?style=for-the-badge&logo=google-chrome&logoColor=black)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  🚀 <strong>Live Web App:</strong> <a href="https://dsa-plan-sigma.vercel.app/"><strong>https://dsa-plan-sigma.vercel.app/</strong></a> &nbsp;|&nbsp;
  🌐 <strong>API Server:</strong> <a href="https://dsa-plan-backend.onrender.com/api/health"><strong>https://dsa-plan-backend.onrender.com/api/health</strong></a>
</p>

<p align="center">
  <strong>Master 28 foundational algorithmic patterns across 260 curated LeetCode & GeeksForGeeks problems using scientific Ebbinghaus Spaced Repetition, 5-Pillar Interview Readiness Diagnostics, Chrome Extension zero-click auto-sync, dual AI code evaluations, and AST-aware complexity audits.</strong>
</p>

</div>

---

## 📖 Executive Summary

Most software engineers fail technical coding interviews not because they haven't practiced enough problems, but because of **the forgetting curve**:
> *"You solve 300 LeetCode questions over 4 months. Two weeks before the interview, you look at an unfamiliar Medium Sliding Window problem and have completely forgotten the invariant."*

**DSA Pattern Master** transforms brute-force grind into **permanent algorithmic muscle memory**:
1. **Focus on Patterns, Not Problem IDs**: 28 universal patterns that power 95% of Big-Tech interview loops.
2. **5-Pillar Interview Readiness Engine (0–100%)**: Holistic, evidence-based score tracking pattern mastery, independence, delayed retention, mock interviews, and consistency.
3. **Adaptive Ebbinghaus Spaced Repetition**: Schedules reviews at **Day 1, 3, 7, 14, and 28**, dynamically adapting intervals based on your performance.
4. **5-Point Active Recall Protocol**: Forces reflection on brute force, core intuition, independent coding, and edge cases before saving code.
5. **AST-Aware Complexity & Code Quality Analyzer**: On-the-fly static estimation of Time Complexity ($O(1)$, $O(\log N)$, $O(N)$, $O(N \log N)$, $O(N^2)$, $O(2^N)$), space requirements, and recursion depth.
6. **Zero-Friction Chrome Extension (MV3)**: Auto-captures your code, runtime, and memory directly on LeetCode/GFG and syncs to your personal cloud.
7. **Per-Topic Instant Reset**: 1-click **"Clear checks"** option on each pattern header to reset and re-practice individual patterns at will.
8. **Dual AI Code Evaluation**: Analyzes your code with Google Gemini 2.5 Flash or local GPU LLMs (via Ollama) for complexity proofs and edge case audits.

---

## 📑 Table of Contents

- [⚡ Executive Summary](#-executive-summary)
- [🏗️ System Architecture](#️-system-architecture)
- [🧠 Core Architectural Pillars](#-core-architectural-pillars)
  - [1. 5-Pillar Interview Readiness Benchmark Engine](#1-5-pillar-interview-readiness-benchmark-engine)
  - [2. Adaptive Ebbinghaus Spaced Repetition (1, 3, 7, 14, 28 Days)](#2-adaptive-ebbinghaus-spaced-repetition-1-3-7-14-28-days)
  - [3. 5-Point Active Recall Protocol & Evolution History](#3-5-point-active-recall-protocol--evolution-history)
  - [4. AST-Aware Complexity & Code Quality Analyzer](#4-ast-aware-complexity--code-quality-analyzer)
  - [5. Real-Time Chrome Extension (Auto-Capture)](#5-real-time-chrome-extension-auto-capture)
  - [6. Per-Topic Instant Progress Reset ("Clear Checks")](#6-per-topic-instant-progress-reset-clear-checks)
  - [7. Dual AI Reviewer & Senior Interviewer Feedback](#7-dual-ai-reviewer--senior-interviewer-feedback)
  - [8. Timed Mock Interview Simulator & Diagnostics](#8-timed-mock-interview-simulator--diagnostics)
- [📋 The 28 Core Patterns](#-the-28-core-patterns)
- [📂 Repository Structure](#-repository-structure)
- [🚀 Quickstart & Local Installation](#-quickstart--local-installation)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup & Environment Variables](#2-backend-setup--environment-variables)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Running Full Stack Concurrently](#4-running-full-stack-concurrently)
  - [5. Chrome Extension 30-Second Setup](#5-chrome-extension-30-second-setup)
- [⚡ Performance Optimizations & Benchmarks](#-performance-optimizations--benchmarks)
- [📡 API Reference](#-api-reference)
- [🌐 Deployment Guide](#-deployment-guide)
- [📜 License](#-license)

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Clients ["Client Layer"]
        SPA["React 18 SPA (Vite + Redux Toolkit)<br/>Warm Paper Theme + Micro-Animations"]
        EXT["Chrome Extension MV3<br/>Content Script + Service Worker"]
        PLATFORMS["LeetCode / GeeksForGeeks<br/>Monaco & Ace Editors"]
    end

    subgraph ServerLayer ["Server & API Layer (Node.js & Express 5 CommonJS)"]
        ROUTER["API Router (/api)"]
        SYNC_CTRL["Sync & Extension Ingestion Controller"]
        READINESS_CTRL["Interview Readiness Controller"]
        INTERVIEW_CTRL["Mock Interview Controller"]
        ANALYTICS_CTRL["Pattern Analytics Controller"]
        AI_SVC["AI Review & Evaluation Service"]
    end

    subgraph ReadinessModular ["Readiness Modular Engine (services/readiness)"]
        CATALOG["catalogResolver.js<br/>Slug & ID Normalization"]
        PILLARS["pillarEvaluators.js<br/>5 Core Evidence Evaluators"]
        SCORING["scoringNormalizer.js<br/>Weight Normalization & Confidence"]
        RECS["recommendationEngine.js<br/>Target Next Steps & Warnings"]
    end

    subgraph AIEngine ["AI Evaluation Layer"]
        GEMINI["Google Gemini 2.5 Flash<br/>(Cloud API)"]
        OLLAMA["Local GPU Ollama<br/>(Qwen2.5-Coder / DeepSeek-R1)"]
    end

    subgraph DataStorage ["Database Layer"]
        DB[("MongoDB Atlas Cloud<br/>UserProgress, Solutions, Interviews, Snapshots")]
    end

    PLATFORMS -->|Accepted Submission Detected| EXT
    EXT -->|POST /api/sync/extension-submission| SYNC_CTRL
    SPA <-->|REST State Pull & Push| ROUTER
    ROUTER --> SYNC_CTRL
    ROUTER --> READINESS_CTRL
    ROUTER --> INTERVIEW_CTRL
    ROUTER --> ANALYTICS_CTRL
    ROUTER --> AI_SVC

    READINESS_CTRL --> CATALOG
    READINESS_CTRL --> PILLARS
    READINESS_CTRL --> SCORING
    READINESS_CTRL --> RECS

    AI_SVC -->|High-Speed Cloud Analysis| GEMINI
    AI_SVC -.->|Local GPU Inference| OLLAMA

    SYNC_CTRL --> DB
    READINESS_CTRL --> DB
    INTERVIEW_CTRL --> DB
    ANALYTICS_CTRL --> DB
```

---

## 🧠 Core Architectural Pillars

### 1. 5-Pillar Interview Readiness Benchmark Engine
Checking off problems does not equal interview readiness. Our modular readiness engine calculates a mathematically weighted **Readiness Benchmark Score (0–100%)** grounded in verifiable evidence:

| Pillar | Default Weight | Target Metrics | Key Evaluation Signal |
| :--- | :---: | :--- | :--- |
| **1. Pattern Coverage & Mastery** | **25%** | $\ge 18$ active patterns, $\ge 50$ problems | Evaluates breadth and depth across all 28 universal patterns. |
| **2. Autonomy & Hint Independence** | **25%** | $\ge 25$ independent/mastered solves | Penalizes hint reliance (`solo * 0.7 + master * 1.0 + hint * 0.25`). |
| **3. Delayed Recall & Retention** | **20%** | $\ge 12$ reviews, $\ge 80\%$ recall rate | Measures retention across the 28-day Ebbinghaus curve; penalizes overdue reviews. |
| **4. Real-Time Mock Interviews** | **20%** | $\ge 3$ timed mock rounds, avg score $\ge 70$ | Evaluates performance under blind conditions and time pressure. |
| **5. Consistency & Habit Streak** | **10%** | $\ge 12$ active days in last 30, active streak | Assesses compounding practice habits and frequency. |

#### Dynamic Weight Normalization:
When a candidate hasn't attempted mock interviews yet, the engine **dynamically re-normalizes** active weights so their score reflects genuine progress rather than artificially dropping to zero:

$$W'_i = \frac{W_i}{\sum_{k \in \text{Active}} W_k} \times 100$$

- **Evidence Confidence Levels**:
  - `Insufficient Evidence` (< 30% evidence coverage, < 10 solves)
  - `Provisional Score` (30%–69% evidence coverage)
  - `Confident Assessment` ($\ge 70\%$ evidence coverage, balanced signals)
- **Target Recommendations**: Generates actionable, prioritized coaching tips with 1-click links (e.g., *"Hint Dependency detected in Dynamic Programming"*, *"Overdue delayed reviews decaying retention"*).
- **Snapshot Progress History**: Save validated readiness milestones and track overall score trends over time.

---

### 2. Adaptive Ebbinghaus Spaced Repetition (1, 3, 7, 14, 28 Days)
Integrated with the **Ebbinghaus Forgetting Curve**, problems advance through 5 structured retention milestones:

```text
Solved Initial ──> Day 1 ──> Day 3 ──> Day 7 ──> Day 14 ──> Day 28 (⚡ Mastered)
```

| Stage | Milestone | Title | Review Objective |
| :---: | :---: | :--- | :--- |
| **1** | **+1 Day** | *Day 1: Revision 1* | Bina solution dekhe solve & recall |
| **2** | **+3 Days** | *Day 3: Revision 2* | Pattern recall & optimized approach |
| **3** | **+7 Days** | *Day 7: Revision 3* | Independent coding & edge cases |
| **4** | **+14 Days** | *Day 14: Revision 4* | Interview-style timed attempt |
| **5** | **+28 Days** | *Day 28: Revision 5* | Long-term retention test $\rightarrow$ **⚡ Mastered** |

#### Adaptive Outcome Rules:
- **⚡ Solved efficiently without hints**: Advances to the next stage (+7 to +14 days).
- **⏱️ Solved, but took too long**: Sets a short 2–3 day gap to build recall velocity.
- **💡 Needed a hint / peeked at code**: Resets schedule to **tomorrow (+1 day)** to verify independent execution.
- **📖 Had to read the solution**: Immediate 1-day reset; requires full scratch reimplementation.
- **⚠️ Repeated same mistake**: Resets problem back to Stage 1, with a secondary check at Day 3.

---

### 3. 5-Point Active Recall Protocol & Evolution History
Before marking a problem revised or saving code, candidates complete an active recall checklist:

| Checkpoint | Focus Question | Objective |
| :--- | :--- | :--- |
| **1. Pattern Identification** | *Can you identify the pattern without tags?* | Trains blind pattern classification (e.g. recognizing Monotonic Stack vs Two Pointers). |
| **2. Brute Force Articulation** | *What is the naive approach and its limits?* | Articulating $O(N^2)$ solutions and why they hit Time Limit Exceeded (TLE). |
| **3. Optimal Intuition** | *What is the core invariant and data structure?* | Explaining why a Heap, Hash Map, or Two-Pointer invariant optimizes the search space. |
| **4. Independent Code** | *Can you code cleanly without looking at solutions?* | Writing production-grade, bug-free implementations from scratch. |
| **5. Edge Cases & Bounds** | *What are the Big-O bounds and corner cases?* | Testing empty inputs, negatives, duplicates, and integer overflow bounds. |

Every problem maintains a chronological **Attempt Versioning Drawer** (`Attempt #1`, `Attempt #2`, ...), enabling 1-click comparison of naive attempts versus optimal revisions.

---

### 4. AST-Aware Complexity & Code Quality Analyzer
Located in `frontend/src/utils/codeAnalyzer.js`, this static code intelligence engine analyzes submitted code in real time:

- **Language Detection**: Automatically identifies `C++`, `Java`, `Python`, `JavaScript`, or `C`.
- **Accurate Time Complexity Estimation**:
  - $O(1)$: Constant-time arithmetic and lookups.
  - $O(\log N)$: Accurately identifies halving and doubling loops (`while(n > 0) n /= 2`, `n >>= 1`, `mid = (low + high) / 2`).
  - $O(N)$: Single linear scan loops.
  - $O(N \log N)$: Logarithmic operations nested inside linear loops (e.g. binary search or sorting per element).
  - $O(N^2), O(N^3)$: Nested iterative scans.
  - $O(2^N)$: Branching recursion trees.
- **Space Complexity & Recursion Depth**: Identifies dynamic allocations (`new int[]`, `new HashMap`, `vector<vector<int>>`) and recursive stack depth.
- **Edge Case Coverage Auditor**: Validates explicit checks for empty inputs, `null / nullptr / None`, negative numbers, single-node graphs, and duplicates.

---

### 5. Real-Time Chrome Extension (Auto-Capture)
Located in `extension/` (Chrome Manifest V3):

```text
[LeetCode / GeeksForGeeks] ──> [DOM MutationObserver] ──> [Editor Code Extraction] ──> [Cloud Sync to MongoDB Atlas]
```

- **Zero-Click Ingestion**: Detects `"Accepted"` submissions on LeetCode and GeeksForGeeks.
- **Extracted Metadata**: Captures full solution code, programming language, runtime (ms) with percentile, and memory (MB) with percentile.
- **Visual Notification**: Displays a floating notification banner on LeetCode:
  `🚀 DSA Tracker Cloud Sync: [Problem Name] Synced!`
- **Instant Cloud Ingestion**: Automatically checks the problem box, attaches code to the revision modal, and records the attempt.

---

### 6. Per-Topic Instant Progress Reset ("Clear Checks")
Located on every pattern header in `PatternSection.jsx`:
- **Direct 1-Click Action**: A sleek, pill-shaped **`Clear checks (N)`** button on each pattern header.
- **Zero Annoying Dialogs**: Clears checked problems instantly in one click without popup friction.
- **Full State Clean-up**: Resets `solved`, `mastery`, and `revision` states for problems in that specific pattern.
- **Cloud Auto-Save**: Immediately persists the updated state to `localStorage` and triggers cloud sync (`autoSaveToCloud()`).
- **Context-Aware Visuals**: Gracefully dimmed when 0 problems are solved; displays solved count badge and rose hover accent when active.

---

### 7. Dual AI Reviewer & Senior Interviewer Feedback
Evaluate code through our hybrid AI reviewer:
- **Google Gemini 2.5 Flash**: Fast, cloud-based analysis with deep reasoning.
- **Local GPU Inference (Ollama)**: 100% offline reviews using `qwen2.5-coder:7b` or `deepseek-r1`.
- **Review Deliverables**:
  - Big-O Time & Space complexity proofs.
  - Edge case coverage gaps (empty array, single element, negative numbers, overflow).
  - Readability and idiomatic code critique.
  - Follow-up interview questions and optimal variations.

---

### 8. Timed Mock Interview Simulator & Diagnostics
Simulate realistic FAANG/Big-Tech technical screening rounds:
- **Blind Challenge**: Hides pattern tags to authentically test pattern recognition.
- **Flexible Formats**: Select 1, 2, or 3 random questions across patterns with 30–90 minute timers.
- **Diagnostic Reports**: Detailed clearance rates, question breakdown, time taken, and 1-click Spaced Revision scheduling for abandoned problems.

---

## 📋 The 28 Core Patterns

Mastering these 28 patterns covers virtually every question asked by top tech companies:

| # | Pattern Name | Key Data Structures | Representative Problems |
| :-: | :--- | :--- | :--- |
| **01** | **Two Pointers** | Array, String | Two Sum II, 3Sum, Container With Most Water |
| **02** | **Fast & Slow Pointers** | LinkedList, Cycle Detection | Linked List Cycle, Find the Duplicate Number |
| **03** | **Sliding Window** | Array, String, Hash Map | Longest Substring Without Repeating Characters, Minimum Window Substring |
| **04** | **Merge Intervals** | Array, Sorting | Merge Intervals, Insert Interval, Meeting Rooms II |
| **05** | **Cyclic Sort** | Array (1 to N) | Missing Number, Find All Numbers Disappeared in an Array |
| **06** | **In-place Reversal of a LinkedList** | LinkedList | Reverse Linked List, Reverse Nodes in k-Group |
| **07** | **Tree Breadth First Search (BFS)** | Queue, Binary Tree | Binary Tree Level Order Traversal, Zigzag Traversal |
| **08** | **Tree Depth First Search (DFS)** | Stack, Recursion, Binary Tree | Path Sum II, Lowest Common Ancestor, Diameter of Binary Tree |
| **09** | **Two Heaps Pattern** | Min-Heap, Max-Heap | Find Median from Data Stream, Sliding Window Median |
| **10** | **Subsets & Backtracking** | Recursion, Decision Tree | Subsets, Permutations, Combination Sum, N-Queens |
| **11** | **Modified Binary Search** | Array, Divide & Conquer | Search in Rotated Sorted Array, Find Peak Element |
| **12** | **Bitwise XOR** | Bits, Bit Manipulation | Single Number, Subsets via Bitmask, Missing Number |
| **13** | **Top 'K' Elements** | Min-Heap, Max-Heap | Kth Largest Element in an Array, Top K Frequent Elements |
| **14** | **K-way Merge** | Priority Queue, Heap | Merge k Sorted Lists, Kth Smallest Element in a Sorted Matrix |
| **15** | **0/1 Knapsack (DP)** | 2D Array, 1D Array | Partition Equal Subset Sum, Target Sum |
| **16** | **Fibonacci Numbers & Memoization** | Array, Dynamic Programming | Climbing Stairs, House Robber, Coin Change |
| **17** | **Palindromic Subsequence** | 2D Dynamic Programming | Longest Palindromic Substring, Palindromic Substrings Count |
| **18** | **Longest Common Subsequence** | 2D Dynamic Programming | Longest Common Subsequence, Edit Distance |
| **19** | **Topological Sort** | Graph, In-degree Array, Queue | Course Schedule I & II, Alien Dictionary |
| **20** | **Trie (Prefix Tree)** | Tree, Hash Table | Implement Trie, Word Search II |
| **21** | **Union-Find (Disjoint Set)** | Array, Path Compression | Number of Connected Components, Redundant Connection |
| **22** | **Monotonic Stack** | Stack | Next Greater Element, Daily Temperatures, Largest Rectangle in Histogram |
| **23** | **Monotonic Queue** | Deque | Sliding Window Maximum, Constrained Subsequence Sum |
| **24** | **Segment Tree & Fenwick Tree** | Tree, Array | Range Sum Query - Mutable, Count of Smaller Numbers After Self |
| **25** | **Divide and Conquer** | Recursion | Merge Sort, Kth Largest Element, Beautiful Array |
| **26** | **Matrix Traversal & Multi-Source BFS** | 2D Grid, Queue | Number of Islands, Rotting Oranges, 01 Matrix |
| **27** | **Greedy with Priority Queue** | Priority Queue | Task Scheduler, Jump Game, Gas Station |
| **28** | **String Pattern Matching** | LPS Array, Hash | Find the Index of the First Occurrence (KMP), Repeated DNA Sequences |

---

## 📂 Repository Structure

```text
dsa/
├── backend/                             # Node.js & Express 5 API Server (CommonJS)
│   ├── config/
│   │   ├── constants.js                 # Shared constants & HTTP status codes
│   │   ├── db.js                        # MongoDB Atlas Mongoose connection
│   │   ├── env.js                       # Environment variable loader
│   │   └── problemCatalog.js            # Problem catalog and slug resolution
│   ├── controllers/
│   │   ├── aiController.js              # AI code evaluation controller
│   │   ├── analyticsController.js       # Pattern analytics controller
│   │   ├── interviewController.js       # Mock interview records controller
│   │   ├── readinessController.js       # Interview readiness score controller
│   │   └── syncController.js            # User progress & extension ingestion
│   ├── middlewares/
│   │   ├── dbCheck.js                   # Database connection readiness check
│   │   ├── errorHandler.js              # Centralized global error handling
│   │   └── requestLogger.js             # Structured request logging middleware
│   ├── models/
│   │   ├── Interview.js                 # Mock interview round schema
│   │   ├── PatternAnalytics.js          # Pattern mastery confidence schema
│   │   ├── Progress.js                  # User progress & revision queue schema
│   │   ├── ProblemSolution.js           # Saved solution history schema
│   │   └── ReadinessSnapshot.js         # Historical readiness milestone schema
│   ├── routes/
│   │   ├── aiRoutes.js                  # POST /api/ai/review
│   │   ├── analyticsRoutes.js           # POST & GET /api/analytics/patterns
│   │   ├── apiRoutes.js                 # Primary route bundler with healthcheck
│   │   ├── interviewRoutes.js           # Mock interview CRUD routes
│   │   ├── readinessRoutes.js           # Evaluation & snapshot routes
│   │   └── syncRoutes.js                # Cloud pull, push, and extension ingestion
│   ├── services/
│   │   ├── aiService.js                 # Gemini & Ollama prompt engineering
│   │   ├── analyticsService.js          # Confidence calculations & heatmaps
│   │   ├── interviewService.js          # Interview evaluation service
│   │   ├── readinessEngine.js           # Readiness orchestrator
│   │   ├── readinessService.js          # Database & snapshot service
│   │   ├── syncService.js               # Cloud sync & auto-capture processor
│   │   └── readiness/                   # Modular Readiness Engine
│   │       ├── catalogResolver.js       # Slug & problem normalizer
│   │       ├── pillarEvaluators.js      # 5 Core Evidence Evaluators
│   │       ├── recommendationEngine.js  # Targeted next steps generator
│   │       └── scoringNormalizer.js     # Weight normalization & confidence
│   ├── tests/
│   │   └── readinessEngine.test.js      # 14 deterministic readiness test cases
│   ├── server.js                        # Express application entrypoint
│   └── package.json
│
├── extension/                           # Chrome Extension (Manifest V3)
│   ├── background.js                    # Service worker handling API requests
│   ├── content.js                       # DOM MutationObserver for LeetCode & GFG
│   ├── manifest.json                    # Extension Manifest V3 configuration
│   ├── popup.html / popup.js            # Settings popup (Sync Key & API URL)
│   ├── styles.css                       # Floating notification styling
│   └── README.md                        # Extension documentation
│
├── frontend/                            # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── FeatureBar.jsx           # Navigation tabs with smooth sliding pill
│   │   │   ├── SpacedRevisionSection.jsx # Ebbinghaus queue & adaptive roadmap
│   │   │   ├── RevisionChecklistModal.jsx # 5-Point protocol & AI review modal
│   │   │   ├── WeakPatternAnalytics.jsx # Pattern mastery & attention cards
│   │   │   ├── InterviewModeModal.jsx   # Live mock interview workspace
│   │   │   ├── InterviewAnalysisSection.jsx # Post-round diagnostic analytics
│   │   │   ├── ReadinessDashboard.jsx   # 5-Pillar interview readiness benchmark
│   │   │   ├── PatternSection.jsx       # Pattern card with 1-click "Clear checks"
│   │   │   ├── PatternBreakdown.jsx     # 28-Pattern progress overview
│   │   │   ├── ProblemItem.jsx          # Memoized problem card with revision badges
│   │   │   ├── CloudSync.jsx            # Sync Key generator & cloud modal
│   │   │   ├── ProgressBar.jsx          # Shimmer revision progress bar
│   │   │   ├── StickyHeader.jsx         # Sticky header with progress track
│   │   │   ├── KeyConcepts.jsx          # Quick algorithmic pattern cheat-sheet
│   │   │   ├── Header.jsx               # Main header & hero stats
│   │   │   ├── Toast.jsx                # Global notification toast
│   │   │   ├── ExtensionGuideModal.jsx  # Extension setup guide
│   │   │   └── readiness/               # Modular Readiness UI Components
│   │   │       ├── ComponentCard.jsx
│   │   │       ├── HistoryTrendSection.jsx
│   │   │       ├── PatternMatrixSection.jsx
│   │   │       ├── ReadinessModals.jsx
│   │   │       └── RecommendationsSection.jsx
│   │   ├── data/
│   │   │   └── patternsData.js          # 28 patterns, 260 curated problems
│   │   ├── store/
│   │   │   ├── index.js                 # Redux Toolkit store configuration
│   │   │   └── progressSlice.js         # Granular selectors & cloud sync thunks
│   │   ├── utils/
│   │   │   ├── codeAnalyzer.js          # AST-aware Time/Space complexity analyzer
│   │   │   ├── codec.js                 # State serialization & sanitization
│   │   │   ├── readinessEngine.js       # Client-side offline readiness engine
│   │   │   └── readiness/               # Client-side modular evaluators
│   │   ├── App.jsx                      # Main layout & code-split lazy routes
│   │   ├── index.css                    # Warm Paper design tokens & scrollbars
│   │   └── main.jsx                     # React DOM entrypoint
│   ├── index.html
│   ├── tailwind.config.js               # Warm Paper editorial color system
│   ├── vite.config.js                   # Vite config with Rollup manualChunks
│   └── package.json
│
├── package.json                         # Root workspace scripts
└── README.md                            # Comprehensive project documentation
```

---

## 🚀 Quickstart & Local Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher
- [MongoDB Atlas](https://www.mongodb.com/atlas) connection string (or local MongoDB)
- *(Optional)* [Google Gemini API Key](https://ai.google.dev/) for AI code reviews

---

### 1. Clone Repository

```bash
git clone https://github.com/<your-username>/dsa-pattern-master.git
cd dsa-pattern-master
npm install
```

---

### 2. Backend Setup & Environment Variables

```bash
cd backend
npm install
```

Create a file named `.env` in `backend/`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Database URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dsa_tracker?retryWrites=true&w=majority

# Frontend URL (for CORS)
FRONTEND_URI=http://localhost:5173

# AI Model Configuration
AI_MODEL=GEMINI
GEMINI_API_KEY=your_gemini_api_key_here

# (Optional) Local GPU Ollama URL (Set AI_MODEL=OLLAMA for 100% offline reviews)
OLLAMA_URL=http://127.0.0.1:11434
CUSTOM_MODEL_URL=http://127.0.0.1:11434
```

To run unit tests:
```bash
npm test
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

### 4. Running Full Stack Concurrently

You can start both servers concurrently:

```bash
# In the root directory:
npm run dev           # Starts Vite frontend on http://localhost:5173
npm run dev:backend   # Starts Express backend on http://localhost:5000
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 5. Chrome Extension 30-Second Setup

1. Open your Chromium browser (Chrome, Brave, Edge).
2. Navigate to:
   ```text
   chrome://extensions
   ```
3. Toggle **"Developer mode"** to **ON** in the top-right corner.
4. Click **"Load unpacked"** in the top-left corner.
5. Select the `extension/` directory from this repository:
   ```text
   C:\CORE SUBJECT\best\dsa\extension
   ```
6. On your DSA Tracker web app, click **`⚡ Auto-Sync [Extension]`** to copy your **Sync Key**.
7. Click the **DSA Tracker (⚡)** icon in your browser toolbar, paste your Sync Key, and click **"Save Settings"**.

Now, every time you solve a problem on LeetCode or GeeksForGeeks, your solution code, runtime, and progress will sync automatically!

---

## ⚡ Performance Optimizations & Benchmarks

### Frontend Optimization Suite:
- **React.memo & Granular Redux Selectors**: All 260 problem items (`ProblemItem.jsx`) use `selectProblemRevision(id, slug)` and `React.memo`. Clicking a checkbox re-renders **only that single problem component** instead of all 260 items (<1ms dispatch time).
- **Static Lookup Indexing**: Problem-to-pattern lookup maps are built once at module load time rather than inside render loops.
- **Memoized Calculations**: Pattern stats (`PatternBreakdown`), analytics matrices (`WeakPatternAnalytics`), and revision queues (`SpacedRevisionSection`) are wrapped in `useMemo` to eliminate unnecessary array allocations.
- **Rollup Code-Splitting**: Heavy feature views (`ReadinessDashboard`, `SpacedRevisionSection`, `InterviewAnalysisSection`, `RevisionChecklistModal`) are loaded asynchronously via `React.lazy()` and `Suspense`, keeping the initial critical bundle under ~89 kB gzipped.
- **Offscreen DOM Virtualization**: Pattern sections leverage `content-visibility: auto` to defer layout rendering of 3,700+ offscreen DOM nodes until scrolled into view.

### Backend Benchmarks:
- **Throughput**: Verified over **6,200 req/sec** on health endpoints and sub-200ms latency on real-time extension write ingestion under 20-connection concurrent load.
- **Node.js Runtime Health**: Profiled via **Clinic.js Doctor** with **1.2 ms average event loop latency**, flat 38–46 MB heap stability, and sub-millisecond GC sweeps.

---

## 📡 API Reference

### Cloud Sync & Extension Ingestion

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/sync/pull` | Fetches user progress, revision queues, and interviews by `syncKey`. |
| `POST` | `/api/sync/push` | Upserts user progress, solved map, and revision schedules. |
| `POST` | `/api/sync/extension-submission` | Ingests real-time accepted submissions from the Chrome Extension. |

### Interview Readiness Engine

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/readiness` | Calculates evidence-based readiness score, confidence level, normalized weights, and weakness diagnosis. |
| `GET` | `/api/readiness/history` | Retrieves historical score snapshots for progress trending. |
| `POST` | `/api/readiness/snapshot` | Persists a validated score milestone snapshot to MongoDB Atlas. |
| `POST` | `/api/readiness/evaluate` | Pure in-memory readiness evaluation endpoint for client state payloads. |

### AI Code Evaluation & Reviews

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/review` | Evaluates code snippet for Big-O proofs, edge cases, quality score, and senior interviewer tips. |

### Mock Interview Screening

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/interviews/save` | Saves completed mock interview round report. |
| `GET` | `/api/interviews/history/:syncKey` | Retrieves all historical interview reports and diagnostic scores. |
| `DELETE` | `/api/interviews/clear/:syncKey` | Clears all interview records for the user. |

### Pattern Analytics

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analytics/patterns` | Updates pattern-wise confidence, hint counts, and attention rankings. |
| `GET` | `/api/analytics/patterns/:syncKey` | Retrieves pattern analytics matrix and attention targets. |

---

## 🌐 Deployment Guide

### 🚀 Live Deployments
- **Production Web Application (Vite on Vercel)**: [https://dsa-plan-sigma.vercel.app/](https://dsa-plan-sigma.vercel.app/)
- **Live Cloud API Backend (Render)**: [https://dsa-plan-backend.onrender.com/](https://dsa-plan-backend.onrender.com/)

### Deploy Backend (Render / Railway)
1. Link your GitHub repository to [Render](https://render.com/).
2. Set Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure Environment Variables (`MONGODB_URI`, `GEMINI_API_KEY`, `FRONTEND_URI`).

### Deploy Frontend (Vercel)
1. Link your GitHub repository to [Vercel](https://vercel.com/).
2. Set Root Directory to `frontend`.
3. Framework Preset: `Vite`.
4. Output Directory: `dist`
5. Set Environment Variable:
   ```env
   VITE_BACKEND_URI=https://dsa-plan-backend.onrender.com
   ```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with precision by <strong>Manav Sharma</strong> for engineers striving for algorithmic excellence and top-tier interview clearance.</sub>
</div>
