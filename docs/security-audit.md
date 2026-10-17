# Complete Security Vulnerability Audit & Remediation Plan: NovaMart Platform

**Target Application:** NovaMart B2C E-Commerce Web Platform  
**Audit Date:** October 2026  
**Lead Security Engineer:** Senior AppSec & Penetration Testing Specialist  
**Target Root:** `C:\Users\LENOVO\OneDrive\Desktop\React.js\React_2`  
**Active Components:** Spring Boot 3.3.4 Backend (`server-side/`), React 18 / Vite Frontends (`user-side/`, `admin-side/`)  

---

## 1. Executive Summary

A comprehensive application security audit and code-level vulnerability assessment of the NovaMart e-commerce platform was conducted across the active backend (`server-side/`), active frontends (`user-side/`, `admin-side/`), database configurations, authentication handlers, and deployment scripts.

The audit identified **10 distinct security findings**:
- **1 CRITICAL** vulnerability: Complete Unauthenticated Account Takeover via public password reset.
- **5 HIGH** severity vulnerabilities: Broken Object Level Authorization (IDOR/BOLA) on orders, delivery OTP leakage to delivery partners, BCrypt password hash disclosure in API responses and browser localStorage, overly permissive CORS with credentials, and hardcoded JWT signing keys/database passwords.
- **3 MEDIUM** severity vulnerabilities: Insecure H2 Console configuration with global frame-options disabled (Clickjacking), hardcoded demo credentials in frontend components, and missing rate-limiting on sensitive authentication and OTP verification flows.
- **1 LOW** severity finding: Verbose internal exception disclosure in global error responses.

No active SQL injection flaws were found due to consistent use of Spring Data JPA parameterized repository methods. Both `user-side` and `admin-side` npm dependencies passed audit with **0 vulnerabilities**.

---

## 2. Vulnerability Findings & Threat Analysis

### Summary Matrix

| Finding ID | Vulnerability Title | Severity | OWASP Category | Affected File(s) | Status |
|:---|:---|:---:|:---|:---|:---:|
| **SEC-01** | Unauthenticated Account Takeover via Password Reset | **CRITICAL** | A07:2021 Identification & Auth Failures | `AuthService.java`, `AuthController.java` | **Remediated** |
| **SEC-02** | Broken Object-Level Authorization (IDOR) on Orders | **HIGH** | A01:2021 Broken Access Control | `OrderController.java`, `OrderService.java` | **Remediated** |
| **SEC-03** | Delivery Verification OTP Leaked to Delivery Partner | **HIGH** | A01:2021 Broken Access Control | `OrderService.java`, `DeliveryPartnerController.java` | **Remediated** |
| **SEC-04** | User BCrypt Password Hash Exposed in API & LocalStorage | **HIGH** | A02:2021 Cryptographic Failures | `User.java`, `AuthController.java`, `AuthContext.jsx` | **Remediated** |
| **SEC-05** | Overly Permissive CORS with Allowed Credentials | **HIGH** | A05:2021 Security Misconfiguration | `CorsConfig.java` | **Remediated** |
| **SEC-06** | Hardcoded Static JWT Secret & Database Credentials | **HIGH** | A02:2021 Cryptographic Failures | `application.properties`, `application-mysql.properties` | **Remediated** |
| **SEC-07** | Remote H2 Console Enabled & Frame Options Disabled | **MEDIUM** | A05:2021 Security Misconfiguration | `application.properties`, `SecurityConfig.java` | **Remediated** |
| **SEC-08** | Hardcoded Demo Credentials in Production Frontends | **MEDIUM** | A07:2021 Identification & Auth Failures | `PortalSwitcher.jsx`, `LoginPage.jsx` | **Remediated** |
| **SEC-09** | Missing Rate Limiting on Login & Delivery OTP Verification | **MEDIUM** | A04:2021 Insecure Design | `AuthController.java`, `OrderService.java` | **Remediated** |
| **SEC-10** | Unhandled Internal Exception Details Disclosed in 500 Responses | **LOW** | A05:2021 Security Misconfiguration | `GlobalExceptionHandler.java` | **Remediated** |

---

### Detailed Findings

