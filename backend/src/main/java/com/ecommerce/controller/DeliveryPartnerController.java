package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.entity.DeliveryPartner;
import com.ecommerce.entity.User;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.DeliveryService;
import com.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-partners")
public class DeliveryPartnerController {

    private final DeliveryService deliveryService;
    private final OrderService orderService;
    private final AuthService authService;

    public DeliveryPartnerController(DeliveryService deliveryService,
                                     OrderService orderService,
                                     AuthService authService) {
        this.deliveryService = deliveryService;
        this.orderService = orderService;
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> register(
            @Valid @RequestBody DeliveryPartnerRegisterRequest request) {
        DeliveryPartnerDto partner = deliveryService.registerDeliveryPartner(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration submitted successfully. Waiting for admin approval.", partner));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Partner login successful", response));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> getProfile() {
        User user = authService.getCurrentAuthenticatedUser();
        DeliveryPartner partner = deliveryService.getPartnerByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", deliveryService.mapToDto(partner)));
    }

    @PutMapping("/status")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> updateAvailability(@RequestBody Map<String, Boolean> body) {
        User user = authService.getCurrentAuthenticatedUser();
        DeliveryPartner partner = deliveryService.getPartnerByUserId(user.getId());
        boolean available = body.getOrDefault("available", false);
        DeliveryPartnerDto updated = deliveryService.toggleAvailability(partner.getId(), available);
        return ResponseEntity.ok(ApiResponse.ok("Availability updated to " + (available ? "ONLINE" : "OFFLINE"), updated));
    }

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAssignedDeliveries() {
        User user = authService.getCurrentAuthenticatedUser();
        DeliveryPartner partner = deliveryService.getPartnerByUserId(user.getId());
        List<OrderDto> deliveries = orderService.getPartnerDeliveries(partner.getId());
        return ResponseEntity.ok(ApiResponse.ok("Deliveries retrieved", deliveries));
    }

    @PostMapping("/deliveries/{id}/accept")
    public ResponseEntity<ApiResponse<OrderDto>> acceptDelivery(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        DeliveryPartner partner = deliveryService.getPartnerByUserId(user.getId());
        OrderDto updated = orderService.acceptDelivery(id, partner.getId());
        return ResponseEntity.ok(ApiResponse.ok("Delivery accepted", updated));
    }

    @PostMapping("/deliveries/{id}/pickup")
    public ResponseEntity<ApiResponse<OrderDto>> pickupDelivery(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        DeliveryPartner partner = deliveryService.getPartnerByUserId(user.getId());
        OrderDto updated = orderService.pickupDelivery(id, partner.getId());
        return ResponseEntity.ok(ApiResponse.ok("Order picked up from warehouse", updated));
    }

    @PostMapping("/deliveries/{id}/out-for-delivery")
    public ResponseEntity<ApiResponse<OrderDto>> outForDelivery(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        DeliveryPartner partner = deliveryService.getPartnerByUserId(user.getId());
        OrderDto updated = orderService.outForDelivery(id, partner.getId());
        return ResponseEntity.ok(ApiResponse.ok("Order marked as out for delivery", updated));
    }

    @PostMapping("/deliveries/{id}/deliver")
    public ResponseEntity<ApiResponse<OrderDto>> deliverOrder(
            @PathVariable Long id,
            @RequestBody DeliveryStatusUpdateRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        DeliveryPartner partner = deliveryService.getPartnerByUserId(user.getId());
        OrderDto updated = orderService.completeDelivery(id, partner.getId(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.ok("Delivery confirmed and marked as DELIVERED!", updated));
    }

    @PostMapping("/deliveries/{id}/failed")
    public ResponseEntity<ApiResponse<OrderDto>> failedDelivery(
            @PathVariable Long id,
            @RequestBody DeliveryStatusUpdateRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        DeliveryPartner partner = deliveryService.getPartnerByUserId(user.getId());
        OrderDto updated = orderService.failDelivery(id, partner.getId(), request.getFailureReason());
        return ResponseEntity.ok(ApiResponse.ok("Delivery recorded as failed", updated));
    }
}
