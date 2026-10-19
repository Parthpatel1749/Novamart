# NovaMart - Enterprise B2C E-Commerce Platform

A production-ready, full-stack B2C e-commerce platform built strictly according to the **Software Requirements Specification (SRS)**. Features an **Amazon-inspired modern shopping UI/UX**, three distinct user role portals (Customer, Admin, and Delivery Partner) unified under a single Vite frontend with Spring Security + JWT Role-Based Access Control (RBAC), and an automated **Hyperlocal PIN/Area-Based Delivery Partner Assignment & OTP Verification Engine**.

---

## 🏗️ Enterprise Architecture & Port Allocation

```
                      ┌───────────────────────────────────────────────┐
                      │              NOVAMART PLATFORM                │
                      └───────────────────────┬───────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         🎨 UNIFIED FRONTEND (PORT 5173)                 ⚡ BACKEND API (PORT 8080)
               Folder: /frontend                               Folder: /backend
  - Customer Storefront:     http://localhost:5173/       - Spring Boot 3.3.4 + Java 21
  - Admin Operations:        http://localhost:5173/admin  - Spring Security 6 + Stateless JWT
  - Delivery Partner Portal: http://localhost:5173/delivery-partner - 13 REST Controllers
  - React 19, Vite, Lucide Icons                          - Spring Data JPA + MySQL / H2
  - Persistent Cart, Wishlist, Zone Context               - Hyperlocal Pincode Dispatch Engine
```

### Port & Network Contract

| Application / Service | Port | URL | Description |
| :--- | :--- | :--- | :--- |
| **Customer Storefront** | `5173` | `http://localhost:5173/` | Product discovery, search, cart, checkout & tracking |
| **Admin Operations** | `5173` | `http://localhost:5173/admin` | Inventory, orders, delivery zones, partners & coupons |
| **Delivery Partner** | `5173` | `http://localhost:5173/delivery-partner` | Assigned shipments, navigation & delivery status |
| **Backend REST API** | `8080` | `http://localhost:8080/api` | Spring Boot REST API endpoints & JWT services |
| **H2 Console (Dev)** | `8080` | `http://localhost:8080/h2-console` | In-memory database inspection tool |
| **MySQL Database** | `3306` | `jdbc:mysql://localhost:3306/ecommerce_db` | Relational persistence with verified SQL dumps |

---

## 📁 Project Structure

```
React_2/
├── frontend/                     # Unified React 19 + Vite Application (Port 5173)
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── components/           # Reusable UI widgets & role-based route guards
│   │   ├── context/              # Auth, Cart, Location & Wishlist state providers
│   │   ├── pages/                # Customer, Admin & Delivery Partner views
│   │   ├── services/             # Axios HTTP client configured for port 8080
│   │   ├── styles/               # Design tokens & styling
│   │   ├── utils/                # Currency formatters & helpers
│   │   ├── App.jsx               # Single-Port Route Switcher
│   │   └── main.jsx              # React DOM entrypoint
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   └── .env.example              # Frontend environment variables template
│
├── backend/                      # Spring Boot 3.3.4 REST API Service (Port 8080)
│   ├── src/main/java/com/ecommerce/
│   │   ├── config/               # Security, CORS & DataInitializer
│   │   ├── controller/           # REST endpoints
│   │   ├── dto/                  # Requests & Responses
│   │   ├── entity/               # JPA Entities
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   ├── security/             # JWT filters & Token Provider
│   │   └── service/              # Core business services
│   ├── src/main/resources/       # application.properties & schema.sql
│   ├── pom.xml                   # Maven dependencies & build plugins
│   └── .env.example              # Backend environment variables template
│
├── database/                     # Database Reliability & SQL Snapshots
│   └── backups/
│       ├── history/              # Timestamped historical database backups
│       └── ecommerce_db_latest.sql # Authoritative latest verified database dump
│
├── scripts/                      # Developer Automation, Launchers & Auto-Backup Watchers
│   ├── auto-backup-watcher.js    # Continuous change detection & auto-backup watcher
│   ├── backup-code.js            # Code snapshot backup utility
│   ├── backup-db.js              # Database export & dump engine (mysqldump / fallback)
│   ├── clean-build.bat           # Clean & compile verification suite
│   ├── restore-db.js             # Database restoration runner
│   ├── start-all.bat             # Unified launcher (starts backend, frontend & watcher)
│   ├── start-backend.bat         # Starts only Spring Boot backend (port 8080)
│   └── start-frontend.bat        # Starts only frontend dev server (port 5173)
│
├── docs/                         # Enterprise Documentation
│   ├── architecture.md           # Architecture blueprint & directory guide
│   ├── api-documentation.md      # REST API reference & schemas
│   ├── cleanup-report.md         # Refactoring, consolidation & cleanup report
│   ├── security-audit.md         # Vulnerability assessment & remediation guide
│   └── backend-audit.txt         # Backend consolidation & verification record
│
├── backup/                       # Unified archive for legacy frontend & backend backups
│   ├── frontend/                 # Legacy admin-side & frontend backups
│   └── backend/                  # Legacy Spring Boot backend backup
│
├── start-all.bat                 # 1-Click root launcher (starts backend, frontend & backup watcher)
├── start-auto-backup.bat         # 1-Click root auto-backup watcher runner
├── start-frontend.bat            # Convenient root frontend launcher
├── start-backend.bat             # Convenient root backend launcher
├── push-to-github.bat            # Safe automated git commit & push script
├── package.json                  # Root monorepo orchestration scripts
└── project-structure.txt         # Clean, maintained directory tree
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Java JDK**: 21+
- **Maven**: 3.9+
- **MySQL** (optional; in-memory H2 database is pre-configured for instant zero-setup dev)

### Starting Services Together

#### Option 1: Live Terminal Output (Concurrent Logs)
```bash
npm run dev
```
Starts both the Spring Boot Backend (port `8080`) and Vite Frontend (port `5173`) concurrently inside your active terminal using live colored prefixes (`[BACKEND]` in cyan, `[FRONTEND]` in magenta). Pressing `Ctrl+C` cleanly terminates both services.

#### Option 2: 1-Click Launch (Dedicated Windows + Auto-Backup Watcher + Auto Browser Launch)
Double-click:
```cmd
start-all.bat
```
*(or run `npm start` / `npm run dev:windows`)*
Launches backend, frontend, and continuous auto-backup watcher in dedicated console windows, waits for startup, and automatically opens `http://localhost:5173/` in your browser.