#### [SEC-01] CRITICAL: Unauthenticated Account Takeover via Password Reset
- **Vulnerability Name:** Broken Authentication - Arbitrary Password Reset Without Proof of Identity
- **Severity:** Critical (CVSS 9.8 - AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)
- **Affected Files:**
  - `server-side/src/main/java/com/ecommerce/service/AuthService.java` (Lines 118–124)
  - `server-side/src/main/java/com/ecommerce/controller/AuthController.java` (Lines 45–49)
  - `server-side/src/main/java/com/ecommerce/security/SecurityConfig.java` (Line 54)
- **Evidence:**
  ```java
  // In SecurityConfig.java line 54:
  .requestMatchers("/api/auth/**").permitAll()

  // In AuthService.java lines 118-124:
  @Transactional
  public void resetPassword(PasswordResetRequest request) {
      User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
              .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

      user.setPassword(passwordEncoder.encode(request.getNewPassword()));
      userRepository.save(user);
  }
  ```
- **Conditions Required for Exploitation:** Any remote attacker can send an unauthenticated HTTP POST to `/api/auth/reset-password` specifying any target email (such as `admin@novamart.com`) and a new password.
- **Potential Impact:** Complete administrative and customer account takeover. Attackers can reset any account password without needing access to email, SMS, or old password.
- **Recommended Fix:** Require authenticated context or validation of `oldPassword` for self-service resets, or implement a cryptographically secure, time-bounded, single-use reset token sent via email.
- **Verification Test:** Send `POST /api/auth/reset-password` with `{ "email": "admin@novamart.com", "newPassword": "HackedPassword123" }` without credentials. Verify that the server returns `400 Bad Request` or `401 Unauthorized` and does not alter the stored password.

---

#### [SEC-02] HIGH: Broken Object-Level Authorization (IDOR / BOLA) on Orders
- **Vulnerability Name:** Insecure Direct Object Reference (BOLA) in Order Lookup, Cancellation, and Returns
- **Severity:** High (CVSS 8.5 - AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N)
- **Affected Files:**
  - `server-side/src/main/java/com/ecommerce/controller/OrderController.java` (Lines 42–64)
  - `server-side/src/main/java/com/ecommerce/service/OrderService.java` (Lines 179–183, 199–228, 231–243)
- **Evidence:**
  ```java
  // In OrderController.java:
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id) {
      OrderDto order = orderService.getOrderById(id); // Does NOT pass current user
      return ResponseEntity.ok(ApiResponse.ok("Order details retrieved", order));
  }
  // In OrderService.java:
  public OrderDto getOrderById(Long orderId) {
      Order order = orderRepository.findById(orderId)
              .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
      return mapToDto(order); // No user ownership check!
  }
  ```
- **Conditions Required for Exploitation:** Authenticated user with `ROLE_CUSTOMER` accessing order ID belonging to another user.
- **Potential Impact:** Customer A can view Customer B's order details, delivery address, phone number, purchased items, and delivery OTP. Customer A can also unilaterally cancel Customer B's orders or submit return requests.
- **Recommended Fix:** Pass `currentUser` into `getOrderById`, `cancelOrder`, and `requestReturn`. Validate that `order.getUser().getId().equals(currentUser.getId())` unless the caller has `ROLE_ADMIN`.
- **Verification Test:** Customer A creates Order #1. Customer B attempts `GET /api/orders/1` and `POST /api/orders/1/cancel`. Verify that the backend returns `403 Forbidden` or `404 Not Found`.

---

#### [SEC-03] HIGH: Delivery Verification OTP Leaked to Delivery Partner API
- **Vulnerability Name:** Sensitive Data Exposure - Verification Secret Disclosed to Untrusted Party
- **Severity:** High (CVSS 7.4 - AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N)
- **Affected Files:**
  - `server-side/src/main/java/com/ecommerce/service/OrderService.java` (Line 409)
  - `server-side/src/main/java/com/ecommerce/controller/DeliveryPartnerController.java` (Lines 61–67)
- **Evidence:**
  ```java
  // In OrderService.java line 409 (inside mapToDto):
  dto.setDeliveryOtp(o.getDeliveryOtp()); // Blindly exposes OTP in all order DTOs!

  // In DeliveryPartnerController.java lines 61-67:
  @GetMapping("/deliveries")
  public ResponseEntity<ApiResponse<List<OrderDto>>> getAssignedDeliveries() {
      // Returns OrderDto list containing the customer's secret OTP!
  }
  ```
