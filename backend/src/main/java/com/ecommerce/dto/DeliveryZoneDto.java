package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class DeliveryZoneDto {
    private Long id;

    @NotBlank(message = "Zone name is required")
    private String zoneName;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Area is required")
    private String area;

    @NotBlank(message = "PIN codes are required")
    private String pinCodes; // comma-separated

    private List<String> pinCodeList;
    private boolean active = true;

    public DeliveryZoneDto() {}

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

    public List<String> getPinCodeList() { return pinCodeList; }
    public void setPinCodeList(List<String> pinCodeList) { this.pinCodeList = pinCodeList; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
