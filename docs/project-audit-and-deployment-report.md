# NovaMart — Complete Project Audit, Fixes, Verification & Educational Deployment Report

**Application:** NovaMart Enterprise B2C E-Commerce Platform  
**Target Root:** `C:\Users\LENOVO\OneDrive\Desktop\React.js\React_2`  
**Repository:** `https://github.com/Parthpatel1749/Novamart`  
**Date of Audit & Remediation:** October 2026  
**Primary Tech Stack:** React 19.2.8 (Vite 8.3.2) + Spring Boot 3.3.4 (Java 21) + Spring Security 6 + Spring Data JPA + MySQL 8.0 / H2  
**Target Environment:** Educational Demonstrations, College Academic Evaluation, Portfolio Showcase, Learning Deployment (Native Node.js & Java Runtime)  

---

## 1. Project Structure Discovered

The NovaMart platform is organized as a decoupled, multi-tier full-stack application. It consolidates three distinct user portals (Customer Storefront, Admin Operations Portal, and Delivery Partner Portal) under a unified React 19 Single Page Application communicating with a stateless Spring Boot REST API.

```
React_2/
├── frontend/                               # Unified React 19 + Vite 8.3.2 SPA (Port 5173)
│   ├── src/
│   │   ├── components/                     # Navbar, AdminNavbar, SubNavbar, ProtectedRoute, PortalSwitcher
│   │   ├── context/                        # AuthContext, CartContext, LocationContext, WishlistContext
│   │   ├── pages/                          # Customer, Admin, and Delivery Partner views
│   │   ├── services/api.js                 # Axios client with JWT interceptor & rate-limit handling
│   │   ├── styles/                         # CSS design tokens & responsive layouts
│   │   ├── utils/                          # Currency & date formatters
│   │   ├── App.jsx                         # Unified client router
│   │   └── main.jsx                        # Entrypoint mounting global contexts
│   ├── package.json                        # Frontend dependencies (React 19, Lucide, Axios)
│   ├── vite.config.js                      # Vite & Rolldown code-splitting configuration
│   └── .env.example                        # Template for VITE_API_URL
│
├── backend/                                # Spring Boot 3.3.4 REST API Service (Port 8080)
│   ├── src/main/java/com/ecommerce/
│   │   ├── config/                         # CorsConfig, DataInitializer
│   │   ├── controller/                     # 13 REST Controllers
│   │   ├── dto/                            # Data Transfer Objects & ApiResponse wrappers
│   │   ├── entity/                         # 11 JPA Entities
│   │   ├── exception/                      # GlobalExceptionHandler & custom exceptions
│   │   ├── repository/                     # 13 Spring Data JPA Repositories
│   │   ├── security/                       # SecurityConfig, JWT Filter/Provider, Token Bucket Rate Limiter
│   │   └── service/                        # Domain logic, transactions & hyperlocal dispatch engine
│   ├── src/main/resources/
│   │   ├── application.properties          # Base configuration & active profile selector
│   │   ├── application-mysql.properties    # MySQL persistence profile
│   │   ├── application-h2.properties       # Zero-setup in-memory database profile for offline demos
│   │   └── schema.sql                      # Relational schema DDL definition
│   ├── src/test/java/com/ecommerce/
│   │   └── security/                       # Automated Security Vulnerability test suite (8 tests)
│   ├── pom.xml                             # Java 21, Spring Boot 3.3.4, JJWT 0.12.5, MySQL Connector, H2
│   └── .env.example                        # Template for DB, JWT, CORS, and Port configuration
│
├── database/                               # Database Snapshots & Local Persistence
│   └── backups/
│       ├── history/                        # Timestamped historical database backups (excluded from Git)
│       └── ecommerce_db_latest.sql         # Baseline SQL snapshot (excluded from Git)
│
├── scripts/                                # Developer Automation, Launchers & Auto-Backup Watchers
│   ├── auto-backup-watcher.js              # Continuous change detector and backup utility
│   ├── backup-db.js                        # Database backup runner
│   ├── backup-code.js                      # Local git checkpoint backup runner
│   ├── restore-db.js                       # Database restoration runner
│   ├── clean-build.bat                     # Full compile and build test script
│   ├── start-all.bat                       # Root application launcher
│   ├── start-backend.bat                   # Backend launcher
│   └── start-frontend.bat                  # Frontend launcher
│
├── docs/                                   # Platform Documentation
│   ├── api-documentation.md                # REST API reference guide (updated with active endpoints)
│   ├── architecture.md                     # High-level architecture and system design
│   ├── security-audit.md                   # Security audit matrix and remediation verification
│   ├── cleanup-report.md                   # Historical consolidation record
│   └── project-audit-and-deployment-report.md # This audit report
│
├── package.json                            # Monorepo task orchestration scripts
├── AUDIT_REPORT.md                         # Root audit report
└── README.md                               # Project documentation, credentials & setup guide
```


