package com.ecommerce.repository;

import com.ecommerce.entity.DeliveryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    List<DeliveryAssignment> findByPartnerIdOrderByAssignedAtDesc(Long partnerId);
    Optional<DeliveryAssignment> findByOrderId(Long orderId);
}