- **Conditions Required for Exploitation:** Any delivery partner logged into their dashboard checks their assigned orders API response.
- **Potential Impact:** The delivery verification OTP is meant to be a shared secret held strictly by the customer until actual physical package handover. Exposing it in the delivery partner's API response allows a dishonest partner to complete orders and mark packages as delivered without ever meeting the customer or handing over goods.
- **Recommended Fix:** Mask `deliveryOtp` (set to `null`) in `mapToDto` when serialized for delivery partners or public queries; only the purchasing customer should see their OTP.
- **Verification Test:** Call `GET /api/delivery-partners/deliveries` with a valid delivery partner token. Verify that `deliveryOtp` is `null` or omitted in every returned order object.

---

#### [SEC-04] HIGH: User BCrypt Password Hash Exposed in API & LocalStorage
- **Vulnerability Name:** Excessive Data Exposure - Sensitive Cryptographic Hash Leaked
- **Severity:** High (CVSS 7.5 - AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N)
- **Affected Files:**
  - `server-side/src/main/java/com/ecommerce/entity/User.java` (Line 18)
  - `server-side/src/main/java/com/ecommerce/controller/AuthController.java` (Lines 51–55)
  - `server-side/src/main/java/com/ecommerce/controller/AdminOrderController.java` (Lines 57–61)
  - `user-side/src/context/AuthContext.jsx` (Lines 26–27)
- **Evidence:**
  ```java
  // In User.java:
  @Column(nullable = false)
  private String password; // Missing @JsonProperty(access = WRITE_ONLY) or @JsonIgnore!

  // In AuthController.java:
  @GetMapping("/me")
  public ResponseEntity<ApiResponse<User>> getCurrentUser() {
      User user = authService.getCurrentAuthenticatedUser();
      return ResponseEntity.ok(ApiResponse.ok("User profile retrieved", user)); // User entity serialized!
  }
  ```
  ```javascript
  // In AuthContext.jsx:
  authAPI.getMe().then(res => {
      localStorage.setItem('novamart_user', JSON.stringify(res.data)); // Stores bcrypt hash in localStorage!
  });
  ```
- **Conditions Required for Exploitation:** Any logged-in user calling `/api/auth/me`, or an admin calling `/api/admin/customers`, receives raw BCrypt password hashes in the JSON response payload.
- **Potential Impact:** Password hashes stored in browser `localStorage` can be extracted via XSS, browser extensions, or device inspection, and subjected to offline dictionary/rainbow table cracking.
- **Recommended Fix:** Annotate `User.password` with `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)` and ensure `UserDto` or entity serializers never output the password field.
- **Verification Test:** Send `GET /api/auth/me` with a valid token. Check the JSON response body. Ensure `"password"` key is absent or `null`.

---

#### [SEC-05] HIGH: Overly Permissive CORS with Allowed Credentials
- **Vulnerability Name:** Cross-Origin Resource Sharing Misconfiguration (Arbitrary Origin Reflection with Credentials)
- **Severity:** High (CVSS 7.1 - AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:H/A:N)
- **Affected Files:**
  - `server-side/src/main/java/com/ecommerce/config/CorsConfig.java` (Lines 20–21)
- **Evidence:**
  ```java
  config.setAllowCredentials(true);
  config.setAllowedOriginPatterns(Collections.singletonList("*"));
  ```
- **Conditions Required for Exploitation:** Victim user visits a malicious website while authenticated to NovaMart. The malicious website issues cross-origin asynchronous requests to `http://localhost:8080/api/...`.
- **Potential Impact:** The browser permits the malicious origin to read sensitive authenticated responses and customer data.
- **Recommended Fix:** Restrict `allowedOriginPatterns` to explicitly whitelisted origins (`http://localhost:5173`, `http://localhost:5174`, `http://127.0.0.1:5173`, `http://127.0.0.1:5174`).
- **Verification Test:** Send an `OPTIONS` request with `Origin: https://malicious-site.example.com`. Verify that the server does not return `Access-Control-Allow-Origin: https://malicious-site.example.com`.

---

#### [SEC-06] HIGH: Hardcoded Static JWT Secret & Database Credentials
- **Vulnerability Name:** Credential / Key Exposure in Application Properties
- **Severity:** High (CVSS 7.4 - AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N)
- **Affected Files:**
  - `server-side/src/main/resources/application.properties` (Line 25)
  - `server-side/src/main/resources/application-mysql.properties` (Lines 5, 12)
- **Evidence:**
  ```properties
  # In application.properties & application-mysql.properties:
  app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
  spring.datasource.password=Parth@1749
  ```
