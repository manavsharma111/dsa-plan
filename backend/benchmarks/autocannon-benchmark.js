import autocannon from 'autocannon'

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
      resolve(result)
    })
    autocannon.track(instance, { renderProgressBar: true })
  })
}

async function main() {
  try {
    // 1. Raw Engine Benchmark
    await runBenchmark('1. High-Speed Health & DB Check', {
      url: `${BASE_URL}/api/health`,
      connections: 20,
      duration: 5,
    })

    // 2. Cloud Ingestion Benchmark
    await runBenchmark('2. Extension Ingestion & Catalog Matching', {
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

    console.log('\n✅ All benchmarks completed successfully!')
  } catch (err) {
    console.error('Benchmark failed:', err)
  }
}

main()
