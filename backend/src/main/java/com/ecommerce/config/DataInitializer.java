package com.ecommerce.config;

import com.ecommerce.entity.*;
import com.ecommerce.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final CouponRepository couponRepository;
    private final AddressRepository addressRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           DeliveryZoneRepository deliveryZoneRepository,
                           DeliveryPartnerRepository deliveryPartnerRepository,
                           CouponRepository couponRepository,
                           AddressRepository addressRepository,
                           ReviewRepository reviewRepository,
                           OrderRepository orderRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.deliveryZoneRepository = deliveryZoneRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.couponRepository = couponRepository;
        this.addressRepository = addressRepository;
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already initialized
        }

        // 1. Create Default Users
        User admin = new User("admin@novamart.com", passwordEncoder.encode("Admin@123"), "System Administrator", "9898000001", Role.ROLE_ADMIN);
        userRepository.save(admin);

        User partnerUser1 = new User("partner@novamart.com", passwordEncoder.encode("Partner@123"), "Rajesh Kumar", "9898000002", Role.ROLE_DELIVERY_PARTNER);
        userRepository.save(partnerUser1);

        User partnerUser2 = new User("partner2@novamart.com", passwordEncoder.encode("Partner@123"), "Amit Patel", "9898000003", Role.ROLE_DELIVERY_PARTNER);
        userRepository.save(partnerUser2);

        User customer = new User("customer@novamart.com", passwordEncoder.encode("Customer@123"), "Priya Sharma", "9898000004", Role.ROLE_CUSTOMER);
        userRepository.save(customer);

        // 2. Create Delivery Zones (from PDF specification Section 7)
        DeliveryZone centralZone = new DeliveryZone(
                "Vadodara Central",
                "Vadodara",
                "Central & Alkapuri",
                "390001, 390002, 390007, 390009"
        );
        centralZone = deliveryZoneRepository.save(centralZone);

        DeliveryZone westZone = new DeliveryZone(
                "Vadodara West",
                "Vadodara",
                "Akota & Gotri",
                "390010, 390011, 390012"
        );
        westZone = deliveryZoneRepository.save(westZone);

        // 3. Create Delivery Partners
        DeliveryPartner partner1 = new DeliveryPartner(partnerUser1, "Motorcycle", "GJ-06-AB-4321", "DL-GJ06-2022-008129");
        partner1.setStatus(DeliveryPartnerStatus.ACTIVE);
        partner1.setAvailable(true); // Online & ready
        partner1.setAssignedZones(new HashSet<>(Arrays.asList(centralZone)));
        deliveryPartnerRepository.save(partner1);

        DeliveryPartner partner2 = new DeliveryPartner(partnerUser2, "Electric Scooter", "GJ-06-EV-9912", "DL-GJ06-2021-004455");
        partner2.setStatus(DeliveryPartnerStatus.ACTIVE);
        partner2.setAvailable(false); // Offline
        partner2.setAssignedZones(new HashSet<>(Arrays.asList(westZone)));
        deliveryPartnerRepository.save(partner2);


        // 5. Create Categories
        Category catElectronics = categoryRepository.save(new Category(
                "Electronics",
                "electronics",
                "Smartphones, audio gear, TVs, laptops & gadgets",
                "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80"
        ));

        Category catFashion = categoryRepository.save(new Category(
                "Fashion",
                "fashion",
                "Trending men's and women's apparel, footwear & accessories",
                "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80"
        ));

        Category catHome = categoryRepository.save(new Category(
                "Home & Kitchen",
                "home-kitchen",
                "Smart appliances, cookware, furniture and living decor",
                "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80"
        ));

        Category catBeauty = categoryRepository.save(new Category(
                "Beauty & Care",
                "beauty-care",
                "Skincare, grooming, oral care and luxury fragrances",
                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80"
        ));

        // 6. Create Amazon-tier Products
        Product p1 = new Product();
        p1.setTitle("Apple iPhone 15 Pro (128 GB) - Natural Titanium");
        p1.setBrand("Apple");
        p1.setDescription("Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.");
        p1.setPrice(new BigDecimal("134900.00"));
        p1.setDiscountPercentage(9.0);
        p1.setStock(25);
        p1.setCategory(catElectronics);
        p1.setImageUrl("https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80");
        p1.setSpecifications("Screen Size: 6.1 Inches | Chip: A17 Pro | Storage: 128GB | Material: Aerospace-grade titanium");
        p1.setVariants("Natural Titanium, Blue Titanium, White Titanium, Black Titanium");
        p1.setRating(4.8);
        p1.setReviewCount(1420);
        productRepository.save(p1);

        Product p2 = new Product();
        p2.setTitle("Sony WH-1000XM5 Wireless Noise Canceling Headphones");
        p2.setBrand("Sony");
        p2.setDescription("Industry Leading Noise Canceling with 8 microphones and Auto NC Optimizer. Crystal clear hands-free calling and 30-hour battery life.");
        p2.setPrice(new BigDecimal("29990.00"));
        p2.setDiscountPercentage(15.0);
        p2.setStock(40);
        p2.setCategory(catElectronics);
        p2.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80");
        p2.setSpecifications("Battery: 30 Hours | Drivers: 30mm | Bluetooth: 5.2 | Weight: 250g");
        p2.setVariants("Silver, Midnight Blue, Matte Black");
        p2.setRating(4.7);
        p2.setReviewCount(840);
        productRepository.save(p2);

        Product p3 = new Product();
        p3.setTitle("Samsung 55-inch Crystal 4K Ultra HD Smart LED TV");
        p3.setBrand("Samsung");
        p3.setDescription("PurColor enables the TV to express a huge range of colors for optimal picture performance. Crystal Processor 4K delivers true-to-life shades.");
        p3.setPrice(new BigDecimal("46990.00"));
        p3.setDiscountPercentage(28.0);
        p3.setStock(15);
        p3.setCategory(catElectronics);
        p3.setImageUrl("https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80");
        p3.setSpecifications("Resolution: 4K Ultra HD (3840 x 2160) | Refresh Rate: 60Hz | Sound: 20W Output");
        p3.setVariants("55 Inch, 65 Inch");
        p3.setRating(4.5);
        p3.setReviewCount(520);
        productRepository.save(p3);

        Product p4 = new Product();
        p4.setTitle("Nike Air Zoom Pegasus 40 Men's Running Shoes");
        p4.setBrand("Nike");
        p4.setDescription("A springy ride for every run, the Peg's familiar, just-for-you feel returns to help you accomplish your goals. Dual Zoom Air units.");
        p4.setPrice(new BigDecimal("10495.00"));
        p4.setDiscountPercentage(20.0);
        p4.setStock(30);
        p4.setCategory(catFashion);
        p4.setImageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80");
        p4.setSpecifications("Closure: Lace-Up | Shoe Width: Medium | Sole: Rubber | Arch Type: High");
        p4.setVariants("UK 7, UK 8, UK 9, UK 10");
        p4.setRating(4.6);
        p4.setReviewCount(310);
        productRepository.save(p4);

        Product p5 = new Product();
        p5.setTitle("Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart");
        p5.setBrand("Instant Pot");
        p5.setDescription("Easy to use, easy to clean, fast, versatile, and convenient. Replaces 7 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker & warmer.");
        p5.setPrice(new BigDecimal("8990.00"));
        p5.setDiscountPercentage(22.0);
        p5.setStock(50);
        p5.setCategory(catHome);
        p5.setImageUrl("https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80");
        p5.setSpecifications("Capacity: 5.7 Liters | Material: Stainless Steel | Wattage: 1000 Watts");
        p5.setVariants("6 Quart, 8 Quart");
        p5.setRating(4.7);
        p5.setReviewCount(680);
        productRepository.save(p5);

        Product p6 = new Product();
        p6.setTitle("Logitech MX Master 3S Wireless Performance Mouse");
        p6.setBrand("Logitech");
        p6.setDescription("An icon remastered. Feel every moment of your workflow with even more precision, tactility, and performance, thanks to Quiet Clicks and an 8,000 DPI track-on-glass sensor.");
        p6.setPrice(new BigDecimal("9995.00"));
        p6.setDiscountPercentage(12.0);
        p6.setStock(60);
        p6.setCategory(catElectronics);
        p6.setImageUrl("https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80");
        p6.setSpecifications("DPI: 8000 | Connectivity: Bluetooth & Logi Bolt | Battery: Up to 70 days");
        p6.setVariants("Graphite, Pale Grey");
        p6.setRating(4.9);
        p6.setReviewCount(1120);
        productRepository.save(p6);

        Product p7 = new Product();
        p7.setTitle("Philips Sonicare ProtectiveClean 4100 Electric Toothbrush");
        p7.setBrand("Philips");
        p7.setDescription("Removes up to 7x more plaque vs. a manual toothbrush. Protects your teeth and gums with a pressure sensor that gently pulses to alert you when you're brushing too hard.");
        p7.setPrice(new BigDecimal("4499.00"));
        p7.setDiscountPercentage(18.0);
        p7.setStock(8); // Low stock test item (< 10)
        p7.setCategory(catBeauty);
        p7.setImageUrl("https://images.unsplash.com/photo-1559671088-751726a7e089?w=600&q=80");
        p7.setSpecifications("Speed: Up to 62,000 brush movements/min | Timer: Smartimer and Quadpacer");
        p7.setVariants("White, Black, Pastel Pink");
        p7.setRating(4.4);
        p7.setReviewCount(240);
        productRepository.save(p7);

        // 7. Create Coupons
        couponRepository.save(new Coupon("WELCOME50", 50.0, new BigDecimal("499.00"), new BigDecimal("250.00"), LocalDate.now().plusMonths(6)));
        couponRepository.save(new Coupon("SAVE20", 20.0, new BigDecimal("999.00"), new BigDecimal("500.00"), LocalDate.now().plusMonths(3)));
        couponRepository.save(new Coupon("FESTIVE10", 10.0, new BigDecimal("1499.00"), new BigDecimal("1000.00"), LocalDate.now().plusMonths(2)));

        // 8. Add sample review
        reviewRepository.save(new Review(p1, customer, 5, "Unbelievable camera quality!", "The titanium finish feels incredible in hand and the battery lasts well over a full day of heavy usage. Delivery was super quick to Vadodara!"));
        reviewRepository.save(new Review(p2, customer, 5, "Best noise cancellation on the market", "Soundstage is crisp and the comfort during long flights is unmatched. Highly recommended."));

        // 9. Seed Sample Assigned Order with Complete Customer Address for Delivery Partner Flow
        Order demoOrder = new Order();
        demoOrder.setOrderNumber("ORD-892401");
        demoOrder.setUser(customer);
        demoOrder.setShippingFullName("Priya Sharma");
        demoOrder.setShippingPhone("9898000004");
        demoOrder.setShippingStreetAddress("Flat 402, Shivalik Heights, R.C. Dutt Road, Alkapuri");
        demoOrder.setShippingLandmark("Opposite Circuit House, Near Alkapuri Club");
        demoOrder.setShippingCity("Vadodara");
        demoOrder.setShippingState("Gujarat");
        demoOrder.setShippingPinCode("390001");
        demoOrder.setDeliveryZone(centralZone);
        demoOrder.setDeliveryPartner(partner1);
        demoOrder.setTotalAmount(p2.getDiscountedPrice());
        demoOrder.setDiscountAmount(BigDecimal.ZERO);
        demoOrder.setDeliveryFee(BigDecimal.ZERO);
        demoOrder.setFinalAmount(p2.getDiscountedPrice());
        demoOrder.setPaymentMethod("COD");
        demoOrder.setPaymentStatus("PENDING");
        demoOrder.setOrderStatus(OrderStatus.ASSIGNED);
        demoOrder.setDeliveryOtp("482910");

        OrderItem orderItem = new OrderItem(demoOrder, p2, 1, p2.getDiscountedPrice(), "Matte Black");
        demoOrder.getItems().add(orderItem);
        orderRepository.save(demoOrder);

        partner1.setActiveDeliveriesCount(1);
        deliveryPartnerRepository.save(partner1);
    }
}