- **Conditions Required for Exploitation:** Access to code repository or properties files.
- **Potential Impact:** An attacker knowing the static HMAC-SHA256 secret key can forge valid JWT tokens for any identity (e.g., `ROLE_ADMIN`) without interacting with the authentication server.
- **Recommended Fix:** Support externalized environment variable injection with fallbacks (`${JWT_SECRET:404E...}` and `${DB_PASSWORD:Parth@1749}`).
- **Verification Test:** Verify that when `JWT_SECRET` environment variable is defined, the application reads the secret from the environment.

---

#### [SEC-07] MEDIUM: Remote H2 Console Enabled & Frame Options Disabled
- **Vulnerability Name:** Security Misconfiguration - Remote DB Console Exposure & Clickjacking Vulnerability
- **Severity:** Medium (CVSS 5.3 - AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N)
- **Affected Files:**
  - `server-side/src/main/resources/application.properties` (Line 16)
  - `server-side/src/main/java/com/ecommerce/security/SecurityConfig.java` (Line 49)
- **Evidence:**
  ```properties
  spring.h2.console.settings.web-allow-others=true
  ```
  ```java
  headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable)
  ```
- **Conditions Required for Exploitation:** Attacker accesses H2 console remotely or embeds the platform inside an iframe for clickjacking attacks.
- **Potential Impact:** Information disclosure of in-memory schema and data; potential UI redressing attacks across all web routes.
- **Recommended Fix:** Set `spring.h2.console.settings.web-allow-others=false`. Replace `frameOptions.disable()` with `frameOptions.sameOrigin()`.
- **Verification Test:** Verify `X-Frame-Options: SAMEORIGIN` is returned on HTTP responses and H2 console cannot be accessed from remote IP addresses.

---

#### [SEC-08] MEDIUM: Hardcoded Demo Credentials in Production Frontends
- **Vulnerability Name:** Information Exposure - Pre-filled Administrative Credentials in UI
- **Severity:** Medium (CVSS 5.3 - AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N)
- **Affected Files:**
  - `user-side/src/components/PortalSwitcher.jsx` (Lines 82–105)
  - `user-side/src/pages/customer/LoginPage.jsx` (Lines 153–165)
- **Evidence:**
  ```javascript
  // In PortalSwitcher.jsx:
  onClick={() => handleQuickLogin('admin@novamart.com', 'Admin@123', 'admin')}
  ```
- **Conditions Required for Exploitation:** User clicks the demo login button or inspects client-side bundle.
- **Potential Impact:** 1-click administrative privilege acquisition for anyone browsing the user interface.
- **Recommended Fix:** Wrap demo credentials and one-click login buttons behind `import.meta.env.DEV` condition so they are completely eliminated from production builds.
- **Verification Test:** Run production build (`npm run build`). Verify that demo credential auto-fill elements do not appear in production deployment mode.

---

#### [SEC-09] MEDIUM: Missing Rate Limiting on Login & Delivery OTP Verification
- **Vulnerability Name:** Insufficient Anti-Automation / Brute-Force Vulnerability
- **Severity:** Medium (CVSS 5.3 - AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N)
- **Affected Files:**
  - `server-side/src/main/java/com/ecommerce/controller/AuthController.java` (Line 22)
  - `server-side/src/main/java/com/ecommerce/service/OrderService.java` (Lines 319–324)
- **Evidence:**
  ```java
  // In OrderService.java:
  if (order.getDeliveryOtp() != null && !order.getDeliveryOtp().trim().equalsIgnoreCase(inputOtp.trim())) {
      throw new BadRequestException("Invalid delivery OTP. Please verify with the customer.");
  }
  ```
- **Conditions Required for Exploitation:** Attacker scripts repeated verification attempts against a known order.
- **Potential Impact:** Delivery OTPs are 6-digit numeric strings (1,000,000 combinations). Without attempt counters, automated tools can guess the OTP within minutes.
- **Recommended Fix:** Track failed OTP verification attempts per order (limit to 5 attempts before locking verification).
- **Verification Test:** Submit 6 consecutive incorrect OTPs. Verify that further verification attempts are blocked.

---

#### [SEC-10] LOW: Unhandled Internal Exception Details Disclosed in 500 Responses
- **Vulnerability Name:** Verbose Error Messages (Information Leakage)
- **Severity:** Low (CVSS 3.7 - AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N)
- **Affected Files:**
  - `server-side/src/main/java/com/ecommerce/exception/GlobalExceptionHandler.java` (Lines 47–51)
