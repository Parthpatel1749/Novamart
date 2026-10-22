package com.ecommerce.service;

import com.ecommerce.dto.AssignDeliveryRequest;
import com.ecommerce.dto.CreateOrderRequest;
import com.ecommerce.dto.OrderDto;
import com.ecommerce.dto.OrderItemDto;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final DeliveryZoneService deliveryZoneService;
    private final DeliveryService deliveryService;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final CouponRepository couponRepository;
    private final AddressRepository addressRepository;

    private final SecureRandom random = new SecureRandom();

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        CartService cartService,
                        DeliveryZoneService deliveryZoneService,
                        DeliveryService deliveryService,
                        DeliveryPartnerRepository deliveryPartnerRepository,
                        CouponRepository couponRepository,
                        AddressRepository addressRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
        this.deliveryZoneService = deliveryZoneService;
        this.deliveryService = deliveryService;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.couponRepository = couponRepository;
        this.addressRepository = addressRepository;
    }

    @Transactional
    public OrderDto createOrder(User user, CreateOrderRequest request) {
        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber("ORD-" + System.currentTimeMillis() + "-" + String.format("%04d", random.nextInt(10000)));
        order.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        order.setPaymentStatus(request.getPaymentMethod().equalsIgnoreCase("COD") ? "PENDING" : "PAID");
        order.setOrderStatus(OrderStatus.CONFIRMED);

        // Generate 6-digit delivery verification OTP
        String otp = String.format("%06d", random.nextInt(1000000));
        order.setDeliveryOtp(otp);

        // Set shipping details
        order.setShippingFullName(request.getShippingFullName());
        order.setShippingPhone(request.getShippingPhone());
        order.setShippingStreetAddress(request.getShippingStreetAddress());
        order.setShippingLandmark(request.getShippingLandmark());
        order.setShippingCity(request.getShippingCity());
        order.setShippingState(request.getShippingState());
        order.setShippingPinCode(request.getShippingPinCode().trim());

        // Process items: Either direct buy or from Cart with Pessimistic Row Locking
        List<OrderItem> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        if (request.getDirectProductId() != null) {
            Product product = productRepository.findByIdForUpdate(request.getDirectProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getDirectProductId()));

            int qty = request.getDirectQuantity() != null && request.getDirectQuantity() > 0 ? request.getDirectQuantity() : 1;
            if (product.getAvailableStock() < qty) {
                throw new BadRequestException("Insufficient stock for product: " + product.getTitle());
            }

            product.setStock(product.getStock() - qty);
            product.setSoldQuantity((product.getSoldQuantity() != null ? product.getSoldQuantity() : 0) + qty);
            productRepository.save(product);

            OrderItem orderItem = new OrderItem(order, product, qty, product.getDiscountedPrice(), request.getDirectVariant());
            items.add(orderItem);
            totalAmount = orderItem.getSubtotal();
        } else {
            Cart cart = cartService.getOrCreateCart(user);
            if (cart.getItems().isEmpty()) {
                throw new BadRequestException("Your cart is empty");
            }

            for (CartItem cartItem : cart.getItems()) {
                Product product = productRepository.findByIdForUpdate(cartItem.getProduct().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product", "id", cartItem.getProduct().getId()));

                if (product.getAvailableStock() < cartItem.getQuantity()) {
                    throw new BadRequestException("Product " + product.getTitle() + " has only " + product.getAvailableStock() + " in stock");
                }

                product.setStock(product.getStock() - cartItem.getQuantity());
                product.setSoldQuantity((product.getSoldQuantity() != null ? product.getSoldQuantity() : 0) + cartItem.getQuantity());
                productRepository.save(product);

                OrderItem orderItem = new OrderItem(order, product, cartItem.getQuantity(), cartItem.getUnitPrice(), cartItem.getSelectedVariant());
                items.add(orderItem);
                totalAmount = totalAmount.add(orderItem.getSubtotal());
            }

            // Clear user's cart
            cartService.clearCart(user);
        }

        order.setItems(items);
        order.setTotalAmount(totalAmount);

        // Apply coupon if valid
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndActiveTrue(request.getCouponCode().trim());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                if (coupon.isValid(totalAmount)) {
                    discount = coupon.calculateDiscount(totalAmount);
                    order.setAppliedCouponCode(coupon.getCode());
                    coupon.setUsedCount(coupon.getUsedCount() + 1);
                    couponRepository.save(coupon);
                }
            }
        }
        order.setDiscountAmount(discount);

        // Calculate delivery fee
        BigDecimal deliveryFee = totalAmount.compareTo(new BigDecimal("499")) >= 0 ? BigDecimal.ZERO : new BigDecimal("40.00");
        order.setDeliveryFee(deliveryFee);

        BigDecimal finalAmount = totalAmount.subtract(discount).add(deliveryFee);
        order.setFinalAmount(finalAmount.max(BigDecimal.ZERO));

        // Area-Based Delivery Partner Assignment Flow
        Optional<DeliveryZone> matchedZone = deliveryZoneService.findZoneByPin(order.getShippingPinCode());
        if (matchedZone.isPresent()) {
            DeliveryZone zone = matchedZone.get();
            order.setDeliveryZone(zone);

            Optional<DeliveryPartner> bestPartner = deliveryService.findBestAvailablePartnerForZone(zone);
            if (bestPartner.isPresent()) {
                DeliveryPartner partner = bestPartner.get();
                order.setDeliveryPartner(partner);
                order.setOrderStatus(OrderStatus.ASSIGNED);

                partner.setActiveDeliveriesCount(partner.getActiveDeliveriesCount() + 1);
                deliveryPartnerRepository.save(partner);
            }
        }

        Order saved = orderRepository.save(order);

        if (saved.getDeliveryPartner() != null && matchedZone.isPresent()) {
            deliveryService.recordStatusChange(saved, saved.getDeliveryPartner(), OrderStatus.ASSIGNED, "Auto-assigned by Area Zone: " + matchedZone.get().getZoneName(), null);
        }

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = order.getUser() != null && order.getUser().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new BadRequestException("You are not authorized to view this order");
        }
        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrdersAdmin() {
        return orderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getPartnerDeliveries(Long partnerId) {
        return orderRepository.findByDeliveryPartnerIdOrderByCreatedAtDesc(partnerId).stream()
                .map(this::mapToPartnerDto)
                .collect(Collectors.toList());
    }

    public OrderDto mapToPartnerDto(Order o) {
        OrderDto dto = mapToDto(o);
        dto.setDeliveryOtp(null); // Sensitive verification secret hidden from delivery partner
        return dto;
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Delivered orders cannot be cancelled. Please request a return instead.");
        }

        // Restock products with pessimistic lock
        for (OrderItem item : order.getItems()) {
            Product p = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElse(item.getProduct());
            p.setStock(p.getStock() + item.getQuantity());
            p.setSoldQuantity(Math.max(0, (p.getSoldQuantity() != null ? p.getSoldQuantity() : 0) - item.getQuantity()));
            productRepository.save(p);
        }

        // Decrement partner load if assigned
        if (order.getDeliveryPartner() != null && order.getOrderStatus() != OrderStatus.CANCELLED) {
            DeliveryPartner dp = order.getDeliveryPartner();
            dp.setActiveDeliveriesCount(Math.max(0, dp.getActiveDeliveriesCount() - 1));
            deliveryPartnerRepository.save(dp);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason != null ? reason : "Cancelled by user");
        order.setPaymentStatus(order.getPaymentStatus().equals("PAID") ? "REFUNDED" : "CANCELLED");
        order.setUpdatedAt(LocalDateTime.now());

        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, User user, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = order.getUser() != null && order.getUser().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new BadRequestException("You are not authorized to cancel this order");
        }

        return cancelOrder(orderId, reason);
    }

    @Transactional
    public OrderDto requestReturn(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Only delivered orders can be returned.");
        }

        order.setOrderStatus(OrderStatus.RETURN_REQUESTED);
        order.setReturnReason(reason);
        order.setUpdatedAt(LocalDateTime.now());
        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto requestReturn(Long orderId, User user, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = order.getUser() != null && order.getUser().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new BadRequestException("You are not authorized to request return for this order");
        }

        return requestReturn(orderId, reason);
    }

    @Transactional
    public OrderDto updateOrderStatusAdmin(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setOrderStatus(status);
        order.setUpdatedAt(LocalDateTime.now());

        if (status == OrderStatus.REFUNDED) {
            order.setPaymentStatus("REFUNDED");
        }

        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto assignDeliveryPartner(Long orderId, AssignDeliveryRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        DeliveryPartner partner = deliveryPartnerRepository.findById(request.getPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery Partner", "id", request.getPartnerId()));

        if (partner.getStatus() != DeliveryPartnerStatus.ACTIVE) {
            throw new BadRequestException("Partner must be ACTIVE and approved");
        }

        if (order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot assign or reassign a delivery partner to an order that is already DELIVERED.");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot assign or reassign a delivery partner to a CANCELLED order.");
        }

        if (order.getOrderStatus() == OrderStatus.RETURNED || order.getOrderStatus() == OrderStatus.REFUNDED) {
            throw new BadRequestException("Cannot assign or reassign a delivery partner to a closed order (" + order.getOrderStatus() + ").");
        }

        if (order.getDeliveryPartner() != null && !order.getDeliveryPartner().getId().equals(partner.getId())) {
            DeliveryPartner oldPartner = order.getDeliveryPartner();
            oldPartner.setActiveDeliveriesCount(Math.max(0, oldPartner.getActiveDeliveriesCount() - 1));
            deliveryPartnerRepository.save(oldPartner);
        }

        order.setDeliveryPartner(partner);
        order.setOrderStatus(OrderStatus.ASSIGNED);
        order.setUpdatedAt(LocalDateTime.now());

        partner.setActiveDeliveriesCount(partner.getActiveDeliveriesCount() + 1);
        deliveryPartnerRepository.save(partner);

        deliveryService.recordStatusChange(order, partner, OrderStatus.ASSIGNED, request.getNotes(), null);

        return mapToDto(orderRepository.save(order));
    }

    // Delivery Partner Flow Actions
    @Transactional
    public OrderDto acceptDelivery(Long orderId, Long partnerId) {
        Order order = getPartnerOrder(orderId, partnerId);
        order.setOrderStatus(OrderStatus.PROCESSING);
        order.setUpdatedAt(LocalDateTime.now());
        deliveryService.recordStatusChange(order, order.getDeliveryPartner(), OrderStatus.PROCESSING, "Partner accepted delivery", null);
        return mapToPartnerDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto pickupDelivery(Long orderId, Long partnerId) {
        Order order = getPartnerOrder(orderId, partnerId);
        order.setOrderStatus(OrderStatus.PICKED_UP);
        order.setUpdatedAt(LocalDateTime.now());
        deliveryService.recordStatusChange(order, order.getDeliveryPartner(), OrderStatus.PICKED_UP, "Partner picked up order from warehouse", null);
        return mapToPartnerDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto outForDelivery(Long orderId, Long partnerId) {
        Order order = getPartnerOrder(orderId, partnerId);
        order.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
        order.setUpdatedAt(LocalDateTime.now());
        deliveryService.recordStatusChange(order, order.getDeliveryPartner(), OrderStatus.OUT_FOR_DELIVERY, "Order is out for delivery", null);
        return mapToPartnerDto(orderRepository.save(order));
    }

    @Transactional(noRollbackFor = BadRequestException.class)
    public OrderDto completeDelivery(Long orderId, Long partnerId, String inputOtp) {
        Order order = getPartnerOrder(orderId, partnerId);

        if (order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Order is already delivered.");
        }

        if (order.getOtpAttempts() >= 5) {
            throw new BadRequestException("Maximum OTP verification attempts (5) exceeded. Delivery verification is locked. Contact customer support.");
        }

        if (order.getDeliveryOtp() != null && !order.getDeliveryOtp().trim().equalsIgnoreCase(inputOtp != null ? inputOtp.trim() : "")) {
            order.setOtpAttempts(order.getOtpAttempts() + 1);
            orderRepository.save(order);
            int remaining = 5 - order.getOtpAttempts();
            throw new BadRequestException("Invalid delivery OTP. Attempts remaining: " + Math.max(0, remaining));
        }

        order.setOrderStatus(OrderStatus.DELIVERED);
        order.setPaymentStatus("PAID");
        order.setUpdatedAt(LocalDateTime.now());

        DeliveryPartner partner = order.getDeliveryPartner();
        partner.setActiveDeliveriesCount(Math.max(0, partner.getActiveDeliveriesCount() - 1));
        deliveryPartnerRepository.save(partner);

        // Update product sold quantities & release reserved stock
        for (OrderItem item : order.getItems()) {
            Product p = item.getProduct();
            p.setReservedStock(Math.max(0, p.getReservedStock() - item.getQuantity()));
            p.setSoldQuantity((p.getSoldQuantity() != null ? p.getSoldQuantity() : 0) + item.getQuantity());
            productRepository.save(p);
        }

        deliveryService.recordStatusChange(order, partner, OrderStatus.DELIVERED, "Delivered successfully with OTP verification", null);

        return mapToPartnerDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto failDelivery(Long orderId, Long partnerId, String reason) {
        Order order = getPartnerOrder(orderId, partnerId);
        order.setOrderStatus(OrderStatus.DELIVERY_FAILED);
        order.setFailureReason(reason);
        order.setUpdatedAt(LocalDateTime.now());

        DeliveryPartner partner = order.getDeliveryPartner();
        partner.setActiveDeliveriesCount(Math.max(0, partner.getActiveDeliveriesCount() - 1));
        deliveryPartnerRepository.save(partner);

        deliveryService.recordStatusChange(order, partner, OrderStatus.DELIVERY_FAILED, null, reason);

        return mapToPartnerDto(orderRepository.save(order));
    }

    private Order getPartnerOrder(Long orderId, Long partnerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getDeliveryPartner() == null || !order.getDeliveryPartner().getId().equals(partnerId)) {
            throw new BadRequestException("This order is not assigned to you");
        }
        return order;
    }

    public OrderDto mapToDto(Order o) {
        OrderDto dto = new OrderDto();
        dto.setId(o.getId());
        dto.setOrderNumber(o.getOrderNumber());
        dto.setCustomerId(o.getUser().getId());
        dto.setCustomerName(o.getUser().getFullName());
        dto.setCustomerEmail(o.getUser().getEmail());

        dto.setShippingFullName(o.getShippingFullName());
        dto.setShippingPhone(o.getShippingPhone());
        dto.setShippingStreetAddress(o.getShippingStreetAddress());
        dto.setShippingLandmark(o.getShippingLandmark());
        dto.setShippingCity(o.getShippingCity());
        dto.setShippingState(o.getShippingState());
        dto.setShippingPinCode(o.getShippingPinCode());

        if (o.getDeliveryZone() != null) {
            dto.setDeliveryZoneId(o.getDeliveryZone().getId());
            dto.setDeliveryZoneName(o.getDeliveryZone().getZoneName());
        }

        if (o.getDeliveryPartner() != null) {
            dto.setDeliveryPartnerId(o.getDeliveryPartner().getId());
            dto.setDeliveryPartnerName(o.getDeliveryPartner().getUser().getFullName());
            dto.setDeliveryPartnerPhone(o.getDeliveryPartner().getUser().getPhone());
            dto.setDeliveryPartnerVehicle(o.getDeliveryPartner().getVehicleType() + " (" + o.getDeliveryPartner().getVehicleNumber() + ")");
        }

        dto.setTotalAmount(o.getTotalAmount());
        dto.setDiscountAmount(o.getDiscountAmount());
        dto.setDeliveryFee(o.getDeliveryFee());
        dto.setFinalAmount(o.getFinalAmount());
        dto.setAppliedCouponCode(o.getAppliedCouponCode());
        dto.setPaymentMethod(o.getPaymentMethod());
        dto.setPaymentStatus(o.getPaymentStatus());
        dto.setOrderStatus(o.getOrderStatus());
        dto.setDeliveryOtp(o.getDeliveryOtp());
        dto.setCancelReason(o.getCancelReason());
        dto.setReturnReason(o.getReturnReason());
        dto.setFailureReason(o.getFailureReason());
        dto.setCreatedAt(o.getCreatedAt());
        dto.setUpdatedAt(o.getUpdatedAt());

        List<OrderItemDto> itemDtos = o.getItems().stream().map(item -> {
            OrderItemDto idto = new OrderItemDto();
            idto.setId(item.getId());
            idto.setProductId(item.getProduct().getId());
            idto.setProductTitle(item.getProductTitle());
            idto.setProductImageUrl(item.getProductImageUrl());
            idto.setSelectedVariant(item.getSelectedVariant());
            idto.setQuantity(item.getQuantity());
            idto.setPrice(item.getPrice());
            idto.setSubtotal(item.getSubtotal());
            return idto;
        }).collect(Collectors.toList());

        dto.setItems(itemDtos);
        return dto;
    }
}
