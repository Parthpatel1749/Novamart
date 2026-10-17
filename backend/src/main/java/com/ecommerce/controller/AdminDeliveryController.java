package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.entity.DeliveryPartnerStatus;
import com.ecommerce.service.DeliveryService;
import com.ecommerce.service.DeliveryZoneService;
import com.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminDeliveryController {

    private final DeliveryService deliveryService;
    private final DeliveryZoneService deliveryZoneService;
    private final OrderService orderService;

    public AdminDeliveryController(DeliveryService deliveryService,
                                   DeliveryZoneService deliveryZoneService,
                                   OrderService orderService) {
        this.deliveryService = deliveryService;
        this.deliveryZoneService = deliveryZoneService;
        this.orderService = orderService;
    }

    // --- Delivery Partners Management ---
    @GetMapping("/delivery-partners")
    public ResponseEntity<ApiResponse<List<DeliveryPartnerDto>>> getDeliveryPartners(
            @RequestParam(required = false) DeliveryPartnerStatus status) {
        List<DeliveryPartnerDto> partners = deliveryService.getAllPartners(status);
        return ResponseEntity.ok(ApiResponse.ok("Delivery partners retrieved", partners));
    }

    @PostMapping("/delivery-partners/{id}/approve")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> approveDeliveryPartner(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, List<Long>> body) {
        List<Long> zoneIds = body != null ? body.get("zoneIds") : null;
        DeliveryPartnerDto approved = deliveryService.approvePartner(id, zoneIds);
        return ResponseEntity.ok(ApiResponse.ok("Delivery partner approved successfully", approved));
    }

    @PostMapping("/delivery-partners/{id}/reject")
    public ResponseEntity<ApiResponse<DeliveryPartnerDto>> rejectDeliveryPartner(@PathVariable Long id) {
        DeliveryPartnerDto rejected = deliveryService.rejectPartner(id);
        return ResponseEntity.ok(ApiResponse.ok("Delivery partner application rejected", rejected));
    }

    // --- Delivery Zones Management ---
    @GetMapping("/delivery-zones")
    public ResponseEntity<ApiResponse<List<DeliveryZoneDto>>> getDeliveryZones() {
        return ResponseEntity.ok(ApiResponse.ok("Delivery zones retrieved", deliveryZoneService.getAllZones()));
    }

    @PostMapping("/delivery-zones")
    public ResponseEntity<ApiResponse<DeliveryZoneDto>> createDeliveryZone(@Valid @RequestBody DeliveryZoneDto dto) {
        DeliveryZoneDto created = deliveryZoneService.createZone(dto);
        return ResponseEntity.ok(ApiResponse.ok("Delivery zone created successfully", created));
    }

    @PutMapping("/delivery-zones/{id}")
    public ResponseEntity<ApiResponse<DeliveryZoneDto>> updateDeliveryZone(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryZoneDto dto) {
        DeliveryZoneDto updated = deliveryZoneService.updateZone(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Delivery zone updated successfully", updated));
    }

    @DeleteMapping("/delivery-zones/{id}")
    public ResponseEntity<ApiResponse<String>> deleteDeliveryZone(@PathVariable Long id) {
        deliveryZoneService.deleteZone(id);
        return ResponseEntity.ok(ApiResponse.ok("Delivery zone deleted successfully"));
    }

    // --- Delivery Assignment & Reassignment ---
    @PostMapping("/deliveries/{orderId}/assign")
    public ResponseEntity<ApiResponse<OrderDto>> assignDelivery(
            @PathVariable Long orderId,
            @Valid @RequestBody AssignDeliveryRequest request) {
        OrderDto order = orderService.assignDeliveryPartner(orderId, request);
        return ResponseEntity.ok(ApiResponse.ok("Delivery partner assigned successfully", order));
    }

    @PutMapping("/deliveries/{orderId}/reassign")
    public ResponseEntity<ApiResponse<OrderDto>> reassignDelivery(
            @PathVariable Long orderId,
            @Valid @RequestBody AssignDeliveryRequest request) {
        OrderDto order = orderService.assignDeliveryPartner(orderId, request);
        return ResponseEntity.ok(ApiResponse.ok("Delivery partner reassigned successfully", order));
    }
}
