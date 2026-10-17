package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.CreateOrderRequest;
import com.ecommerce.dto.OrderDto;
import com.ecommerce.entity.User;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        OrderDto order = orderService.createOrder(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Order placed successfully", order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> getUserOrders() {
        User user = authService.getCurrentAuthenticatedUser();
        List<OrderDto> orders = orderService.getUserOrders(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Orders retrieved", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        OrderDto order = orderService.getOrderById(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Order details retrieved", order));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        User user = authService.getCurrentAuthenticatedUser();
        String reason = body != null ? body.get("reason") : "Cancelled by user";
        OrderDto cancelled = orderService.cancelOrder(id, user, reason);
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully", cancelled));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<OrderDto>> requestReturn(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = authService.getCurrentAuthenticatedUser();
        String reason = body != null ? body.get("reason") : "Item return requested";
        OrderDto returned = orderService.requestReturn(id, user, reason);
        return ResponseEntity.ok(ApiResponse.ok("Return requested successfully", returned));
    }
}