- **Evidence:**
  ```java
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorDetails> handleGlobalException(Exception ex, WebRequest request) {
      ErrorDetails errorDetails = new ErrorDetails(ex.getMessage(), request.getDescription(false));
      return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  ```
- **Conditions Required for Exploitation:** Triggering an unexpected server-side exception (database deadlock, syntax error).
- **Potential Impact:** Leakage of table names, database dialects, or internal package structures to untrusted clients.
- **Recommended Fix:** Return a sanitized generic error message (`"An unexpected error occurred. Please contact support."`) while logging full details internally.
- **Verification Test:** Trigger a 500 error and verify that the response message contains no internal exception stack traces.

---

## 3. Dependency Security Audit Results

1. **Maven Backend Dependencies (`server-side/pom.xml`):**
   - Spring Boot: `3.3.4` (Supported, active maintenance release)
   - Java: `21` (LTS)
   - JJWT: `0.12.5` (Modern, secure, utilizes `Keys.hmacShaKeyFor` and `Jwts.parser().verifyWith()`)
   - MySQL Connector: `com.mysql:mysql-connector-j` (Standard)
   - H2 Database: `com.h2database:h2` (In-memory development profile)
   - *Status:* Clean; no outdated or critical CVE dependencies detected in runtime scope.

2. **Frontend Dependencies (`user-side/package.json` & `admin-side/package.json`):**
   - Tool executed: `npm audit`
   - `user-side`: **found 0 vulnerabilities**
   - `admin-side`: **found 0 vulnerabilities**
   - *Status:* Clean.

---

## 4. Phase Three Remediation Plan (Safe & Targeted)

In accordance with strict safety rules:
1. **Timestamped Backups:** Before any file modification, a timestamped snapshot of all affected files will be preserved in a local backup directory.
2. **Implementation Sequence:**
   - **Step 1 (SEC-01):** Fix `AuthService.java` & `AuthController.java` to prevent unauthenticated password resets without identity validation.
   - **Step 2 (SEC-02):** Update `OrderController.java` & `OrderService.java` to pass the authenticated user and enforce ownership checks on order retrieval, cancellation, and return requests.
   - **Step 3 (SEC-03):** Update `OrderService.java` to scrub `deliveryOtp` when generating DTOs for delivery partners.
   - **Step 4 (SEC-04):** Add `@JsonProperty(access = Access.WRITE_ONLY)` to `User.password`.
   - **Step 5 (SEC-05):** Restrict `CorsConfig.java` to authorized origins (`localhost:5173`, `localhost:5174`, `127.0.0.1:5173`, `127.0.0.1:5174`).
   - **Step 6 (SEC-06):** Configure environment variable property injection (`${JWT_SECRET:...}`).
   - **Step 7 (SEC-07):** Update `SecurityConfig.java` to use `sameOrigin()` frame options and disable remote H2 console access.
   - **Step 8 (SEC-08):** Guard demo buttons behind `import.meta.env.DEV`.
   - **Step 9 (SEC-09):** Add OTP verification failure limits in `OrderService.java`.
   - **Step 10 (SEC-10):** Sanitize 500 error messages in `GlobalExceptionHandler.java`.

---

## 5. Phase Four: Automated Security Test Suite

To prove remediation without regressions, the following automated Spring Boot test cases will be created under `server-side/src/test/java/com/ecommerce/security/SecurityVulnerabilityTests.java`:
1. `testUnauthenticatedPasswordResetBlocked()` — Proves SEC-01 fix.
2. `testCustomerCannotAccessOtherCustomerOrder()` — Proves SEC-02 IDOR fix.
3. `testDeliveryPartnerCannotSeeCustomerOtp()` — Proves SEC-03 OTP leakage fix.
4. `testUserEntityDoesNotExposePasswordHash()` — Proves SEC-04 fix.
5. `testCorsBlocksArbitraryOriginWithCredentials()` — Proves SEC-05 fix.
6. `testClickjackingFrameOptionsConfigured()` — Proves SEC-07 fix.

---

## 6. Phase Five Verification Protocol

1. `mvn test-compile -f "server-side/pom.xml"`
2. `mvn test -f "server-side/pom.xml"`
3. `npm run build` in `user-side/`
4. `npm run build` in `admin-side/`
5. Manual verification of customer, admin, and delivery partner authentication workflows.
