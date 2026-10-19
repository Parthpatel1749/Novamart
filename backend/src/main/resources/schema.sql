-- ====================================================================
-- NovaMart E-Commerce Database Schema
-- Database Name: ecommerce_db
-- Compatible with: MySQL 8.0+ / MariaDB / H2 (MySQL Mode)
-- ====================================================================

-- CREATE DATABASE IF NOT EXISTS ecommerce_db;
-- USE ecommerce_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    role VARCHAR(50) NOT NULL COMMENT 'ROLE_CUSTOMER, ROLE_ADMIN, ROLE_DELIVERY_PARTNER',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255),
    description VARCHAR(1000),
    image_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    description VARCHAR(3000),
    price DECIMAL(10, 2) NOT NULL,
    discount_percentage DOUBLE DEFAULT 0.0,
    stock INT DEFAULT 0,
    reserved_stock INT DEFAULT 0,
    sold_quantity INT DEFAULT 0,
    category_id BIGINT,
    image_url VARCHAR(255),
    additional_images VARCHAR(2000),
    specifications VARCHAR(2000),
    variants VARCHAR(1000),
    rating DOUBLE DEFAULT 4.5,
    review_count INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

-- 4. ADDRESSES TABLE (Customer Saved Addresses)
CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 5. DELIVERY ZONES TABLE (Hyperlocal Area Management)
CREATE TABLE IF NOT EXISTS delivery_zones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_name VARCHAR(255) NOT NULL UNIQUE,
    city VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    pin_codes VARCHAR(1000) NOT NULL COMMENT 'Comma-separated PIN codes e.g. 390001, 390002',
    active BOOLEAN DEFAULT TRUE
);

-- 6. DELIVERY PARTNERS TABLE
CREATE TABLE IF NOT EXISTS delivery_partners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    vehicle_type VARCHAR(255),
    vehicle_number VARCHAR(255),
    license_number VARCHAR(255),
    profile_photo_url VARCHAR(255),
    document_info VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'UNDER_REVIEW' COMMENT 'UNDER_REVIEW, ACTIVE, REJECTED',
    is_available BOOLEAN NOT NULL DEFAULT FALSE,
    active_deliveries_count INT DEFAULT 0,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_delivery_partners_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 7. PARTNER ZONES MAPPING TABLE (Many-to-Many: Partner <-> Zones)
CREATE TABLE IF NOT EXISTS partner_zones (
    partner_id BIGINT NOT NULL,
    zone_id BIGINT NOT NULL,
    PRIMARY KEY (partner_id, zone_id),
    CONSTRAINT fk_pz_partner FOREIGN KEY (partner_id) REFERENCES delivery_partners (id) ON DELETE CASCADE,
    CONSTRAINT fk_pz_zone FOREIGN KEY (zone_id) REFERENCES delivery_zones (id) ON DELETE CASCADE
);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    shipping_full_name VARCHAR(255),
    shipping_phone VARCHAR(255),
    shipping_street_address VARCHAR(255),
    shipping_landmark VARCHAR(255),
    shipping_city VARCHAR(255),
    shipping_state VARCHAR(255),
    shipping_pin_code VARCHAR(10) NOT NULL,
    delivery_zone_id BIGINT,
    delivery_partner_id BIGINT,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    final_amount DECIMAL(10, 2) NOT NULL,
    applied_coupon_code VARCHAR(255),
    payment_method VARCHAR(255) NOT NULL COMMENT 'COD, CARD, UPI, NET_BANKING',
    payment_status VARCHAR(255) NOT NULL COMMENT 'PENDING, PAID, REFUNDED, FAILED',
    order_status VARCHAR(50) NOT NULL DEFAULT 'PLACED' COMMENT 'PLACED, CONFIRMED, PROCESSING, PACKED, ASSIGNED, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED, REFUND_INITIATED, REFUNDED, DELIVERY_FAILED',
    delivery_otp VARCHAR(6),
    cancel_reason VARCHAR(255),
    return_reason VARCHAR(255),
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_orders_zone FOREIGN KEY (delivery_zone_id) REFERENCES delivery_zones (id) ON DELETE SET NULL,
    CONSTRAINT fk_orders_partner FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners (id) ON DELETE SET NULL
);

-- 9. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_title VARCHAR(255),
    product_image_url VARCHAR(255),
    selected_variant VARCHAR(255),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id)
);

-- 10. SHOPPING CARTS TABLE
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 11. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    selected_variant VARCHAR(255),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id)
);

-- 12. DELIVERY ASSIGNMENTS TABLE (Lifecycle tracking & OTP logs)
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    partner_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    delivery_otp VARCHAR(6),
    failure_reason VARCHAR(255),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    picked_up_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    CONSTRAINT fk_assignments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_partner FOREIGN KEY (partner_id) REFERENCES delivery_partners (id) ON DELETE CASCADE
);

-- 13. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    discount_percentage DOUBLE NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2),
    expiry_date DATE,
    usage_limit INT DEFAULT 1000,
    used_count INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- 14. PRODUCT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL COMMENT '1 to 5',
    title VARCHAR(255),
    comment VARCHAR(2000),
    verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ====================================================================
-- PERFORMANCE INDEXES (FOR 10,000 CONCURRENT USERS SCALABILITY)
-- ====================================================================

-- Products Catalog Query & Filter Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products (rating);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (active);
CREATE INDEX IF NOT EXISTS idx_products_composite_filter ON products (active, category_id, price);

-- Orders History, Status & Dispatch Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_partner_created ON orders (delivery_partner_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_zone ON orders (delivery_zone_id);

-- Order Items Relational Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);

-- Shopping Cart Fast Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items (product_id);

-- Delivery Assignments Partner Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_partner_status ON delivery_assignments (partner_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_order ON delivery_assignments (order_id);

-- Customer Addresses & Reviews Fast Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews (user_id);

