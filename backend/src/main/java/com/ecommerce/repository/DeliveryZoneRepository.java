package com.ecommerce.repository;

import com.ecommerce.entity.DeliveryZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryZoneRepository extends JpaRepository<DeliveryZone, Long> {
    List<DeliveryZone> findByActiveTrue();
    Optional<DeliveryZone> findByZoneNameIgnoreCase(String zoneName);
}
