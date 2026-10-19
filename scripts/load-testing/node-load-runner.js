/**
 * NovaMart High-Concurrency Non-Containerized Load Runner
 * Simulates concurrent virtual users (VUs) with realistic workflows:
 * - Public catalog browsing & search (Caffeine cache verification)
 * - Concurrent checkout with pessimistic row locking (Overselling prevention test)
 * - Computes p50, p95, p99 latency histograms, RPS, and error rates.
 */

const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:8080';
const urlObj = new URL(BASE_URL);
const HTTP_HOST = urlObj.hostname;
const HTTP_PORT = urlObj.port || 8080;

// High-capacity Keep-Alive HTTP Agent for high throughput load testing
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 500,
  maxFreeSockets: 100,
  timeout: 15000,
});

function httpRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();
    const payload = data ? JSON.stringify(data) : null;

    const reqHeaders = {
      'Accept': 'application/json',
      ...headers,
    };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request({
      hostname: HTTP_HOST,
      port: HTTP_PORT,
      path: path,
      method: method,
      headers: reqHeaders,
      agent: agent,
      timeout: 10000,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        let json = null;
        try { json = JSON.parse(body); } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          rawBody: body,
          durationMs,
          error: null,
        });
      });
    });

    req.on('error', (err) => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1e6;
      resolve({
        status: 0,
        headers: {},
        data: null,
        rawBody: '',
        durationMs,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Request timed out'));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

function calculatePercentiles(latencies) {
  if (latencies.length === 0) return { p50: 0, p95: 0, p99: 0, min: 0, max: 0, avg: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const getP = (p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  return {
    p50: getP(50).toFixed(2),
    p95: getP(95).toFixed(2),
    p99: getP(99).toFixed(2),
    min: sorted[0].toFixed(2),
    max: sorted[sorted.length - 1].toFixed(2),
    avg: (sum / sorted.length).toFixed(2),
  };
}

async function runStage(stageName, virtualUsers, totalRequests, testFn) {
  console.log(`\n======================================================================`);
  console.log(`🚀 STAGE: ${stageName}`);
  console.log(`Virtual Users (Concurrency): ${virtualUsers} | Total Requests: ${totalRequests}`);
  console.log(`======================================================================`);

  const latencies = [];
  let successful = 0;
  let failed = 0;
  let requestIndex = 0;

  const stageStartTime = Date.now();

  const worker = async () => {
    while (true) {
      const current = requestIndex++;
      if (current >= totalRequests) break;

      const result = await testFn(current);
      latencies.push(result.durationMs);

      if (result.status >= 200 && result.status < 400) {
        successful++;
      } else {
        failed++;
      }
    }
  };

  const pool = Array.from({ length: virtualUsers }, () => worker());
  await Promise.all(pool);

  const durationSec = (Date.now() - stageStartTime) / 1000;
  const rps = (totalRequests / durationSec).toFixed(2);
  const metrics = calculatePercentiles(latencies);
  const errorRate = ((failed / totalRequests) * 100).toFixed(2);

  console.log(`\n📊 RESULTS for ${stageName}:`);
  console.log(`- Duration: ${durationSec.toFixed(2)}s`);
  console.log(`- Requests Per Second (RPS): ${rps}`);
  console.log(`- Successful Requests: ${successful} (${((successful / totalRequests) * 100).toFixed(1)}%)`);
  console.log(`- Failed/Error Requests: ${failed} (${errorRate}%)`);
  console.log(`- Latency: avg=${metrics.avg}ms, p50=${metrics.p50}ms, p95=${metrics.p95}ms, p99=${metrics.p99}ms, min=${metrics.min}ms, max=${metrics.max}ms`);

  return { stageName, virtualUsers, totalRequests, durationSec, rps, successful, failed, errorRate, metrics };
}

async function main() {
  console.log(`Target Backend: ${BASE_URL}`);

  // 1. Health Probe
  console.log('Checking backend Actuator health probe...');
  const health = await httpRequest('GET', '/actuator/health');
  if (health.status !== 200) {
    console.error(`Backend is not responding on ${BASE_URL}. Ensure Spring Boot is started first.`);
    process.exit(1);
  }
  console.log(`✅ Backend Health Status: ${health.data?.status || 'UP'} (HTTP 200 in ${health.durationMs.toFixed(1)}ms)`);

  const summary = [];

  // STAGE 1: Smoke Test (10 VUs, 50 requests - Read Heavy Catalog)
  const smoke = await runStage('Stage 1: Smoke Test (10 VUs)', 10, 50, async () => {
    return await httpRequest('GET', '/api/products');
  });
  summary.push(smoke);

  // STAGE 2: Baseline Load (50 VUs, 200 requests - Cached Categories & Brands)
  const baseline = await runStage('Stage 2: Baseline Catalog Cache (50 VUs)', 50, 200, async (idx) => {
    const endpoint = idx % 2 === 0 ? '/api/categories' : '/api/products/brands';
    return await httpRequest('GET', endpoint);
  });
  summary.push(baseline);

  // STAGE 3: Product Search & Filter (100 VUs, 300 requests)
  const searchTest = await runStage('Stage 3: Search & Filter (100 VUs)', 100, 300, async (idx) => {
    const queries = ['phone', 'laptop', 'watch', 'headphone', 'shoes'];
    const q = queries[idx % queries.length];
    return await httpRequest('GET', `/api/products?query=${q}`);
  });
  summary.push(searchTest);

  // STAGE 4: Concurrent Checkout & Pessimistic Lock Test (50 VUs, 50 orders)
  console.log('\n--- Authenticating Customer for Concurrent Checkout Test ---');
  let token = null;
  let loginRes = await httpRequest('POST', '/api/auth/login', {
    email: 'loadtester@novamart.com',
    password: 'Password@123',
  });

  if (loginRes.status === 200 && loginRes.data?.data?.token) {
    token = loginRes.data.data.token;
  } else {
    // Attempt registration if not registered
    const regRes = await httpRequest('POST', '/api/auth/register', {
      fullName: 'Load Test Customer',
      email: 'loadtester@novamart.com',
      password: 'Password@123',
      phone: '9898000099'
    });
    if (regRes.status === 200 && regRes.data?.data?.token) {
      token = regRes.data.data.token;
    }
  }

  if (token) {
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // Inspect initial product stock
    const productBefore = await httpRequest('GET', '/api/products/1');
    const initialStock = productBefore.data?.data?.stock ?? 0;
    console.log(`Product ID 1 Initial Stock before concurrent checkout: ${initialStock}`);

    let ordersPlaced = 0;
    let stockExhausted = 0;

    const checkoutStage = await runStage('Stage 4: Concurrent Checkout with Row Locking (50 VUs)', 50, 50, async (idx) => {
      const orderPayload = {
        shippingFullName: `Load Tester ${idx}`,
        shippingPhone: '9898000004',
        shippingStreetAddress: '100 Concurrency Boulevard',
        shippingCity: 'Vadodara',
        shippingState: 'Gujarat',
        shippingPinCode: '390001',
        paymentMethod: 'COD',
        directProductId: 1,
        directQuantity: 1,
      };

      const res = await httpRequest('POST', '/api/orders', orderPayload, authHeaders);
      if (res.status === 200) {
        ordersPlaced++;
      } else if (res.status === 400 && res.rawBody.includes('stock')) {
        stockExhausted++;
      }
      return res;
    });
    summary.push(checkoutStage);

    // Verify inventory consistency
    const productAfter = await httpRequest('GET', '/api/products/1');
    const finalStock = productAfter.data?.data?.stock ?? 0;
    console.log(`\n🔒 INVENTORY CONSISTENCY AUDIT:`);
    console.log(`- Initial Stock: ${initialStock}`);
    console.log(`- Orders Successfully Placed: ${ordersPlaced}`);
    console.log(`- Rejections due to Exhausted Stock: ${stockExhausted}`);
    console.log(`- Final Stock in Database: ${finalStock}`);
    const expectedStock = Math.max(0, initialStock - ordersPlaced);
    if (finalStock === expectedStock) {
      console.log(`✅ Inventory integrity verified: No overselling occurred under concurrent load!`);
    } else {
      console.error(`❌ INVENTORY DISCREPANCY DETECTED: Expected ${expectedStock}, found ${finalStock}`);
    }
  } else {
    console.warn('⚠️ Could not log in as customer@novamart.com. Skipping Stage 4 checkout test.');
  }

  // Summary Table
  console.log(`\n======================================================================`);
  console.log(`🏆 FINAL LOAD TEST BENCHMARK SUMMARY`);
  console.log(`======================================================================`);
  console.log(`Stage Name | Concurrency | RPS | p50 (ms) | p95 (ms) | p99 (ms) | Error Rate`);
  console.log(`----------------------------------------------------------------------`);
  for (const s of summary) {
    console.log(`${s.stageName.padEnd(35)} | ${String(s.virtualUsers).padEnd(11)} | ${s.rps.padEnd(6)} | ${s.metrics.p50.padEnd(8)} | ${s.metrics.p95.padEnd(8)} | ${s.metrics.p99.padEnd(8)} | ${s.errorRate}%`);
  }
}

main().catch(console.error);
