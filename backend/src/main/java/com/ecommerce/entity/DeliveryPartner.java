package com.ecommerce.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "delivery_partners")
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String vehicleType; // Bike, Scooter, Van, EV

    private String vehicleNumber;

    private String licenseNumber;

    private String profilePhotoUrl;

    private String documentInfo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryPartnerStatus status = DeliveryPartnerStatus.UNDER_REVIEW;

    @Column(nullable = false)
    private boolean isAvailable = false; // Online/Offline toggle

    private int activeDeliveriesCount = 0;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "partner_zones",
        joinColumns = @JoinColumn(name = "partner_id"),
        inverseJoinColumns = @JoinColumn(name = "zone_id")
    )
    private Set<DeliveryZone> assignedZones = new HashSet<>();

    private LocalDateTime registeredAt = LocalDateTime.now();

    public DeliveryPartner() {}

    public DeliveryPartner(User user, String vehicleType, String vehicleNumber, String licenseNumber) {
        this.user = user;
        this.vehicleType = vehicleType;
        this.vehicleNumber = vehicleNumber;
        this.licenseNumber = licenseNumber;
        this.status = DeliveryPartnerStatus.UNDER_REVIEW;
        this.isAvailable = false;
        this.activeDeliveriesCount = 0;
        this.registeredAt = LocalDateTime.now();
    }

    public boolean servesPin(String pin) {
        if (assignedZones == null || pin == null) return false;
        return assignedZones.stream().anyMatch(z -> z.isActive() && z.supportsPin(pin));
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }

    public String getDocumentInfo() { return documentInfo; }
    public void setDocumentInfo(String documentInfo) { this.documentInfo = documentInfo; }

    public DeliveryPartnerStatus getStatus() { return status; }
    public void setStatus(DeliveryPartnerStatus status) { this.status = status; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public int getActiveDeliveriesCount() { return activeDeliveriesCount; }
    public void setActiveDeliveriesCount(int activeDeliveriesCount) { this.activeDeliveriesCount = activeDeliveriesCount; }

    public Set<DeliveryZone> getAssignedZones() { return assignedZones; }
    public void setAssignedZones(Set<DeliveryZone> assignedZones) { this.assignedZones = assignedZones; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
}
