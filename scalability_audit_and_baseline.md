# NovaMart Scalability Audit & Architecture Baseline Report
**Target: 10,000 Concurrent Users (Non-Containerized Architecture)**  
**Platform:** NovaMart Educational B2C E-Commerce Platform  
**Environment:** Windows, React 19 + Vite, Spring Boot 3.3.4 (Java 21), MySQL 8.0  
**Date:** October 2026  

---

## 1. Executive Summary & Capacity Math

The primary objective is preparing NovaMart for a measured, reliable path toward **10,000 simultaneous concurrent users** without using Docker or containerization.

### Concurrency vs. Throughput Realities
In realistic web e-commerce traffic, 10,000 concurrent users do not hit the database in the exact same millisecond. They exhibit human "think time" (typically 3 to 7 seconds between clicks/page navigations):
- **10,000 concurrent users with 5s think time** = **~2,000 Requests Per Second (RPS)**.
- **10,000 concurrent users with 2s think time (peak flash sale)** = **~5,000 Requests Per Second (RPS)**.

### Why the Baseline Setup Would Collapse Under ~100-200 Users
1. **Default HikariCP Connection Pool:** Default is 10 connections. At 20ms average query latency, 10 connections can handle at most $10 \times (1000/20) = 500$ queries/sec. If any query takes 100ms (due to unindexed table scans or eager joins), throughput drops below 100 RPS and connection pool starvation (`Connection is not available, request timed out`) immediately crashes all endpoints.
2. **Tomcat Thread Pool:** Default max threads is 200. Under synchronous blocking I/O on Java platform threads, 200 threads get exhausted within seconds when connection waits occur.
3. **Missing MySQL Indexes:** No custom composite or secondary indexes exist on `products`, `orders`, `order_items`, `cart_items`, or `reviews`. Every catalog filter and order history lookup executes a full table scan.
4. **Unbounded Catalog & Memory Sorting:** `ProductService.getProducts` queries all rows into the JVM heap and sorts them using Java `Comparator` in memory without SQL pagination.
5. **Rigid Rate Limiter:** `RateLimiterService` hardcodes a 60 requests/minute (1 req/sec) limit per IP, with no configuration toggle for load testing.
6. **Checkout Race Condition:** Stock decrement has no concurrency control (`SELECT` followed by `UPDATE`), allowing massive overselling when concurrent users purchase the last available stock.

---

## 2. Baseline Status Verification

| Metric / Stage | Measured Baseline | Verification Tool / Command |
| :--- | :--- | :--- |
| **Frontend Code Quality** | 0 errors, 20 warnings | `npm run lint` (`oxlint`) |
| **Frontend Build Time** | 4.57 seconds | `npm run build` (Vite 8.3.2) |
| **Frontend Initial Bundle** | 562 kB uncompressed (225 kB app + 247 kB React + 64 kB vendor) | Rollup asset inspection |
| **Backend Compilation** | 90 source files compiled cleanly | Maven 3.9.16 (`javac` Java 21) |
| **Backend Test Suite** | 8/8 Passed (0 errors, 0 failures) in 22.9s | `mvn clean test` |
| **Java Runtime** | OpenJDK 21.0.12.1 Temurin LTS | `java -version` |
| **MySQL Engine** | Running on localhost:3306 (service `MySQL267`) | TCP port probe |
| **Code Splitting** | None (All 18 customer, admin, and delivery routes statically imported) | Code inspection of `App.jsx` |
| **Catalog Pagination** | None (All items loaded into DOM) | Code inspection of `ProductListingPage.jsx` |
| **Database Indexes** | Primary Keys & Uniques only (0 performance indexes) | DDL inspection of `schema.sql` |
| **Concurrency Control** | Non-locking read-then-write (High overselling risk) | Code inspection of `OrderService.java` |

---

## 3. Prioritized Scalability Audit Matrix

