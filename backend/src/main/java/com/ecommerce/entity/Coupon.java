package com.ecommerce.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private Double discountPercentage;

    @Column(precision = 10, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    private LocalDate expiryDate;

    private Integer usageLimit = 1000;

    private Integer usedCount = 0;

    private boolean active = true;

    public Coupon() {}

    public Coupon(String code, Double discountPercentage, BigDecimal minOrderAmount, BigDecimal maxDiscountAmount, LocalDate expiryDate) {
        this.code = code;
        this.discountPercentage = discountPercentage;
        this.minOrderAmount = minOrderAmount;
        this.maxDiscountAmount = maxDiscountAmount;
        this.expiryDate = expiryDate;
        this.active = true;
    }

    public boolean isValid(BigDecimal orderTotal) {
        if (!active) return false;
        if (expiryDate != null && expiryDate.isBefore(LocalDate.now())) return false;
        if (minOrderAmount != null && orderTotal.compareTo(minOrderAmount) < 0) return false;
        if (usageLimit != null && usedCount >= usageLimit) return false;
        return true;
    }

    public BigDecimal calculateDiscount(BigDecimal orderTotal) {
        if (!isValid(orderTotal)) return BigDecimal.ZERO;
        BigDecimal calculated = orderTotal.multiply(BigDecimal.valueOf(discountPercentage / 100.0));
        if (maxDiscountAmount != null && calculated.compareTo(maxDiscountAmount) > 0) {
            return maxDiscountAmount;
        }
        return calculated.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Double getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Double discountPercentage) { this.discountPercentage = discountPercentage; }

    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public BigDecimal getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }

    public Integer getUsedCount() { return usedCount; }
    public void setUsedCount(Integer usedCount) { this.usedCount = usedCount; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
