import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics
const errorRate = new Rate('novamart_error_rate');
const successfulOrders = new Counter('novamart_successful_orders');
const catalogLatency = new Trend('novamart_catalog_latency_ms');
const checkoutLatency = new Trend('novamart_checkout_latency_ms');

export const options = {
  scenarios: {
    // 1. Smoke test (10 VUs for 30s)
    smoke_test: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '0s',
      gracefulStop: '5s',
    },
    // 2. Baseline load test (100 VUs for 1m)
    baseline_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 100 },
        { duration: '40s', target: 100 },
        { duration: '10s', target: 0 },
      ],
      startTime: '35s',
      gracefulStop: '5s',
    },
    // 3. High Concurrency Staged Ramp (1,000 to 10,000 VUs)
    concurrency_target_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 500 },
        { duration: '1m', target: 2000 },
        { duration: '1m', target: 5000 },
        { duration: '1m', target: 10000 },
        { duration: '30s', target: 0 },
      ],
      startTime: '2m',
      gracefulStop: '10s',
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<400'], // 95% of requests under 400ms
    'novamart_error_rate': ['rate<0.01'], // Error rate under 1%
    'novamart_catalog_latency_ms': ['p(95)<250'],
    'novamart_checkout_latency_ms': ['p(95)<800'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080';

export default function () {
  const userTypeRoll = Math.random();

  if (userTypeRoll < 0.70) {
    // 70% Shoppers: Catalog Browsing, Search, Product Details (Read-Heavy)
    simulateCatalogBrowser();
  } else if (userTypeRoll < 0.90) {
    // 20% Active Buyers: Add to Cart, View Cart, Checkout (Write/Transaction Heavy)
    simulateCheckoutCustomer();
  } else if (userTypeRoll < 0.96) {
    // 6% Delivery Partner: Check Assigned Shipments & Status Updates
    simulateDeliveryPartner();
  } else {
    // 4% Administrator: Inventory Checks & Orders State Machine
    simulateAdminOperations();
  }
}

function simulateCatalogBrowser() {
  group('Catalog Browsing', function () {
    // 1. Fetch categories (Cached in Caffeine)
    let catRes = http.get(`${BASE_URL}/api/categories`);
    check(catRes, { 'categories 200': (r) => r.status === 200 });
    catalogLatency.add(catRes.timings.duration);
    errorRate.add(catRes.status !== 200);

    sleep(Math.random() * 2 + 1); // Realistic 1-3s think time

    // 2. Fetch products listing
    let prodRes = http.get(`${BASE_URL}/api/products`);
    check(prodRes, { 'products 200': (r) => r.status === 200 });
    catalogLatency.add(prodRes.timings.duration);
    errorRate.add(prodRes.status !== 200);

    sleep(Math.random() * 2 + 1);

    // 3. Search query
    let searchRes = http.get(`${BASE_URL}/api/products?query=phone`);
    check(searchRes, { 'search 200': (r) => r.status === 200 });
    catalogLatency.add(searchRes.timings.duration);
    errorRate.add(searchRes.status !== 200);

    // 4. Product Details
    let detailRes = http.get(`${BASE_URL}/api/products/1`);
    check(detailRes, { 'product detail 200': (r) => r.status === 200 });
    catalogLatency.add(detailRes.timings.duration);
    errorRate.add(detailRes.status !== 200);

    sleep(Math.random() * 3 + 2);
  });
}

function simulateCheckoutCustomer() {
  group('Customer Checkout Flow', function () {
    // 1. Authenticate customer
    const loginPayload = JSON.stringify({
      email: 'customer@novamart.com',
      password: 'Customer@123',
    });
    const headers = { 'Content-Type': 'application/json' };

    let loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers });
    let authenticated = check(loginRes, { 'login 200': (r) => r.status === 200 });
    errorRate.add(!authenticated);

    if (authenticated) {
      const token = loginRes.json('data.token');
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // 2. Place direct order with pessimistic stock locking
      const orderPayload = JSON.stringify({
        shippingFullName: 'Concurrent Test User',
        shippingPhone: '9898000004',
        shippingStreetAddress: '100 High Concurrency Ave',
        shippingCity: 'Vadodara',
        shippingState: 'Gujarat',
        shippingPinCode: '390001',
        paymentMethod: 'COD',
        directProductId: 1,
        directQuantity: 1,
      });

      let orderRes = http.post(`${BASE_URL}/api/orders`, orderPayload, { headers: authHeaders });
      checkoutLatency.add(orderRes.timings.duration);

      // Status can be 200 (order created) or 400 (stock exhausted - valid business logic)
      let orderValid = check(orderRes, {
        'order status valid (200 or 400)': (r) => r.status === 200 || r.status === 400,
      });
      if (orderRes.status === 200) {
        successfulOrders.add(1);
      }
      errorRate.add(!orderValid);

      // 3. View user orders
      let ordersRes = http.get(`${BASE_URL}/api/orders`, { headers: authHeaders });
      check(ordersRes, { 'user orders 200': (r) => r.status === 200 });
    }

    sleep(Math.random() * 2 + 1);
  });
}

function simulateDeliveryPartner() {
  group('Delivery Partner Portal', function () {
    const loginPayload = JSON.stringify({
      email: 'partner@novamart.com',
      password: 'Partner@123',
    });
    const headers = { 'Content-Type': 'application/json' };

    let loginRes = http.post(`${BASE_URL}/api/delivery-partners/login`, loginPayload, { headers });
    if (loginRes.status === 200) {
      const token = loginRes.json('data.token');
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      let assignedRes = http.get(`${BASE_URL}/api/delivery-partners/deliveries/assigned`, { headers: authHeaders });
      check(assignedRes, { 'partner deliveries 200': (r) => r.status === 200 });
      errorRate.add(assignedRes.status !== 200);
    }
    sleep(Math.random() * 3 + 2);
  });
}

function simulateAdminOperations() {
  group('Admin Management', function () {
    const loginPayload = JSON.stringify({
      email: 'admin@novamart.com',
      password: 'Admin@123',
    });
    const headers = { 'Content-Type': 'application/json' };

    let loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers });
    if (loginRes.status === 200) {
      const token = loginRes.json('data.token');
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      let statsRes = http.get(`${BASE_URL}/api/admin/orders/analytics`, { headers: authHeaders });
      check(statsRes, { 'admin analytics 200': (r) => r.status === 200 });
      errorRate.add(statsRes.status !== 200);
    }
    sleep(Math.random() * 4 + 2);
  });
}