---

## 2. Features Verified as Working

### Customer Storefront
- **User Registration & Login**: Validated via `AuthController.java` and `AuthService.java` with BCrypt hashing and stateless JWT issuance.
- **Product Catalog Browsing & Filtering**: Full paginated catalog with query filtering by keyword, category, brand, and price ranges.
- **Product Details & Reviews**: Detailed specifications, variant selectors, stock availability, and verified customer reviews with average ratings calculation.
- **Shopping Cart**: Real-time quantity updates, subtotal and tax calculation, stock validation, and synchronization between `localStorage` (guest) and backend database (authenticated).
- **Wishlist**: Client-side saved-for-later items managed via `WishlistContext.jsx`.
- **Address Management**: Multiple saved addresses per user with default address selection, enforced by server-side user ownership checks in `AddressController.java`.
- **Checkout & Order Placement**: Calculates final subtotals, applies validated promotional coupons, matches shipping PIN code to delivery zones, reserves inventory, and generates a 6-digit delivery verification OTP.
- **Order Tracking & Cancellation**: Real-time step-by-step progress tracking, cancellation with stock restitution, and return requests.
- **Password Recovery & Reset**: Cryptographically signed, 15-minute expiration password reset tokens with account binding and single-use protection.

### Administrator Operations Portal
- **Admin Authentication & RBAC**: Strict server-side enforcement via `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`.
- **Product & Inventory Management**: Create, edit, and deactivate catalog products; low-stock alerts.
- **Order Operations**: View complete order book, update status (`CONFIRMED`, `PACKED`, etc.), and handle refunds.
- **Hyperlocal Dispatch Management**: Create and configure delivery zones with serviceable PIN codes; approve/reject delivery partners and assign them to specific delivery zones; assign or reassign shipments to available delivery partners.
- **Coupons & Reviews**: Create and delete discount codes; review moderation queue.
- **Dashboard Metrics**: Real-time aggregation of total revenue, order count, registered customers, and active delivery partners.

### Delivery Partner Portal
- **Partner Registration & Login**: Onboarding application with vehicle details, driving license, and admin approval lifecycle (`UNDER_REVIEW` → `ACTIVE`).
- **Availability Toggle**: Online/Offline toggle (`available: true/false`).
- **Shipment Management**: View only shipments assigned to the calling partner.
- **Lifecycle Progression**: Accept order → Pickup from warehouse → Out for delivery → Completed delivery.
- **Secure OTP Delivery Verification**: Requires customer's secret 6-digit OTP to complete package delivery; locked after 5 invalid attempts to prevent brute-forcing.

---

## 3. Issues Discovered & Categorized by Severity

