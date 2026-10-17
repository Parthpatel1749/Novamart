package com.ecommerce.dto;

import com.ecommerce.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private List<OrderItemDto> items = new ArrayList<>();

    private String shippingFullName;
    private String shippingPhone;
    private String shippingStreetAddress;
    private String shippingLandmark;
    private String shippingCity;
    private String shippingState;
    private String shippingPinCode;

    private Long deliveryZoneId;
    private String deliveryZoneName;
    private Long deliveryPartnerId;
    private String deliveryPartnerName;
    private String deliveryPartnerPhone;
    private String deliveryPartnerVehicle;

    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal finalAmount;

    private String appliedCouponCode;
    private String paymentMethod;
    private String paymentStatus;
    private OrderStatus orderStatus;

    // Delivery confirmation OTP for customer tracking and partner confirmation
    private String deliveryOtp;

    private String cancelReason;
    private String returnReason;
    private String failureReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }

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

    public Long getDeliveryZoneId() { return deliveryZoneId; }
    public void setDeliveryZoneId(Long deliveryZoneId) { this.deliveryZoneId = deliveryZoneId; }

    public String getDeliveryZoneName() { return deliveryZoneName; }
    public void setDeliveryZoneName(String deliveryZoneName) { this.deliveryZoneName = deliveryZoneName; }

    public Long getDeliveryPartnerId() { return deliveryPartnerId; }
    public void setDeliveryPartnerId(Long deliveryPartnerId) { this.deliveryPartnerId = deliveryPartnerId; }

    public String getDeliveryPartnerName() { return deliveryPartnerName; }
    public void setDeliveryPartnerName(String deliveryPartnerName) { this.deliveryPartnerName = deliveryPartnerName; }

    public String getDeliveryPartnerPhone() { return deliveryPartnerPhone; }
    public void setDeliveryPartnerPhone(String deliveryPartnerPhone) { this.deliveryPartnerPhone = deliveryPartnerPhone; }

    public String getDeliveryPartnerVehicle() { return deliveryPartnerVehicle; }
    public void setDeliveryPartnerVehicle(String deliveryPartnerVehicle) { this.deliveryPartnerVehicle = deliveryPartnerVehicle; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }

    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }

    public String getAppliedCouponCode() { return appliedCouponCode; }
    public void setAppliedCouponCode(String appliedCouponCode) { this.appliedCouponCode = appliedCouponCode; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public OrderStatus getOrderStatus() { return orderStatus; }
    public void setOrderStatus(OrderStatus orderStatus) { this.orderStatus = orderStatus; }

    public String getDeliveryOtp() { return deliveryOtp; }
    public void setDeliveryOtp(String deliveryOtp) { this.deliveryOtp = deliveryOtp; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    public String getReturnReason() { return returnReason; }
    public void setReturnReason(String returnReason) { this.returnReason = returnReason; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
