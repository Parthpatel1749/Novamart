# NovaMart E-Commerce Platform - Code Audit & Cleanup Plan

## 1. Project Structure & Technology Stack

The project is an enterprise-grade B2C e-commerce platform with area-based hyperlocal delivery management.

### Technology Stack
- **Backend**: Java 21, Spring Boot 3.3.4, Spring Security 6 with JWT (io.jsonwebtoken 0.12.5), Spring Data JPA, H2 In-Memory Database (MySQL compatibility mode) + MySQL Connector 8.3.0, Apache Maven 3.9.16.
- **Frontend**: React 19.2.8, Vite 8.3.0, React Router v7.18.4, Axios 1.20.0, Lucide React 1.50.0, Canvas Confetti 1.9.4, Oxlint 1.81.0.
- **Architecture**:
  - `server-side` (Directory Junction to `Spring Boot`): Port 8080 REST API (13 controllers, 11 services, 11 JPA repositories, 14 entities, 21 DTOs).
  - `user-side`: Port 5173 Customer Storefront (Vite + React SPA).
  - `admin-side`: Port 5174 Administrator Operations Portal (Vite + React SPA).
  - `Frontend`: Legacy / unreferenced single-frontend directory from Oct 2, 2026 prior to user-side/admin-side split.

---

## 2. Unnecessary & Dead Code Identified

### A. Safe to Remove (Verified Unused)
1. **`user-side` and `admin-side` Component & Page Unused Imports**:
   - `src/components/SubNavbar.jsx`: Unused imports `Zap`, `Tag` from `lucide-react`.
   - `src/components/HeroBanner.jsx`: Unused import `ShieldCheck` from `lucide-react`.
   - `src/components/Navbar.jsx`: Unused import `Menu` from `lucide-react`.
   - `src/pages/customer/LoginPage.jsx`: Unused imports `Lock`, `Mail` from `lucide-react`.
   - `src/pages/customer/OrderConfirmationPage.jsx`: Unused imports `MapPin`, `Truck`, `ArrowRight` from `lucide-react`; unused import `formatPrice` from `../../utils/formatters`.
   - `src/pages/customer/CustomerDashboardPage.jsx`: Unused import `ExternalLink` from `lucide-react`.
   - `src/pages/customer/CheckoutPage.jsx`: Unused imports `Truck`, `Tag`, `CreditCard`, `ShieldCheck`, `ArrowRight` from `lucide-react`.
   - `src/pages/delivery/DeliveryPartnerRegisterPage.jsx`: Unused import `ShieldAlert` from `lucide-react`.
   - `src/pages/admin/AdminReviewsPage.jsx`: Unused import `ShieldCheck` from `lucide-react`.
   - `src/pages/admin/AdminDeliveryPartnersPage.jsx`: Unused imports `Truck`, `Shield` from `lucide-react`.
   - `src/pages/admin/AdminProductsPage.jsx`: Unused imports `Tag`, `Check`, `X`, `AlertTriangle` from `lucide-react`.
   - `src/pages/admin/AdminOrdersPage.jsx`: Unused import `ORDER_STATUS_FLOW` from `../../utils/formatters`; unused imports `Check`, `AlertCircle` from `lucide-react`.
   - `src/pages/admin/AdminDeliveryZonesPage.jsx`: Unused imports `Check`, `X` from `lucide-react`.
   - `src/context/AuthContext.jsx`: Unused import `deliveryPartnerAPI` from `../services/api`.

2. **Unused State & Dead Variables**:
   - `src/pages/customer/HomePage.jsx`: `const [categories, setCategories] = useState([]);` is never rendered or referenced. Triggers a redundant `categoryAPI.getAll()` network call on every homepage mount.
   - `src/pages/customer/CheckoutPage.jsx`: `globalZone` destructured from `useLocation()` is never used.
   - `src/pages/delivery/DeliveryPartnerRegisterPage.jsx`: `const navigate = useNavigate();` is declared but never called.
   - `src/pages/admin/AdminOrdersPage.jsx`: `const status = getOrderStatusInfo(o.orderStatus);` on line 121 declared but never read.

3. **Critical Defect / Missing Import**:
   - `src/pages/customer/OrderTrackingPage.jsx`: Line 6 imported `Package` (unused), while Line 295 used `<MapPin size={18} color="#007185" />` without importing `MapPin` from `lucide-react`, causing a runtime `ReferenceError`. Replacing `Package` with `MapPin` fixes this bug.

### B. Duplicate Implementations & Out-of-Sync Code
- `admin-side` was missing recent address management and delivery zone status updates present in `user-side`:
  - `src/services/api.js` in `admin-side` lacked `addressAPI`.
  - `src/pages/customer/CheckoutPage.jsx`, `CustomerDashboardPage.jsx`, and `HomePage.jsx` were out of sync between `user-side` and `admin-side`.
  - Synchronizing these files consolidates the codebase and eliminates divergence.

### C. Requires Verification (Do Not Delete Without User Approval)
- **`Frontend/` Directory**: An older pre-split copy of the frontend (dated Oct 2, 2026) containing 107.5 MB `node_modules` and 50 source files. Not referenced by `package.json` scripts or `.bat` launchers. Preserved in accordance with safety guidelines pending user confirmation.
- **`OrderItemRepository.java`**: Spring Data repository with `findByOrderId`. While `OrderService` currently navigates items via `order.getOrderItems()`, the repository is standard architecture and preserved.
- **`formatters.js` `ORDER_STATUS_FLOW`**: Exported status array. Preserved as a reference export in formatters utility.

### D. Must Be Preserved (Core Architecture)
- All 13 Spring Boot REST controllers, 11 services, 14 entities, 11 repositories, security filters, and data initializers.
- Directory junction `server-side` -> `Spring Boot`.
- Both port configurations: `user-side` (port 5173) and `admin-side` (port 5174).
- All dependencies in `server-side/pom.xml` and frontend `package.json`.
- Authentication, role-based access control, PIN-based delivery matching, and cart/order lifecycle logic.
