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
├── scripts/                      # Developer Automation & Launch Scripts
│   ├── start-all.bat             # Unified launcher (starts backend & frontend concurrently)
│   ├── start-frontend.bat        # Starts only frontend dev server (port 5173)
│   ├── start-backend.bat         # Starts only Spring Boot backend (port 8080)
│   └── clean-build.bat           # Clean & compile verification suite
│
├── docs/                         # Enterprise Documentation
│   ├── architecture.md           # Architecture blueprint & directory guide
│   ├── api-documentation.md      # REST API reference & schemas
│   └── security-audit.md         # Vulnerability assessment & remediation guide
├── backup/                       # Unified archive for legacy frontend & backend backups
│   ├── frontend/                 # Legacy admin-side & frontend backups
│   └── backend/                  # Legacy Spring Boot backend backup
│
├── start-all.bat                 # Convenient root wrapper
├── start-frontend.bat            # Convenient root frontend launcher
├── start-backend.bat             # Convenient root backend launcher
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

### Starting Both Services Together (2 Options)

#### Option 1: Live Terminal Output (Concurrent Logs)
```bash
npm run dev
```
Starts both the Spring Boot Backend (port `8080`) and Vite Frontend (port `5173`) concurrently inside your active terminal using live colored prefixes (`[BACKEND]` in cyan, `[FRONTEND]` in magenta). Pressing `Ctrl+C` cleanly terminates both services.

#### Option 2: 1-Click Launch (Separate Windows + Auto Browser Launch)
Double-click:
```cmd
start-all.bat
```
*(or run `npm start` / `npm run dev:windows`)*
Launches backend and frontend in dedicated console windows, waits for startup, and automatically opens `http://localhost:5173/` in your browser.

#### Individual Service Commands:
```bash
npm run dev:frontend   # Starts only React/Vite on http://localhost:5173
npm run dev:backend    # Starts only Spring Boot on http://localhost:8080
npm run build          # Builds frontend & compiles backend
```

---

## 🔐 Demo Credentials

The platform initializes with pre-seeded demo accounts in `DataInitializer.java`:

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer` | `password` | Storefront (`/`), Cart, Orders, Dashboard |
| **Admin** | `admin` | `password` | Admin Portal (`/admin`), Full Platform Management |
| **Delivery Partner** | `delivery` | `password` | Partner Portal (`/delivery-partner`), Delivery Dispatch |

---

## 📖 Documentation Index

- [Architecture Blueprint](file:///c:/Users/LENOVO/OneDrive/Desktop/React.js/React_2/docs/architecture.md)
- [REST API Reference](file:///c:/Users/LENOVO/OneDrive/Desktop/React.js/React_2/docs/api-documentation.md)
- [Security Audit & Safe Remediation Report](file:///c:/Users/LENOVO/OneDrive/Desktop/React.js/React_2/docs/security-audit.md)
- [Project Structure Tree](file:///c:/Users/LENOVO/OneDrive/Desktop/React.js/React_2/project-structure.txt)

---

## 🛡️ License
NovaMart is distributed under the MIT License.
