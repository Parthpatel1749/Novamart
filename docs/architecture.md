# NovaMart Enterprise Architecture Blueprint

## 1. System Overview

NovaMart is a high-performance B2C e-commerce platform built with a modern decoupled full-stack architecture:
- **Frontend**: A unified Single Page Application (SPA) powered by React 19 and Vite running on port `5173`. It seamlessly hosts the Customer Storefront, the Operations & Admin Portal, and the Delivery Partner Portal under role-based route guards.
- **Backend**: A robust Spring Boot 3.3.4 enterprise REST API running on port `8080`, providing stateless JWT authentication, role-based authorization, inventory management, order processing, and area-based delivery dispatching.
- **Database & Reliability Engine**: MySQL relational database persistence with H2 zero-config development mode, supported by a continuous auto-backup watcher engine that maintains timestamped SQL dumps and point-in-time recovery capabilities.

---

## 2. Port & Network Contract

| Service | Port | Base URL | Scope |
| :--- | :--- | :--- | :--- |
| **Unified Frontend** | `5173` | `http://localhost:5173` | Customer Storefront (`/`), Admin (`/admin`), Delivery (`/delivery-partner`) |
| **Backend REST API** | `8080` | `http://localhost:8080/api` | REST endpoints, JWT authentication, and Swagger/OpenAPI |
| **Database (Dev/Prod)**| `3306` | `jdbc:mysql://localhost:3306/ecommerce_db` | Relational persistence (MySQL) with H2 dev fallback |

---

## 3. Directory Layout

```
React_2/
├── frontend/                     # Unified React 19 + Vite Application (Port 5173)
│   ├── public/                   # Static assets, SVG icons, favicon
│   ├── src/
│   │   ├── assets/               # Local styles and static assets
│   │   ├── components/           # Reusable UI components & layouts
│   │   │   ├── AdminNavbar.jsx   # Admin navigation header
│   │   │   ├── Navbar.jsx        # Customer navigation bar
│   │   │   ├── SubNavbar.jsx     # Category navigation
│   │   │   ├── Footer.jsx        # Global footer
│   │   │   ├── HeroBanner.jsx    # Storefront promotional banner
│   │   │   ├── ProductCard.jsx   # Product display & quick add
│   │   │   ├── ProtectedRoute.jsx# Role-based route guard
│   │   │   ├── PinLocationModal.jsx # Delivery zone selector
│   │   │   └── PortalSwitcher.jsx# Development portal navigation
│   │   ├── context/              # React Context Providers
│   │   │   ├── AuthContext.jsx   # JWT token & user session management
│   │   │   ├── CartContext.jsx   # Persistent shopping cart state
│   │   │   ├── LocationContext.jsx # Pincode & delivery zone state
│   │   │   └── WishlistContext.jsx # Customer saved items
│   │   ├── pages/                # Route Views
│   │   │   ├── customer/         # Storefront, Catalog, Cart, Checkout, Orders
│   │   │   ├── admin/            # Dashboard, Products, Orders, Delivery Partners, Zones
│   │   │   └── delivery/         # Delivery Partner Dashboard & Registration
│   │   ├── services/             # Axios API client (http://localhost:8080)
│   │   ├── styles/               # Global CSS tokens & styles
│   │   ├── utils/                # Currency formatters & helpers
│   │   ├── App.jsx               # Central Route Switcher
│   │   └── main.jsx              # DOM entrypoint
│   ├── index.html                # HTML5 template
│   ├── package.json              # Frontend npm dependencies & scripts
│   ├── vite.config.js            # Vite configuration (port 5173)
│   └── .env.example              # Environment variables template
│
├── backend/                      # Spring Boot 3.3.4 REST API Service (Port 8080)
│   ├── src/main/java/com/ecommerce/
│   │   ├── config/               # SecurityFilterChain, CORS, OpenAPI config
│   │   ├── controller/           # REST Controllers (@RestController)
│   │   ├── dto/                  # Data Transfer Objects (Requests & Responses)
│   │   ├── entity/               # JPA Entities (@Entity, @Table)
│   │   ├── exception/            # Global exception handlers (@ControllerAdvice)
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   ├── security/             # JWT filters, UserDetails, Security configs
│   │   ├── service/              # Core business logic implementations
│   │   └── Application.java      # Spring Boot main runner
│   ├── src/main/resources/
│   │   ├── application.properties# Main application configuration
│   │   ├── application-mysql.properties # MySQL production configuration
│   │   └── schema.sql            # Initial DDL / schema definitions
│   ├── pom.xml                   # Maven dependencies & build configuration
│   └── .env.example              # Environment variables template
│
├── database/                     # Database Reliability & SQL Snapshots
│   └── backups/
│       ├── history/              # Timestamped historical database backups
│       └── ecommerce_db_latest.sql # Authoritative latest verified database dump
│
├── scripts/                      # Developer Operations & Automation Scripts
│   ├── auto-backup-watcher.js    # Continuous change detection & auto-backup watcher
│   ├── backup-code.js            # Code snapshot backup utility
│   ├── backup-db.js              # Database export & dump engine (mysqldump / fallback)
│   ├── clean-build.bat           # Clean & compile verification suite
│   ├── restore-db.js             # Database restoration runner
│   ├── start-all.bat             # Unified launcher (starts backend, frontend & watcher)
│   ├── start-backend.bat         # Starts only Spring Boot backend (port 8080)
│   └── start-frontend.bat        # Starts only frontend dev server (port 5173)
│
├── docs/                         # Enterprise Architecture & API Documentation
│   ├── architecture.md           # System architecture blueprint (this file)
│   ├── api-documentation.md      # REST API endpoints & schemas
│   ├── cleanup-report.md         # Refactoring, consolidation & cleanup report
│   ├── security-audit.md         # Security audit & remediation checklist
│   └── backend-audit.txt         # Backend consolidation & verification record
│
├── backup/                       # Unified archive for legacy frontend & backend backups
│   ├── frontend/                 # Legacy admin-side & frontend backups
│   └── backend/                  # Legacy Spring Boot backend backup
│
├── start-all.bat                 # Root launcher wrapper
├── start-auto-backup.bat         # Root auto-backup watcher runner
├── start-frontend.bat            # Root frontend launcher wrapper
├── start-backend.bat             # Root backend launcher wrapper
├── push-to-github.bat            # Safe automated git commit & push script
├── package.json                  # Root monorepo orchestration scripts
├── project-structure.txt         # Clean, maintained directory tree
└── README.md                     # Project overview and getting started guide
```

