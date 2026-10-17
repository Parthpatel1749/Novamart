package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.CouponDto;
import com.ecommerce.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping("/coupons/validate/{code}")
    public ResponseEntity<ApiResponse<CouponDto>> validateCoupon(
            @PathVariable String code,
            @RequestParam(defaultValue = "0") BigDecimal amount) {
        CouponDto coupon = couponService.validateCoupon(code, amount);
        return ResponseEntity.ok(ApiResponse.ok("Coupon is valid", coupon));
    }

    @GetMapping("/admin/coupons")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.ok("Coupons retrieved", couponService.getAllCoupons()));
    }

    @PostMapping("/admin/coupons")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@Valid @RequestBody CouponDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Coupon created successfully", couponService.createCoupon(dto)));
    }

    @DeleteMapping("/admin/coupons/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.ok("Coupon deleted successfully"));
    }
}