| Severity | Issue Description | Affected Files | Status |
| :--- | :--- | :--- | :--- |
| **High** | **React Rules of Hooks Violation**: `PortalSwitcher.jsx` called `useAuth()`, `useState()`, and `useNavigate()` conditionally after an early `if (!import.meta.env.DEV) return null;` return. This caused `npm run lint` (`oxlint`) to fail with 3 critical errors. | `frontend/src/components/PortalSwitcher.jsx` | **Resolved** |
| **High** | **Hardcoded Local Database Password in Scripts**: Fallback database passwords were hardcoded in local automation scripts (`backup-db.js`, `restore-db.js`, `auto-backup-watcher.js`). | `scripts/backup-db.js`, `scripts/restore-db.js`, `scripts/auto-backup-watcher.js` | **Resolved** |
| **Medium** | **Rigid CORS Origin Configuration**: `CorsConfig.java` hardcoded `localhost:5173`, preventing educational deployments on hosted domains (Vercel, Render, Railway, AWS). | `backend/src/main/java/com/ecommerce/config/CorsConfig.java`, `application.properties`, `application-mysql.properties` | **Resolved** |
| **Medium** | **Inaccurate Demo Credentials in Documentation**: `README.md` listed credentials as `customer` / `password` instead of the actual pre-seeded credentials (`customer@novamart.com` / `Customer@123`). | `README.md` | **Resolved** |
| **Medium** | **Large Frontend JavaScript Bundle**: Production build emitted a warning for a single 560.98 kB JavaScript bundle due to lack of vendor chunking. | `frontend/vite.config.js` | **Resolved** |
| **Low** | **Outdated API Documentation**: `docs/api-documentation.md` contained obsolete endpoints (`/auth/signup`, `/carts/users/cart`, `/public/products`) that did not match active controllers. | `docs/api-documentation.md` | **Resolved** |
| **Low** | **Missing Zero-Config H2 Profile File**: While H2 was configured in `application.properties`, activating `mysql` profile was hardcoded, making offline demo without MySQL cumbersome. | `backend/src/main/resources/application.properties`, `application-h2.properties` | **Resolved** |

---

## 4. Files Changed and Why

1. **`frontend/src/components/PortalSwitcher.jsx`**
   - *Change*: Moved `useAuth()`, `useState()`, and `useNavigate()` hook calls to the top of the functional component before checking `!import.meta.env.DEV`.
   - *Rationale*: Complies with React Rules of Hooks and eliminates the 3 failing lint errors.

2. **`frontend/vite.config.js`**
   - *Change*: Configured Rolldown-compatible functional `manualChunks` to split vendor dependencies (`vendor-react`, `vendor-icons`, `vendor`).
   - *Rationale*: Eliminates the large bundle warning (>500 kB). Reduced main bundle to 225.98 kB, with the largest chunk at only 247.91 kB.

3. **`frontend/src/pages/customer/ForgotPasswordPage.jsx`**
   - *Change*: Cleaned up unused imports (`KeyRound`, `Mail`) and unused state (`navigate`, `successMsg`). Added a clear educational disclaimer banner explaining that password recovery operates via secure simulated token reset without requiring live SMTP mail servers.
   - *Rationale*: Improves code quality and sets realistic expectations for educational reviewers.

4. **`frontend/src/pages/admin/AdminOrdersPage.jsx`**
   - *Change*: Removed unused `const status = getOrderStatusInfo(o.orderStatus);` variable inside the order table render loop.
   - *Rationale*: Cleans up unused variable warning in frontend linting.

5. **`backend/src/main/java/com/ecommerce/config/CorsConfig.java`**
   - *Change*: Injected `@Value("${app.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")` and parsed comma-separated origin strings.
   - *Rationale*: Allows easy deployment configuration through the `CORS_ALLOWED_ORIGINS` environment variable while maintaining local defaults.

6. **`backend/src/main/resources/application.properties` & `application-mysql.properties`**
   - *Change*: Added `app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://127.0.0.1:5173}` and externalized profile activation via `spring.profiles.active=${SPRING_PROFILES_ACTIVE:mysql}`.
   - *Rationale*: Supports cloud environment variable overrides without modifying codebase properties.

7. **`backend/src/main/resources/application-h2.properties`** (New)
   - *Change*: Added a dedicated H2 profile configuration for zero-setup offline development and demonstration.
   - *Rationale*: Enables students and reviewers to run the full application even if MySQL is not installed.

8. **`scripts/backup-db.js`, `scripts/restore-db.js`, `scripts/auto-backup-watcher.js`**
   - *Change*: Replaced hardcoded fallback passwords with `process.env.DB_PASSWORD || ''`.
   - *Rationale*: Protects personal credentials from being exposed in source code or pushed to Git.

