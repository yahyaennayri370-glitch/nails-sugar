/**
 * Custom Node.js Load & Stress Test Suite
 * Executable directly via: `npx tsx tests/load/run-load-test.ts`
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENT_REQUESTS = 50;
const TOTAL_REQUESTS = 250;

interface TestMetrics {
  total: number;
  successful: number;
  failed: number;
  durations: number[];
  statusCodes: Record<number, number>;
}

async function runLoadTest() {
  console.log(`\n🚀 Starting Load & Stress Test against ${BASE_URL}...`);
  console.log(`Target: ${TOTAL_REQUESTS} requests across ${CONCURRENT_REQUESTS} concurrent workers.\n`);

  const metrics: TestMetrics = {
    total: 0,
    successful: 0,
    failed: 0,
    durations: [],
    statusCodes: {}
  };

  const endpoints = [
    '/api/services',
    '/api/gallery',
    '/api/appointments/available-slots?date=2026-10-15',
    '/'
  ];

  const startTime = Date.now();

  async function worker() {
    while (metrics.total < TOTAL_REQUESTS) {
      metrics.total++;
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const reqStart = Date.now();

      try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        const duration = Date.now() - reqStart;
        metrics.durations.push(duration);

        metrics.statusCodes[response.status] = (metrics.statusCodes[response.status] || 0) + 1;

        if (response.ok || response.status === 400) {
          metrics.successful++;
        } else {
          metrics.failed++;
        }
      } catch (err) {
        metrics.failed++;
        metrics.statusCodes[500] = (metrics.statusCodes[500] || 0) + 1;
      }
    }
  }

  const workers = Array.from({ length: CONCURRENT_REQUESTS }, () => worker());
  await Promise.all(workers);

  const totalTime = (Date.now() - startTime) / 1000;
  const sortedDurations = metrics.durations.sort((a, b) => a - b);
  const avgDuration = metrics.durations.reduce((a, b) => a + b, 0) / metrics.durations.length || 0;
  const p95Duration = sortedDurations[Math.floor(sortedDurations.length * 0.95)] || 0;
  const p99Duration = sortedDurations[Math.floor(sortedDurations.length * 0.99)] || 0;
  const rps = (metrics.total / totalTime).toFixed(2);

  console.log('====================================================');
  console.log('📊 LOAD & PERFORMANCE TEST RESULTS SUMMARY');
  console.log('====================================================');
  console.log(`Total Requests Sent : ${metrics.total}`);
  console.log(`Successful Requests  : ${metrics.successful}`);
  console.log(`Failed Requests      : ${metrics.failed}`);
  console.log(`Total Time Elapsed  : ${totalTime.toFixed(2)} seconds`);
  console.log(`Requests / Second   : ${rps} req/sec`);
  console.log(`Average Latency     : ${avgDuration.toFixed(2)} ms`);
  console.log(`p95 Latency         : ${p95Duration} ms`);
  console.log(`p99 Latency         : ${p99Duration} ms`);
  console.log('----------------------------------------------------');
  console.log('HTTP Status Code Distribution:');
  Object.entries(metrics.statusCodes).forEach(([code, count]) => {
    console.log(`  HTTP ${code}: ${count}`);
  });
  console.log('====================================================\n');
}

runLoadTest().catch(console.error);