#### Individual Service & Backup Commands:
```bash
npm run dev:frontend     # Starts only React/Vite on http://localhost:5173
npm run dev:backend      # Starts only Spring Boot on http://localhost:8080
npm run build            # Builds frontend & compiles backend
npm run backup:db        # Creates instant verified snapshot in database/backups/
npm run restore:db       # Restores database from latest verified SQL snapshot
npm run backup:watch     # Runs continuous DB & code safety watcher
```

---

## 🔐 Demo Credentials (Pre-Seeded)

The platform initializes with pre-seeded demo accounts in `DataInitializer.java`:

| Role | Email / Login | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@novamart.com` | `Customer@123` | Customer Storefront (`/`), Cart, Orders, Dashboard |
| **System Administrator** | `admin@novamart.com` | `Admin@123` | Admin Portal (`/admin`), Full Catalog & Order Management |
| **Delivery Partner (Online)** | `partner@novamart.com` | `Partner@123` | Partner Portal (`/delivery-partner`), Vadodara Central zone |
| **Delivery Partner (Offline)** | `partner2@novamart.com` | `Partner@123` | Partner Portal (`/delivery-partner`), Vadodara West zone |

---

## 🚀 Running with In-Memory H2 (Zero-Setup Mode)

If you do not have MySQL installed or running locally, you can launch the backend with the embedded in-memory H2 profile:

```bash
# In backend directory
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
or set the environment variable:
```bash
set SPRING_PROFILES_ACTIVE=h2
npm run dev
```

Inspect database tables in your browser at `http://localhost:8080/h2-console` with JDBC URL `jdbc:h2:mem:ecommerce_db`.

---

---

## ⚡ High-Concurrency & 10,000 Concurrent User Scalability (Non-Containerized)

NovaMart has been systematically tuned and benchmarked to support high-throughput e-commerce workloads without Docker containers:
* **Java 21 Project Loom Virtual Threads:** Eliminates platform thread pool exhaustion (`spring.threads.virtual.enabled=true`).
* **Route-Based Lazy Loading:** Initial entry bundle reduced by **83.6%** (from 225.98 kB down to **37.01 kB**).
* **Caffeine L1 Cache:** Sub-millisecond response on `/api/categories` and `/api/products/brands` (**394+ RPS**).
* **Pessimistic Row Locking:** Prevents stock overselling during simultaneous checkouts under race conditions.
* **14 Composite B-Tree Indexes:** Accelerates search, order tracking, and relational joins.

### Running Live Load Test Benchmark
To simulate realistic concurrent user journeys (smoke test, cached catalog, search/filter, and concurrent checkout):
```bash
# Ensure backend is running, then execute:
node scripts/load-testing/node-load-runner.js
```

### Production Non-Containerized Launchers:
```cmd
:: 1. Clean build and package production JAR & frontend dist:
scripts\clean-build.bat

:: 2. Launch production Spring Boot (Java 21) & optimized frontend:
scripts\start-prod.bat
```

---

## 📖 Documentation Index

- [10k Scalability & Benchmark Engineering Report](docs/scalability-10k-concurrency-report.md)
- [Architecture Blueprint](docs/architecture.md)
- [REST API Reference](docs/api-documentation.md)
- [Security Audit & Vulnerability Remediation Report](docs/security-audit.md)
- [Comprehensive Project Audit & Deployment Report](docs/project-audit-and-deployment-report.md)

---

## 🛡️ License
NovaMart is distributed under the MIT License.

