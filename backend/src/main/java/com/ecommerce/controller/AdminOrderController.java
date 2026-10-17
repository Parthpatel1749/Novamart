package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.DashboardStatsDto;
import com.ecommerce.dto.OrderDto;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;
    private final ReportService reportService;
    private final UserRepository userRepository;

    public AdminOrderController(OrderService orderService,
                                ReportService reportService,
                                UserRepository userRepository) {
        this.orderService = orderService;
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok("Orders retrieved", orderService.getAllOrdersAdmin()));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status").toUpperCase());
        OrderDto updated = orderService.updateOrderStatusAdmin(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated to " + status, updated));
    }

    @GetMapping("/reports/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = reportService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok("Dashboard statistics retrieved", stats));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<User>>> getCustomers() {
        List<User> customers = userRepository.findByRole(Role.ROLE_CUSTOMER);
        return ResponseEntity.ok(ApiResponse.ok("Customers retrieved", customers));
    }

    @PutMapping("/customers/{id}/status")
    public ResponseEntity<ApiResponse<User>> toggleCustomerStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        user.setActive(body.getOrDefault("active", true));
        return ResponseEntity.ok(ApiResponse.ok("Customer status updated", userRepository.save(user)));
    }
}