---

## 4. Frontend Route Hierarchy

The frontend routes are managed centrally in `frontend/src/App.jsx`:

### Customer Storefront
- `/` — Homepage & featured categories
- `/products` — Product catalog with filtering & search
- `/product/:id` — Detailed product view & customer reviews
- `/cart` — Cart management & coupon application
- `/checkout` — Shipping address & payment options
- `/order-confirmation` — Order summary post-checkout
- `/track-order/:id` — Live order tracking & delivery status
- `/dashboard` — Customer order history & account settings
- `/login` / `/register` — Customer authentication

### Admin Portal (Role-Protected: `ROLE_ADMIN`)
- `/admin` — High-level KPI analytics & revenue overview
- `/admin/products` — Product catalog CRUD & inventory management
- `/admin/orders` — Order processing & dispatch assignment
- `/admin/delivery-partners` — Partner onboarding & verification
- `/admin/delivery-zones` — Pincode & regional service zones
- `/admin/coupons` — Promotional discounts & promo rules
- `/admin/reviews` — Customer review moderation

### Delivery Partner Portal (Role-Protected: `ROLE_DELIVERY_PARTNER`)
- `/delivery-partner` — Assigned deliveries, route navigation, and status update
- `/delivery-partner/register` — Delivery partner onboarding application

---

## 5. Security & Authentication Flow

1. **Authentication**: Users submit credentials to `/api/auth/signin` (or `/api/auth/signup`).
2. **JWT Issuance**: Backend validates credentials, issues signed HMAC-SHA256 JWT containing username and authorities (`ROLE_USER`, `ROLE_ADMIN`, `ROLE_DELIVERY_PARTNER`).
3. **Session Persistence**: Frontend stores JWT in `localStorage` through `AuthContext.jsx`.
4. **Axios Interceptor**: `frontend/src/services/api.js` automatically attaches `Authorization: Bearer <token>` to outbound HTTP requests.
5. **Role Guard**: `frontend/src/components/ProtectedRoute.jsx` intercepts route changes and redirects unauthorized users away from Admin or Delivery Partner views.

---

## 6. Continuous Data Safety & Auto-Backup System

To prevent data loss and ensure rapid zero-downtime recovery:
1. **Automated DB Snapshotting**: Running `scripts/backup-db.js` generates verified SQL dumps into `database/backups/ecommerce_db_latest.sql` and archives rolling backups in `database/backups/history/`.
2. **Continuous Auto-Backup Watcher**: Running `scripts/auto-backup-watcher.js` (launched automatically via `start-all.bat` or `npm run backup:watch`) monitors active changes and periodically creates safe snapshots without interrupting ongoing development.
3. **Database Restore**: `scripts/restore-db.js` allows one-command restoration of the database snapshot into MySQL.
