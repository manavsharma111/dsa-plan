const autocannon = require('autocannon')

const BASE_URL = process.env.TARGET_URL || 'http://localhost:5000'

async function runBenchmark(name, options) {
  console.log(`\n========================================`)
  console.log(`🚀 Running Benchmark: ${name}`)
  console.log(`🎯 URL: ${options.url}`)
  console.log(`👥 Connections: ${options.connections || 10} | ⏱️ Duration: ${options.duration || 5}s`)
  console.log(`========================================`)

  return new Promise((resolve, reject) => {
    const instance = autocannon(options, (err, result) => {
      if (err) return reject(err)
      console.log(`\n📊 Benchmark Results for: ${name}`)
      console.log(`- Requests/sec: ${result.requests.average}`)
      console.log(`- Latency (p50): ${result.latency.p50} ms | (p99): ${result.latency.p99} ms`)
      console.log(`- Throughput: ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`)
      console.log(`- Errors: ${result.errors} | Non-2xx: ${result.non2xx}`)
      resolve(result)
    })
    autocannon.track(instance, { renderProgressBar: true })
  })
}

async function main() {
  try {
    // 1. Tier 1: Baseline Express Runtime & Event Loop Health Check
    await runBenchmark('Tier 1: Baseline Express Runtime (GET /api/health)', {
      url: `${BASE_URL}/api/health`,
      connections: 20,
      duration: 5,
    })

    // 2. Tier 2: Pure In-Memory Algorithmic Evaluation Engine (No DB I/O)
    await runBenchmark('Tier 2: In-Memory Readiness Evaluation (POST /api/readiness/evaluate)', {
      url: `${BASE_URL}/api/readiness/evaluate`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solved: { 'two-sum': true, 'best-time-to-buy-and-sell-stock': true, 'contains-duplicate': true },
        mastery: { 'two-sum': 'independent', 'best-time-to-buy-and-sell-stock': 'mastered' },
        revision: {
          'two-sum': { stage: 3, nextDue: Date.now() + 86400000, lastOutcome: 'efficient' },
        },
        interviews: [],
      }),
      connections: 15,
      duration: 5,
    })

    // 3. Tier 3: Database-Heavy Write Ingestion & Catalog Matching
    await runBenchmark('Tier 3: Database Write Ingestion (POST /api/sync/extension-submission)', {
      url: `${BASE_URL}/api/sync/extension-submission`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syncKey: 'autocannon_perf_tester',
        problemSlug: 'two-sum',
        problemTitle: 'Two Sum',
        platform: 'LeetCode',
        code: 'function twoSum() { return [0, 1]; }',
        runtime: '50ms',
        memory: '40MB',
      }),
      connections: 10,
      duration: 5,
    })

    console.log('\n✅ All tiered benchmarks completed successfully!')
  } catch (err) {
    console.error('Benchmark failed:', err)
  }
}

main()