| Issue ID | Affected File(s) | Evidence | Severity | Recommended Solution | Risk / Mitigation | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PERF-01** | `backend/src/main/resources/application.properties` | No HikariCP configuration (default pool size = 10) | **CRITICAL** | Configure tuned HikariCP pool (`maximum-pool-size=50-100`, `minimum-idle=20`, `connection-timeout=10000ms`, `idle-timeout=300000ms`). | High pool sizes can saturate MySQL max connections. Tune MySQL `max_connections` accordingly. | Connection pool saturation load test |
| **PERF-02** | `backend/src/main/resources/application.properties` | Platform threads used; Java 21 virtual threads disabled | **CRITICAL** | Enable `spring.threads.virtual.enabled=true` and tune Tomcat `accept-count`, `max-connections`. | Low risk in Spring Boot 3.3.4 + Java 21. Verify thread dumps under load. | Thread dump and VU load tests |
| **PERF-03** | `backend/src/main/resources/schema.sql` | Missing indexes on `orders(user_id)`, `products(category_id, brand, price)`, etc. | **CRITICAL** | Add high-selectivity composite B-Tree indexes on query filter columns. | Slight write overhead on inserts. Negligible compared to read speedup. | `EXPLAIN` query execution plans |
| **PERF-04** | `backend/src/main/java/com/ecommerce/service/OrderService.java` | Unprotected stock decrement (`findById` then `save` without lock) | **CRITICAL** | Implement atomic database update or pessimistic write lock (`LockModeType.PESSIMISTIC_WRITE`) during stock decrement. | Lock contention during flash sales. Keep lock scope minimal. | Concurrent checkout unit & load test |
| **PERF-05** | `backend/src/main/java/com/ecommerce/service/ProductService.java` | In-memory sorting (`products.sort(...)`) and unbounded result set | **HIGH** | Push sorting to database via `Pageable` and SQL `ORDER BY`; return paginated `Page<ProductDto>`. | Breaking API contract if frontend expects raw array. Keep backward compatibility with wrapper. | API pagination tests & frontend verification |
| **PERF-06** | `backend/src/main/java/com/ecommerce/security/ratelimit/RateLimiterService.java` | Hardcoded 60 req/min per IP without config toggle | **HIGH** | Make rate limiting configurable via properties (`app.rate-limiting.enabled`, `app.rate-limiting.general-capacity`) and use sliding window / LRU cache for buckets. | Do not disable in production; allow parameter tuning for testing and burst allowance. | k6 load test with high VU counts |
| **PERF-07** | `frontend/src/App.jsx` | Static synchronous imports of all 18 routes (Admin + Partner + Customer) | **HIGH** | Implement `React.lazy()` with `Suspense` fallback for route-based code splitting. | Flash of loading spinner if chunk load is slow. Use subtle skeletons. | Vite bundle analysis (`dist` chunk sizes) |
| **PERF-08** | `frontend/src/pages/customer/ProductListingPage.jsx` | Unpaginated DOM rendering & client-side filtering | **HIGH** | Implement client pagination (or API pagination with page size = 12/24) and debounced search. | Preserves existing catalog look while preventing DOM bloating. | Browser profiling & memory inspection |
| **PERF-09** | `backend/src/main/java/com/ecommerce/entity/Product.java` | `@ManyToOne(fetch = FetchType.EAGER) private Category category;` | **MEDIUM** | Change to `FetchType.LAZY` or use `@EntityGraph` to eliminate N+1 queries. | `LazyInitializationException` if accessed outside transaction. Ensure DTO mapping in `@Transactional(readOnly = true)`. | SQL query count logging during product fetch |
| **PERF-10** | `backend/pom.xml` | Missing Spring Boot Actuator & Micrometer | **MEDIUM** | Add `spring-boot-starter-actuator` for health checks, connection pool monitoring, and JVM metrics. | Secure Actuator endpoints with Spring Security. | `GET /actuator/health` and `/actuator/metrics` |
| **PERF-11** | `backend/src/main/java/com/ecommerce/service/OrderService.java` | Random 6-digit order number generation (`ORD-100000..999999`) | **MEDIUM** | Use collision-free timestamp + nano/random alphanumeric ID to prevent unique constraint crashes. | None. Order numbers remain human-readable and unique. | Batch order creation verification |
| **PERF-12** | `backend/src/main/java/com/ecommerce/service/OrderService.java` | Stock decrement double-deducts available stock | **HIGH** | Fix available stock calculation and stock decrement logic. | Consistent stock inventory across carts, listings, and checkout. | Inventory consistency unit test |
