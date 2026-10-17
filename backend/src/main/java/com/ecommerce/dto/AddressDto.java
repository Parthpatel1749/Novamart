package com.ecommerce.dto;

public class AddressDto {
    private Long id;
    private String fullName;
    private String phone;
    private String streetAddress;
    private String landmark;
    private String city;
    private String state;
    private String pinCode;
    private boolean isDefault;

    public AddressDto() {}

    public AddressDto(Long id, String fullName, String phone, String streetAddress, String landmark, String city, String state, String pinCode, boolean isDefault) {
        this.id = id;
        this.fullName = fullName;
        this.phone = phone;
        this.streetAddress = streetAddress;
        this.landmark = landmark;
        this.city = city;
        this.state = state;
        this.pinCode = pinCode;
        this.isDefault = isDefault;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
}
