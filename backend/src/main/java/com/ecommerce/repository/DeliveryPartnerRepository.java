package com.ecommerce.repository;

import com.ecommerce.entity.DeliveryPartner;
import com.ecommerce.entity.DeliveryPartnerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {

    Optional<DeliveryPartner> findByUserId(Long userId);

    List<DeliveryPartner> findByStatus(DeliveryPartnerStatus status);

    List<DeliveryPartner> findByStatusAndIsAvailableTrue(DeliveryPartnerStatus status);

    @Query("SELECT dp FROM DeliveryPartner dp JOIN dp.assignedZones z " +
           "WHERE dp.status = :status AND dp.isAvailable = true AND z.id = :zoneId " +
           "ORDER BY dp.activeDeliveriesCount ASC")
    List<DeliveryPartner> findAvailablePartnersInZone(
            @Param("status") DeliveryPartnerStatus status,
            @Param("zoneId") Long zoneId);

    long countByStatus(DeliveryPartnerStatus status);
}
