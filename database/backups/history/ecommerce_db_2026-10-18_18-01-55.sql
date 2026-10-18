-- MySQL dump 10.13  Distrib 26.7.0, for Win64 (x86_64)
--
-- Host: localhost    Database: ecommerce_db
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `street_address` varchar(255) NOT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `pin_code` varchar(10) NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_addresses_user` (`user_id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (2,6,'vishal patel','454669856565','gsgchjhcgv','','Vadodara','Gujarat','388640',1);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cart_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `selected_variant` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cart_items_cart` (`cart_id`),
  KEY `fk_cart_items_product` (`product_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,5,'2026-10-13 06:37:06'),(2,1,'2026-10-11 00:43:26'),(3,6,'2026-10-11 00:56:00'),(4,4,'2026-10-11 01:09:13'),(5,2,'2026-10-16 00:26:22');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Electronics','electronics','Smartphones, audio gear, TVs, laptops & gadgets','https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80',1),(2,'Fashion','fashion','Trending men\'s and women\'s apparel, footwear & accessories','https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80',1),(3,'Home & Kitchen','home-kitchen','Smart appliances, cookware, furniture and living decor','https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80',1),(4,'Beauty & Care','beauty-care','Skincare, grooming, oral care and luxury fragrances','https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80',1);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `discount_percentage` double NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT '0.00',
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `usage_limit` int DEFAULT '1000',
  `used_count` int DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'WELCOME50',50,499.00,250.00,'2027-04-11',1000,0,1),(2,'SAVE20',20,999.00,500.00,'2027-01-11',1000,0,1),(3,'FESTIVE10',10,1499.00,1000.00,'2026-12-11',1000,0,1);
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_assignments`
--

DROP TABLE IF EXISTS `delivery_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `partner_id` bigint NOT NULL,
  `status` varchar(50) NOT NULL,
  `delivery_otp` varchar(255) DEFAULT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `picked_up_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_assignments_order` (`order_id`),
  KEY `fk_assignments_partner` (`partner_id`),
  CONSTRAINT `fk_assignments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_partner` FOREIGN KEY (`partner_id`) REFERENCES `delivery_partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_assignments`
--

