package com.ecommerce.repository;

import com.ecommerce.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCaseAndActiveTrue(String code);
    Optional<Coupon> findByCodeIgnoreCase(String code);
    Boolean existsByCodeIgnoreCase(String code);
}
