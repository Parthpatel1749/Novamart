package com.ecommerce.dto;

public class DeliveryStatusUpdateRequest {
    private String status; // ACCEPTED, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, FAILED
    private String otp;
    private String failureReason;
    private String notes;

    public DeliveryStatusUpdateRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
