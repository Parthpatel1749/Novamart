package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPayment(@RequestBody Map<String, Object> request) {
        Map<String, Object> payment = paymentService.createPaymentIntent(request);
        return ResponseEntity.ok(ApiResponse.ok("Payment intent created", payment));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPayment(@RequestBody Map<String, Object> request) {
        ApiResponse<Map<String, Object>> response = paymentService.verifyPayment(request);
        return ResponseEntity.ok(response);
    }
}
