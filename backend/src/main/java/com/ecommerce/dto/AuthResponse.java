package com.ecommerce.dto;

import com.ecommerce.entity.Role;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Role role;
    private Long deliveryPartnerId;
    private String deliveryPartnerStatus;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String email, String fullName, String phone, Role role) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getDeliveryPartnerId() { return deliveryPartnerId; }
    public void setDeliveryPartnerId(Long deliveryPartnerId) { this.deliveryPartnerId = deliveryPartnerId; }

    public String getDeliveryPartnerStatus() { return deliveryPartnerStatus; }
    public void setDeliveryPartnerStatus(String deliveryPartnerStatus) { this.deliveryPartnerStatus = deliveryPartnerStatus; }
}