LOCK TABLES `delivery_assignments` WRITE;
/*!40000 ALTER TABLE `delivery_assignments` DISABLE KEYS */;
INSERT INTO `delivery_assignments` VALUES (1,1,3,'DELIVERED',NULL,NULL,'2026-10-12 08:02:50',NULL,'2026-10-12 08:04:08','2026-10-12 08:06:00'),(2,2,1,'ASSIGNED',NULL,NULL,'2026-10-11 01:16:26',NULL,NULL,NULL),(3,3,1,'ASSIGNED',NULL,NULL,'2026-10-13 06:42:15',NULL,NULL,NULL);
/*!40000 ALTER TABLE `delivery_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_partners`
--

DROP TABLE IF EXISTS `delivery_partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_partners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `vehicle_type` varchar(255) DEFAULT NULL,
  `vehicle_number` varchar(255) DEFAULT NULL,
  `license_number` varchar(255) DEFAULT NULL,
  `profile_photo_url` varchar(255) DEFAULT NULL,
  `document_info` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'UNDER_REVIEW' COMMENT 'UNDER_REVIEW, ACTIVE, REJECTED',
  `is_available` tinyint(1) NOT NULL DEFAULT '0',
  `active_deliveries_count` int DEFAULT '0',
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_delivery_partners_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_partners`
--

LOCK TABLES `delivery_partners` WRITE;
/*!40000 ALTER TABLE `delivery_partners` DISABLE KEYS */;
INSERT INTO `delivery_partners` VALUES (1,2,'Motorcycle','GJ-06-AB-4321','DL-GJ06-2022-008129',NULL,NULL,'ACTIVE',0,2,'2026-10-11 00:37:24'),(2,3,'Electric Scooter','GJ-06-EV-9912','DL-GJ06-2021-004455',NULL,NULL,'ACTIVE',0,0,'2026-10-11 00:37:25'),(3,6,'Motorcycle','BZ kzbxjnknlbj','KJHBNKLCOIUGBKC','','Aadhaar & DL Verified','ACTIVE',0,0,'2026-10-11 00:46:44'),(4,7,'Van','uytfbhjuytf','ytresghjkiuytrdfgh','','Aadhaar & DL Verified','ACTIVE',0,0,'2026-10-11 01:48:39');
/*!40000 ALTER TABLE `delivery_partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_zones`
--

DROP TABLE IF EXISTS `delivery_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_zones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `zone_name` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `area` varchar(255) NOT NULL,
  `pin_codes` varchar(1000) NOT NULL COMMENT 'Comma-separated PIN codes e.g. 390001, 390002',
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `zone_name` (`zone_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_zones`
--

LOCK TABLES `delivery_zones` WRITE;
/*!40000 ALTER TABLE `delivery_zones` DISABLE KEYS */;
INSERT INTO `delivery_zones` VALUES (1,'Vadodara Central','Vadodara','Central & Alkapuri','390001, 390002, 390007, 390009',1),(2,'Vadodara West','Vadodara','Akota & Gotri','390010, 390011, 390012',1),(3,'vadodra','Vadodara',' jkbkj','388640',1);
/*!40000 ALTER TABLE `delivery_zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `product_title` varchar(255) DEFAULT NULL,
  `product_image_url` varchar(255) DEFAULT NULL,
  `selected_variant` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,'Apple iPhone 15 Pro (128 GB) - Natural Titanium','https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',NULL,1,122759.00,122759.00),(2,1,2,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',NULL,1,25491.50,25491.50),(3,1,3,'Samsung 55-inch Crystal 4K Ultra HD Smart LED TV','https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80',NULL,1,33832.80,33832.80),(4,2,2,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',NULL,1,25491.50,25491.50),(5,3,3,'Samsung 55-inch Crystal 4K Ultra HD Smart LED TV','https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80',NULL,2,33832.80,67665.60);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_number` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  `shipping_full_name` varchar(255) DEFAULT NULL,
  `shipping_phone` varchar(255) DEFAULT NULL,
  `shipping_street_address` varchar(255) DEFAULT NULL,
  `shipping_landmark` varchar(255) DEFAULT NULL,
  `shipping_city` varchar(255) DEFAULT NULL,
  `shipping_state` varchar(255) DEFAULT NULL,
  `shipping_pin_code` varchar(10) NOT NULL,
  `delivery_zone_id` bigint DEFAULT NULL,
  `delivery_partner_id` bigint DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `delivery_fee` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(10,2) NOT NULL,
  `applied_coupon_code` varchar(255) DEFAULT NULL,
  `payment_method` varchar(255) NOT NULL COMMENT 'COD, CARD, UPI, NET_BANKING',
  `payment_status` varchar(255) NOT NULL COMMENT 'PENDING, PAID, REFUNDED, FAILED',
  `order_status` varchar(50) NOT NULL DEFAULT 'PLACED' COMMENT 'PLACED, CONFIRMED, PROCESSING, PACKED, ASSIGNED, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED, REFUND_INITIATED, REFUNDED, DELIVERY_FAILED',
  `delivery_otp` varchar(255) DEFAULT NULL,
  `cancel_reason` varchar(255) DEFAULT NULL,
  `return_reason` varchar(255) DEFAULT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `otp_attempts` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `fk_orders_user` (`user_id`),
  KEY `fk_orders_zone` (`delivery_zone_id`),
  KEY `fk_orders_partner` (`delivery_partner_id`),
  CONSTRAINT `fk_orders_partner` FOREIGN KEY (`delivery_partner_id`) REFERENCES `delivery_partners` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_orders_zone` FOREIGN KEY (`delivery_zone_id`) REFERENCES `delivery_zones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-109729',5,'patel parth','9726136851','Flat 302, Shivalik Residency, R.C. Dutt Road, Alkapuri','Near Express Hotel','Vadodara','Gujarat','388640',NULL,3,182083.30,0.00,0.00,182083.30,NULL,'CARD','PAID','DELIVERED','830739',NULL,NULL,NULL,'2026-10-11 00:41:58','2026-10-12 08:05:59',0),(2,'ORD-644263',6,'vishal patel','454669856565','gsgchjhcgv','Near Express Hotel','Vadodara','Gujarat','388640',3,1,25491.50,0.00,0.00,25491.50,NULL,'UPI','PAID','ASSIGNED','192825',NULL,NULL,NULL,'2026-10-11 00:56:24','2026-10-11 01:16:25',0),(3,'ORD-407593',5,'patel parth','9726136851','Flat 302, Shivalik Residency, R.C. Dutt Road, Alkapuri','Near Express Hotel','Vadodara','Gujarat','388640',3,1,67665.60,0.00,0.00,67665.60,NULL,'CARD','PAID','ASSIGNED','080335',NULL,NULL,NULL,'2026-10-13 06:37:36','2026-10-13 06:42:15',0);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partner_zones`
--

DROP TABLE IF EXISTS `partner_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partner_zones` (
  `partner_id` bigint NOT NULL,
  `zone_id` bigint NOT NULL,
  PRIMARY KEY (`partner_id`,`zone_id`),
  KEY `fk_pz_zone` (`zone_id`),
  CONSTRAINT `fk_pz_partner` FOREIGN KEY (`partner_id`) REFERENCES `delivery_partners` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pz_zone` FOREIGN KEY (`zone_id`) REFERENCES `delivery_zones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partner_zones`
--

LOCK TABLES `partner_zones` WRITE;
/*!40000 ALTER TABLE `partner_zones` DISABLE KEYS */;
INSERT INTO `partner_zones` VALUES (1,1),(4,1),(2,2),(3,2),(4,2),(3,3),(4,3);
/*!40000 ALTER TABLE `partner_zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `brand` varchar(255) NOT NULL,
  `description` varchar(3000) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount_percentage` double DEFAULT '0',
  `stock` int DEFAULT '0',
  `reserved_stock` int DEFAULT '0',
  `sold_quantity` int DEFAULT '0',
  `category_id` bigint DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `additional_images` varchar(2000) DEFAULT NULL,
  `specifications` varchar(2000) DEFAULT NULL,
  `variants` varchar(1000) DEFAULT NULL,
  `rating` double DEFAULT '4.5',
  `review_count` int DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Apple iPhone 15 Pro (128 GB) - Natural Titanium','Apple','Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',134900.00,9,24,0,2,1,'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',NULL,'Screen Size: 6.1 Inches | Chip: A17 Pro | Storage: 128GB | Material: Aerospace-grade titanium','Natural Titanium, Blue Titanium, White Titanium, Black Titanium',4.8,1420,1,'2026-10-11 00:37:25'),(2,'Sony WH-1000XM5 Wireless Noise Canceling Headphones','Sony','Industry Leading Noise Canceling with 8 microphones and Auto NC Optimizer. Crystal clear hands-free calling and 30-hour battery life.',29990.00,15,38,0,2,1,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',NULL,'Battery: 30 Hours | Drivers: 30mm | Bluetooth: 5.2 | Weight: 250g','Silver, Midnight Blue, Matte Black',4.7,840,1,'2026-10-11 00:37:25'),(3,'Samsung 55-inch Crystal 4K Ultra HD Smart LED TV','Samsung','PurColor enables the TV to express a huge range of colors for optimal picture performance. Crystal Processor 4K delivers true-to-life shades.',46990.00,28,12,2,2,1,'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80',NULL,'Resolution: 4K Ultra HD (3840 x 2160) | Refresh Rate: 60Hz | Sound: 20W Output','55 Inch, 65 Inch',4.5,520,1,'2026-10-11 00:37:25'),(4,'Nike Air Zoom Pegasus 40 Men\'s Running Shoes','Nike','A springy ride for every run, the Peg\'s familiar, just-for-you feel returns to help you accomplish your goals. Dual Zoom Air units.',10495.00,20,30,0,0,2,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',NULL,'Closure: Lace-Up | Shoe Width: Medium | Sole: Rubber | Arch Type: High','UK 7, UK 8, UK 9, UK 10',4.6,310,1,'2026-10-11 00:37:25'),(5,'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart','Instant Pot','Easy to use, easy to clean, fast, versatile, and convenient. Replaces 7 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker & warmer.',8990.00,22,50,0,0,3,'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80',NULL,'Capacity: 5.7 Liters | Material: Stainless Steel | Wattage: 1000 Watts','6 Quart, 8 Quart',4.7,680,1,'2026-10-11 00:37:25'),(6,'Logitech MX Master 3S Wireless Performance Mouse','Logitech','An icon remastered. Feel every moment of your workflow with even more precision, tactility, and performance, thanks to Quiet Clicks and an 8,000 DPI track-on-glass sensor.',9995.00,12,60,0,0,1,'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80',NULL,'DPI: 8000 | Connectivity: Bluetooth & Logi Bolt | Battery: Up to 70 days','Graphite, Pale Grey',4.9,1120,1,'2026-10-11 00:37:25'),(7,'Philips Sonicare ProtectiveClean 4100 Electric Toothbrush','Philips','Removes up to 7x more plaque vs. a manual toothbrush. Protects your teeth and gums with a pressure sensor that gently pulses to alert you when you\'re brushing too hard.',4499.00,18,8,0,0,4,'https://images.unsplash.com/photo-1559671088-751726a7e089?w=600&q=80',NULL,'Speed: Up to 62,000 brush movements/min | Timer: Smartimer and Quadpacer','White, Black, Pastel Pink',4.4,240,1,'2026-10-11 00:37:25'),(8,'patel','[atel','jchajhds',145.00,1.2,20,0,0,4,'C:\\Users\\LENOVO\\OneDrive\\Pictures\\Screenshots',NULL,'kjhbnkjhgv','jhgbjhg',4.5,0,1,'2026-10-11 01:08:26');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `rating` int NOT NULL COMMENT '1 to 5',
  `title` varchar(255) DEFAULT NULL,
  `comment` varchar(2000) DEFAULT NULL,
  `verified_purchase` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_reviews_product` (`product_id`),
  KEY `fk_reviews_user` (`user_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,4,5,'Unbelievable camera quality!','The titanium finish feels incredible in hand and the battery lasts well over a full day of heavy usage. Delivery was super quick to Vadodara!',1,'2026-10-11 00:37:25'),(2,2,4,5,'Best noise cancellation on the market','Soundstage is crisp and the comfort during long flights is unmatched. Highly recommended.',1,'2026-10-11 00:37:25');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` varchar(50) NOT NULL COMMENT 'ROLE_CUSTOMER, ROLE_ADMIN, ROLE_DELIVERY_PARTNER',
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@novamart.com','$2a$10$pHtnPI3b5HfGQLNPi6GnyOpw.POOJmypu9vMrhb3idFwsVSOQIwqW','System Administrator','9898000001','ROLE_ADMIN',1,'2026-10-11 00:37:24'),(2,'partner@novamart.com','$2a$10$6yQp3yXfridwDCRUjxZDbejMeeZbSEVU2wHQTEBWH0HjTzwnzGRwa','Rajesh Kumar','9898000002','ROLE_DELIVERY_PARTNER',1,'2026-10-11 00:37:24'),(3,'partner2@novamart.com','$2a$10$o5lQX6gxt53T3jHA7/O7.efpxkE5YwGQuFv6YaqsyEf4Df3XSgrsW','Amit Patel','9898000003','ROLE_DELIVERY_PARTNER',1,'2026-10-11 00:37:24'),(4,'customer@novamart.com','$2a$10$tHmgre5N4cyCN0/Hd.6X/OheEcwgx01U/qPIDdnVgqJ6oZTcBSlRG','Priya Sharma','9898000004','ROLE_CUSTOMER',1,'2026-10-11 00:37:24'),(5,'pp123@gmail.com','$2a$10$VW44dS8tSMboC.BhxJ83dOBs1RIXHqt4lbGVcn6m1pNcVjg6UQNLK','patel parth','9726136851','ROLE_CUSTOMER',1,'2026-10-11 00:38:24'),(6,'vishal123@gmail.com','$2a$10$XvSkmIgdlpp8zGylC5xrROdwfob0NYhUgxUiLgOAWLraEso8/yNDm','vishal patel','454669856565','ROLE_DELIVERY_PARTNER',1,'2026-10-11 00:46:44'),(7,'apurv123@gmail.com','$2a$10$BkaRtmn9np1SbkoeJG4U7upipE3cPVYeUOPu8htp0IreNEsicSWjm','apurv patel','841254126842','ROLE_DELIVERY_PARTNER',1,'2026-10-11 01:48:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'ecommerce_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-18 18:01:56
