# NovaMart REST API Reference Guide

Base URL: `http://localhost:8080/api`

All protected endpoints require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Authentication & Account Management (`/api/auth`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer or delivery partner account | Public |
| `POST` | `/api/auth/login` | Authenticate with email & password; returns JWT token & user profile | Public (Rate-limited) |
| `POST` | `/api/auth/logout` | Client-side session logout confirmation | Authenticated |
| `POST` | `/api/auth/forgot-password` | Request password reset token for registered email | Public (Rate-limited) |
| `POST` | `/api/auth/reset-password` | Set new password with valid reset token or authenticated session | Public/Auth |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile (password hash omitted) | Authenticated |

---

## 2. Product Catalog & Categories (`/api/products`, `/api/categories`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Paginated catalog with search, category, brand, and price filters | Public |
| `GET` | `/api/products/{id}` | Detailed product specifications, stock status & images | Public |
| `GET` | `/api/products/brands` | List of all distinct product brands in active catalog | Public |
| `GET` | `/api/categories` | List of all active product categories | Public |
| `GET` | `/api/categories/{id}` | Specific category details | Public |

---

## 3. Shopping Cart (`/api/cart`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Get current customer's active shopping cart & item subtotals | Customer |
| `POST` | `/api/cart/items` | Add product to cart with quantity & selected variant | Customer |
| `PUT` | `/api/cart/items/{id}` | Update quantity of specific cart line item | Customer |
| `DELETE` | `/api/cart/items/{id}` | Remove item from cart | Customer |
| `DELETE` | `/api/cart/clear` | Empty all items from current cart | Customer |

---

## 4. Orders & Checkout (`/api/orders`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Place order from cart items; calculates totals, matches zone, generates 6-digit OTP | Customer |
| `GET` | `/api/orders` | Customer's complete order history | Customer |
| `GET` | `/api/orders/{id}` | Tracking & status details for specific order (Ownership verified) | Customer / Admin |
| `POST` | `/api/orders/{id}/cancel` | Cancel order before delivery (Ownership verified) | Customer / Admin |
| `POST` | `/api/orders/{id}/return` | Request return for delivered order (Ownership verified) | Customer / Admin |

---

## 5. Address Management (`/api/addresses`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/addresses` | List all saved delivery addresses for authenticated customer | Customer |
| `POST` | `/api/addresses` | Add new delivery address | Customer |
| `PUT` | `/api/addresses/{id}` | Update existing address | Customer |
| `DELETE` | `/api/addresses/{id}` | Delete address | Customer |
| `PUT` | `/api/addresses/{id}/default` | Set primary default shipping address | Customer |

---

## 6. Hyperlocal Delivery Partner Portal (`/api/delivery-partners`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/delivery-partners/register` | Submit onboarding application with vehicle & license info | Public |
| `POST` | `/api/delivery-partners/login` | Delivery partner authentication | Public |
| `GET` | `/api/delivery-partners/profile` | Partner profile, vehicle status & assigned zones | Delivery Partner |
| `PUT` | `/api/delivery-partners/status` | Toggle online/offline availability (`available: true/false`) | Delivery Partner |
| `GET` | `/api/delivery-partners/deliveries` | List shipments assigned to calling partner (OTP scrubbed) | Delivery Partner |
| `POST` | `/api/delivery-partners/deliveries/{id}/accept` | Accept assigned delivery shipment | Delivery Partner |
| `POST` | `/api/delivery-partners/deliveries/{id}/pickup` | Confirm package pickup from warehouse | Delivery Partner |
| `POST` | `/api/delivery-partners/deliveries/{id}/out-for-delivery` | Mark shipment as out for delivery | Delivery Partner |
| `POST` | `/api/delivery-partners/deliveries/{id}/deliver` | Complete delivery via customer OTP verification (Max 5 attempts) | Delivery Partner |
| `POST` | `/api/delivery-partners/deliveries/{id}/failed` | Report delivery exception with failure reason | Delivery Partner |

---

## 7. Administrative Operations (`/api/admin`)

Requires `ROLE_ADMIN` authority.

### Products & Inventory
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/products` | All products including unlisted/inactive items |
| `POST` | `/api/admin/products` | Create new product in catalog |
| `PUT` | `/api/admin/products/{id}` | Edit product details, stock, pricing, and specs |
| `DELETE` | `/api/admin/products/{id}` | Soft-delete / deactivate product |
| `GET` | `/api/admin/products/low-stock` | Products below inventory alert threshold |

### Orders & Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/orders` | All platform orders with full audit trail |
| `PUT` | `/api/admin/orders/{id}/status` | Force update order lifecycle status |
| `GET` | `/api/admin/reports/dashboard` | Platform metrics (revenue, order counts, deliveries) |
| `GET` | `/api/admin/customers` | Registered customer directory |
| `PUT` | `/api/admin/customers/{id}/status` | Activate or suspend customer account |

### Hyperlocal Delivery Zones & Fleet Dispatch
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/delivery-partners` | List all partners (filter by `UNDER_REVIEW`, `ACTIVE`, `REJECTED`) |
| `POST` | `/api/admin/delivery-partners/{id}/approve` | Approve partner application & assign serviceable zone IDs |
| `POST` | `/api/admin/delivery-partners/{id}/reject` | Reject partner application |
| `GET` | `/api/admin/delivery-zones` | Configured delivery zones & covered PIN code ranges |
| `POST` | `/api/admin/delivery-zones` | Create new hyperlocal delivery zone |
| `PUT` | `/api/admin/delivery-zones/{id}` | Update delivery zone details & PIN codes |
| `DELETE` | `/api/admin/delivery-zones/{id}` | Remove delivery zone |
| `POST` | `/api/admin/deliveries/{orderId}/assign` | Assign order to delivery partner with dispatch notes |
| `PUT` | `/api/admin/deliveries/{orderId}/reassign` | Reassign order to different partner |

### Marketing & Reviews
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/coupons` | List all discount coupons |
| `POST` | `/api/admin/coupons` | Create promotional coupon |
| `DELETE` | `/api/admin/coupons/{id}` | Deactivate coupon |
| `GET` | `/api/admin/reviews` | Review moderation queue |
| `DELETE` | `/api/admin/reviews/{id}` | Delete abusive or fraudulent review |
