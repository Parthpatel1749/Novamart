package com.ecommerce.service;

import com.ecommerce.dto.CouponDto;
import com.ecommerce.entity.Coupon;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CouponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<CouponDto> getAllCoupons() {
        return couponRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public CouponDto validateCoupon(String code, BigDecimal amount) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(code.trim())
                .orElseThrow(() -> new BadRequestException("Invalid or inactive coupon code"));

        if (!coupon.isValid(amount)) {
            throw new BadRequestException("Coupon conditions not met or coupon expired");
        }

        CouponDto dto = mapToDto(coupon);
        return dto;
    }

    @Transactional
    public CouponDto createCoupon(CouponDto dto) {
        if (couponRepository.existsByCodeIgnoreCase(dto.getCode().trim())) {
            throw new BadRequestException("Coupon with this code already exists");
        }

        Coupon coupon = new Coupon(
                dto.getCode().toUpperCase().trim(),
                dto.getDiscountPercentage(),
                dto.getMinOrderAmount(),
                dto.getMaxDiscountAmount(),
                dto.getExpiryDate()
        );
        coupon.setUsageLimit(dto.getUsageLimit() != null ? dto.getUsageLimit() : 1000);
        coupon.setActive(dto.isActive());

        return mapToDto(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        couponRepository.delete(coupon);
    }

    public CouponDto mapToDto(Coupon c) {
        CouponDto dto = new CouponDto();
        dto.setId(c.getId());
        dto.setCode(c.getCode());
        dto.setDiscountPercentage(c.getDiscountPercentage());
        dto.setMinOrderAmount(c.getMinOrderAmount());
        dto.setMaxDiscountAmount(c.getMaxDiscountAmount());
        dto.setExpiryDate(c.getExpiryDate());
        dto.setUsageLimit(c.getUsageLimit());
        dto.setUsedCount(c.getUsedCount());
        dto.setActive(c.isActive());
        return dto;
    }
}