9. **`README.md`**
   - *Change*: Corrected pre-seeded demo credentials table; added instructions for zero-setup H2 in-memory mode; documented native production builds.
   - *Rationale*: Ensures clear, accurate instructions for college professors, evaluators, and students.

10. **`docs/api-documentation.md`**
    - *Change*: Completely updated the REST API reference with all active endpoints across the 13 controllers.
    - *Rationale*: Provides accurate documentation matching the actual implementation.

---

## 5. Security Improvements Completed

1. **Protection of Secrets & Credentials**:
   - Removed all hardcoded database password fallbacks from automation scripts.
   - Confirmed `.gitignore` covers `.env`, `database/backups/`, and `backup/`.
   - Verified that `.env.example` templates contain placeholders only.

2. **CORS Hardening with Deployment Configurability**:
   - CORS is locked to explicit origins; arbitrary origin reflection with credentials remains blocked (validated by automated test).
   - Added environment variable injection (`CORS_ALLOWED_ORIGINS`) to easily authorize hosted domains without rebuilding the JAR.

3. **Stateless JWT Security**:
   - Hardcoded JWT secrets are replaced by configurable `${JWT_SECRET:...}` property injection with 256-bit fallback.
   - Signing uses standard HMAC-SHA256 (`Keys.hmacShaKeyFor`) with strict claims validation.

