package com.ecommerce.entity;

import jakarta.persistence.*;
import java.util.Arrays;

@Entity
@Table(name = "delivery_zones")
public class DeliveryZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String zoneName;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String area;

    // Comma-separated PIN/ZIP codes, e.g. "390001, 390002, 390007, 390009"
    @Column(nullable = false, length = 1000)
    private String pinCodes;

    private boolean active = true;

    public DeliveryZone() {}

    public DeliveryZone(String zoneName, String city, String area, String pinCodes) {
        this.zoneName = zoneName;
        this.city = city;
        this.area = area;
        this.pinCodes = pinCodes;
        this.active = true;
    }

    public boolean supportsPin(String pin) {
        if (pin == null || pinCodes == null) return false;
        String cleanPin = pin.trim();
        return Arrays.stream(pinCodes.split(","))
                .map(String::trim)
                .anyMatch(p -> p.equalsIgnoreCase(cleanPin));
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getZoneName() { return zoneName; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getPinCodes() { return pinCodes; }
    public void setPinCodes(String pinCodes) { this.pinCodes = pinCodes; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
