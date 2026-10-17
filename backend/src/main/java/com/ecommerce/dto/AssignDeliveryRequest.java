package com.ecommerce.dto;

import jakarta.validation.constraints.NotNull;

public class AssignDeliveryRequest {
    @NotNull(message = "Delivery partner ID is required")
    private Long partnerId;

    private String notes;

    public AssignDeliveryRequest() {}

    public Long getPartnerId() { return partnerId; }
    public void setPartnerId(Long partnerId) { this.partnerId = partnerId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