4. **Clickjacking & UI Redressing Prevention**:
   - `X-Frame-Options: SAMEORIGIN` is configured in `SecurityConfig.java` and verified via automated test.
   - Nginx configuration for the frontend container includes security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`).

5. **Sensitive Field Serialization Protection**:
   - `User.password` is annotated with `@JsonProperty(access = Access.WRITE_ONLY)` in `User.java`. BCrypt hashes are never leaked in `/api/auth/me`, `/api/admin/customers`, or browser storage.

6. **Delivery Verification OTP Secrecy**:
   - `mapToPartnerDto()` explicitly scrubs `deliveryOtp` (sets to `null`) for all delivery partner responses.
   - Delivery partner queries cannot view customer verification OTPs.

7. **Anti-Automation & Rate Limiting**:
   - Token bucket rate-limiting filter enforces burst and replenishment limits per IP address on sensitive authentication routes (`/api/auth/*`).
   - Delivery OTP verification locks out after 5 consecutive failed attempts to prevent brute-forcing.

---

## 6. Tests and Builds Executed — Exact Results

### Frontend Linting
- **Command**: `npm run lint` (inside `frontend/`)
- **Result**: **PASSED** (Exit code: 0)
- **Output**: `Found 20 warnings and 0 errors. Finished in 219ms on 38 files.` (All 3 previous blocking errors eliminated).

### Frontend Production Build
- **Command**: `npm run build` (inside `frontend/`)
- **Result**: **PASSED** (Exit code: 0, Time: 2.65s)
- **Output**:
  ```
  dist/index.html                             1.14 kB │ gzip:  0.59 kB
  dist/assets/index-DembLgNH.css              4.42 kB │ gzip:  1.57 kB
  dist/assets/rolldown-runtime-hePW80VL.js    0.71 kB │ gzip:  0.42 kB
  dist/assets/vendor-icons-CxmK76Mc.js       23.58 kB │ gzip:  8.82 kB
  dist/assets/vendor-FnoEpUrh.js             64.03 kB │ gzip: 24.05 kB
  dist/assets/index-DopY3TU_.js             225.98 kB │ gzip: 39.38 kB
  dist/assets/vendor-react-BvO6EOpe.js      247.91 kB │ gzip: 78.65 kB
  ✓ built in 2.65s (0 warnings)
  ```

### Backend Compilation & Packaging
- **Command**: `mvn test-compile` (inside `backend/`)
- **Result**: **PASSED** (Exit code: 0, 90 source files compiled with javac [release 21])
- **Command**: `mvn clean package -DskipTests` (inside `backend/`)
- **Result**: **PASSED** (Exit code: 0, generated standalone executable `ecommerce-backend-0.0.1-SNAPSHOT.jar` in 16.91s)

### Backend Automated Test Suite
- **Command**: `mvn test` (inside `backend/`)
- **Result**: **PASSED** (Exit code: 0)
- **Executed Tests**:
  - `testUnauthenticatedPasswordResetBlocked()` — **PASSED** (Unauthenticated resets without valid token return 400 Bad Request)
  - `testCustomerCannotAccessOtherCustomerOrder()` — **PASSED** (IDOR check: Customer A blocked from accessing or cancelling Customer B's order)
  - `testDeliveryPartnerCannotSeeCustomerOtp()` — **PASSED** (OTP leakage prevention: delivery partner order queries scrub verification OTP)
  - `testUserEntityDoesNotExposePasswordHash()` — **PASSED** (BCrypt hash never serialized in `/api/auth/me`)
  - `testCorsBlocksArbitraryOriginWithCredentials()` — **PASSED** (Untrusted cross-origin requests with credentials return 403 Forbidden)
  - `testClickjackingFrameOptionsConfigured()` — **PASSED** (`X-Frame-Options: SAMEORIGIN` enforced)
  - `testDeliveryOtpLockoutAfterMaxAttempts()` — **PASSED** (5 consecutive failed OTP attempts locks verification)
  - `testAuthRateLimitingTriggered()` — **PASSED** (Rapid authentication attempts trigger 429 Too Many Requests with `Retry-After`)
  - **Summary**: `Tests run: 8, Failures: 0, Errors: 0, Skipped: 0`

### Full Monorepo Build
- **Command**: `npm run build` (at project root)
- **Result**: **PASSED** (Both frontend and backend compiled cleanly in 5.48s)

---

## 7. Features That Still Need Implementation

For learning and demonstration purposes, the core workflows are complete. However, if migrating towards a production business service in the future, the following would need full implementation:

1. **Production Mail Service (SMTP/SendGrid/SES)**: Password reset currently operates via a simulated single-use token demonstration flow in the browser rather than sending real emails.
2. **Real Payment Gateway Integration**: The payment flow is currently in test/mock mode (`PaymentController.java` creates test intents and verifies without live payment gateways like Razorpay/Stripe).
3. **Banner Management CRUD**: Promo banners are currently configured in `HeroBanner.jsx` rather than dynamically managed from the admin dashboard.
4. **Persistent OTP Attempt Tracking Across Restarts**: OTP verification attempts are tracked on the `Order` entity; a distributed cache (e.g. Redis) would be recommended for multi-instance production clustering.

---

## 8. Remaining Risks and Deployment Limitations

1. **Free-Tier Hosting Cold Starts**: If deployed to free-tier cloud platforms (e.g., Render, Railway), Spring Boot applications may experience 30–60 second cold starts after inactivity.
2. **In-Memory H2 Ephemerality**: Running with the `h2` profile stores data in RAM; restarting the backend resets the database to the initial seed state. Persistent demonstrations should use MySQL or a hosted PostgreSQL/MySQL instance.
3. **Demo Credentials Exposure**: The application includes pre-seeded demo accounts for quick college evaluation. In a public internet demo, any visitor could log in as administrator and modify catalog products.
4. **Rate Limiter In-Memory State**: The token bucket rate limiter uses a concurrent in-memory map. Restarts reset rate-limiting buckets.

---

## 9. Required Environment Variables

When deploying or configuring the application, use these variable names (set without committing secret values):

### Backend (`backend/.env` or Container Environment)
- `PORT`: Server port (default: `8080`)
- `SPRING_PROFILES_ACTIVE`: Active profile: `mysql` (persistent) or `h2` (zero-setup offline demo)
- `DB_URL`: JDBC connection URL (e.g., `jdbc:mysql://localhost:3306/ecommerce_db`)
- `DB_USERNAME`: Database user (e.g., `root`)
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: Minimum 256-bit HMAC-SHA256 secret key
- `JWT_EXPIRATION_MS`: Token validity duration in milliseconds (default: `86400000` = 24 hours)
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins (e.g., `https://my-frontend.vercel.app`)

### Frontend (`frontend/.env` or Container Environment)
- `VITE_API_URL`: Backend API base URL (default: `http://localhost:8080`)

---

## 10. Step-by-Step Instructions to Run Locally

### Prerequisites
- Node.js v18+
- Java JDK 21+
- Apache Maven 3.9+
- MySQL 8.0+ *(Optional if running in H2 zero-setup mode)*

### Option A: Standard Run with MySQL (Recommended)
1. **Ensure MySQL is running** on port 3306 with database `ecommerce_db`:
   ```sql
   CREATE DATABASE IF NOT EXISTS ecommerce_db;
   ```
2. **Run both services concurrently** from the project root:
   ```bash
   npm run dev
   ```
   *(Or double-click `start-all.bat` on Windows)*.
3. **Open the application**:
   - Customer Storefront: `http://localhost:5173/`
   - Admin Portal: `http://localhost:5173/admin`
   - Delivery Partner Portal: `http://localhost:5173/delivery-partner`
   - Backend API: `http://localhost:8080/api/products`

### Option B: Zero-Setup Offline Run (In-Memory H2, No MySQL Required)
1. In your terminal, set the profile and start:
   ```bash
   # Windows PowerShell
   $env:SPRING_PROFILES_ACTIVE="h2"
   npm run dev
   ```
   *(Or inside `backend/`: `mvn spring-boot:run -Dspring-boot.run.profiles=h2`)*
2. In-Memory Database Console: `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:ecommerce_db`
   - User: `sa` / Password: *(blank)*

### Demo Login Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `customer@novamart.com` | `Customer@123` |
| **System Administrator** | `admin@novamart.com` | `Admin@123` |
| **Delivery Partner (Central)** | `partner@novamart.com` | `Partner@123` |
| **Delivery Partner (West)** | `partner2@novamart.com` | `Partner@123` |

---

## 11. Step-by-Step Production Build & Deployment Instructions (Without Docker)

### Option 1: Native Production Build on Local Machine
1. **Compile and build both applications**:
   ```bash
   npm run build
   ```
2. **Launch the production backend executable JAR**:
   ```bash
   java -jar backend/target/ecommerce-backend-0.0.1-SNAPSHOT.jar
   ```
3. **Serve or preview the production frontend**:
   ```bash
   cd frontend
   npm run preview
   ```
   - Storefront: `http://localhost:4173/` (or port indicated by preview)
   - Backend API: `http://localhost:8080/api/products`

### Option 2: Cloud Demonstration Deployment (Render / Railway / Vercel)
1. **Database**: Provision a free/educational managed MySQL instance (e.g. Aiven, Railway, or TiDB Cloud).
2. **Backend**:
   - Deploy `backend/` as a Web Service on Render or Railway using Java 21 runtime.
   - Build command: `mvn clean package -DskipTests`
   - Start command: `java -jar target/ecommerce-backend-0.0.1-SNAPSHOT.jar`
   - Set environment variables:
     - `SPRING_PROFILES_ACTIVE`: `mysql`
     - `DB_URL`: Managed MySQL JDBC URL
     - `DB_USERNAME`: Database username
     - `DB_PASSWORD`: Database password
     - `JWT_SECRET`: Secure 256-bit random string
     - `CORS_ALLOWED_ORIGINS`: Deployed frontend URL (e.g. `https://novamart.vercel.app`)
3. **Frontend**:
   - Deploy `frontend/` as a Static Site (e.g., Vercel, Netlify, or Render).
   - Set environment variable: `VITE_API_URL` pointing to your deployed backend URL.
   - Build command: `npm run build`
   - Output directory: `dist`

---

## 12. Actions Requiring User Approval

Before any of the following actions are taken, your explicit approval is required:
1. **Git Commit & Push**: Changes are currently preserved in your working tree (uncommitted). Do you want me to stage and commit these improvements with a clean message?
2. **Cloud Resource Provisioning**: No external cloud resources or paid hosting services were created. If you wish to deploy to a specific live cloud provider (Render, Railway, AWS, or Vercel), let me know and provide the target platform details.
