package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateOrderRequest {

    private Long addressId;

    @NotBlank(message = "Recipient name is required")
    private String shippingFullName;

    @NotBlank(message = "Phone number is required")
    private String shippingPhone;

    @NotBlank(message = "Street address is required")
    private String shippingStreetAddress;

    private String shippingLandmark;

    @NotBlank(message = "City is required")
    private String shippingCity;

    @NotBlank(message = "State is required")
    private String shippingState;

    @NotBlank(message = "PIN code is required")
    private String shippingPinCode;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // COD, CARD, UPI, NET_BANKING

    private String couponCode;

    // Optional for direct "Buy Now" without touching cart
    private Long directProductId;
    private Integer directQuantity;
    private String directVariant;

    public CreateOrderRequest() {}

    public Long getAddressId() { return addressId; }
    public void setAddressId(Long addressId) { this.addressId = addressId; }

    public String getShippingFullName() { return shippingFullName; }
    public void setShippingFullName(String shippingFullName) { this.shippingFullName = shippingFullName; }

    public String getShippingPhone() { return shippingPhone; }
    public void setShippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; }

    public String getShippingStreetAddress() { return shippingStreetAddress; }
    public void setShippingStreetAddress(String shippingStreetAddress) { this.shippingStreetAddress = shippingStreetAddress; }

    public String getShippingLandmark() { return shippingLandmark; }
    public void setShippingLandmark(String shippingLandmark) { this.shippingLandmark = shippingLandmark; }

    public String getShippingCity() { return shippingCity; }
    public void setShippingCity(String shippingCity) { this.shippingCity = shippingCity; }

    public String getShippingState() { return shippingState; }
    public void setShippingState(String shippingState) { this.shippingState = shippingState; }

    public String getShippingPinCode() { return shippingPinCode; }
    public void setShippingPinCode(String shippingPinCode) { this.shippingPinCode = shippingPinCode; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public Long getDirectProductId() { return directProductId; }
    public void setDirectProductId(Long directProductId) { this.directProductId = directProductId; }

    public Integer getDirectQuantity() { return directQuantity; }
    public void setDirectQuantity(Integer directQuantity) { this.directQuantity = directQuantity; }

    public String getDirectVariant() { return directVariant; }
    public void setDirectVariant(String directVariant) { this.directVariant = directVariant; }
}
