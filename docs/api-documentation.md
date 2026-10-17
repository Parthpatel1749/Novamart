# NovaMart REST API Reference

Base URL: `http://localhost:8080/api`

All protected endpoints require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Authentication Endpoints

### User Registration
- **POST** `/auth/signup`
- **Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": ["user"]
}
```
- **Response** (200 OK):
```json
{
  "message": "User registered successfully!"
}
```

### User Login
- **POST** `/auth/signin`
- **Request Body**:
```json
{
  "username": "johndoe",
  "password": "SecurePassword123!"
}
```
- **Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "roles": ["ROLE_USER"]
}
```

---

## 2. Public Catalog & Products

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/public/products` | Paginated product listing with filters | Public |
| `GET` | `/public/products/{id}` | Get product details by ID | Public |
| `GET` | `/public/categories` | List all active product categories | Public |
| `GET` | `/public/products/search?keyword={query}` | Search catalog by title/description | Public |

---

## 3. Shopping Cart

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/carts/users/cart` | Get current user's active cart | User / Customer |
| `POST` | `/carts/products/{productId}/quantity/{quantity}` | Add product to cart | User / Customer |
| `PUT` | `/cart/products/{productId}/quantity/{quantity}` | Update quantity of item in cart | User / Customer |
| `DELETE` | `/carts/{cartId}/product/{productId}` | Remove item from cart | User / Customer |

---

## 4. Orders & Checkout

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/order/users/payments/{paymentMethod}` | Place order from cart items | User / Customer |
| `GET` | `/users/orders` | Get order history of logged-in user | User / Customer |
| `GET` | `/order/{orderId}` | Get tracking details for specific order | User / Admin |

---

## 5. Admin Operations (Requires `ROLE_ADMIN`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/orders` | List all system orders with filter/sort | Admin |
| `PUT` | `/admin/orders/{orderId}/status/{status}` | Update status (`PENDING`, `DISPATCHED`, etc.) | Admin |
| `POST` | `/admin/categories/{categoryId}/product` | Create new product in category | Admin |
| `PUT` | `/admin/products/{productId}` | Update existing product details & stock | Admin |
| `DELETE`| `/admin/products/{productId}` | Delete product | Admin |
| `GET` | `/admin/delivery-partners` | List all registered delivery partners | Admin |
| `PUT` | `/admin/delivery-partners/{id}/verify` | Approve delivery partner status | Admin |
| `GET` | `/admin/delivery-zones` | List configured pincodes/zones | Admin |

---

## 6. Delivery Partner Operations (Requires `ROLE_DELIVERY_PARTNER`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/delivery-partner/orders` | Get orders assigned to current partner | Delivery Partner |
| `PUT` | `/delivery-partner/orders/{orderId}/status` | Update delivery status (`PICKED_UP`, `DELIVERED`)| Delivery Partner |
| `POST`| `/delivery-partner/register` | Apply for partner onboarding | Public / Auth |
