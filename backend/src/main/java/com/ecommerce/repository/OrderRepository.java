package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByDeliveryPartnerIdOrderByCreatedAtDesc(Long partnerId);

    List<Order> findByOrderStatus(OrderStatus orderStatus);

    List<Order> findByDeliveryZoneId(Long zoneId);

    long countByOrderStatus(OrderStatus orderStatus);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.orderStatus = com.ecommerce.entity.OrderStatus.DELIVERED")
    BigDecimal calculateTotalDeliveredSales();

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.orderStatus <> com.ecommerce.entity.OrderStatus.CANCELLED")
    BigDecimal calculateTotalActiveSales();
}
