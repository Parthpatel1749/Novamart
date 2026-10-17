package com.ecommerce.dto;

import com.ecommerce.entity.DeliveryPartnerStatus;
import java.time.LocalDateTime;
import java.util.List;

public class DeliveryPartnerDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String vehicleType;
    private String vehicleNumber;
    private String licenseNumber;
    private String profilePhotoUrl;
    private DeliveryPartnerStatus status;
    private boolean isAvailable;
    private int activeDeliveriesCount;
    private List<DeliveryZoneDto> assignedZones;
    private LocalDateTime registeredAt;

    public DeliveryPartnerDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }

    public DeliveryPartnerStatus getStatus() { return status; }
    public void setStatus(DeliveryPartnerStatus status) { this.status = status; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public int getActiveDeliveriesCount() { return activeDeliveriesCount; }
    public void setActiveDeliveriesCount(int activeDeliveriesCount) { this.activeDeliveriesCount = activeDeliveriesCount; }

    public List<DeliveryZoneDto> getAssignedZones() { return assignedZones; }
    public void setAssignedZones(List<DeliveryZoneDto> assignedZones) { this.assignedZones = assignedZones; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
}
