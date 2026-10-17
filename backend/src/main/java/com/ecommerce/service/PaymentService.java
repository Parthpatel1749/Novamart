package com.ecommerce.service;

import com.ecommerce.dto.ApiResponse;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    public Map<String, Object> createPaymentIntent(Map<String, Object> request) {
        String paymentId = "PAY_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        Map<String, Object> response = new HashMap<>();
        response.put("paymentId", paymentId);
        response.put("amount", request.get("amount"));
        response.put("currency", "INR");
        response.put("status", "CREATED");
        response.put("method", request.get("method"));
        return response;
    }

    public ApiResponse<Map<String, Object>> verifyPayment(Map<String, Object> verificationData) {
        String paymentId = (String) verificationData.get("paymentId");
        Map<String, Object> result = new HashMap<>();
        result.put("transactionId", "TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        result.put("paymentId", paymentId);
        result.put("status", "SUCCESS");
        result.put("timestamp", System.currentTimeMillis());
        return ApiResponse.ok("Payment verified successfully", result);
    }
}
