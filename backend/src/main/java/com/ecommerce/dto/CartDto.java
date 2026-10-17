package com.ecommerce.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartDto {
    private Long id;
    private List<CartItemDto> items = new ArrayList<>();
    private Integer totalItems = 0;
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal estimatedDelivery = BigDecimal.ZERO;
    private BigDecimal grandTotal = BigDecimal.ZERO;

    public CartDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public List<CartItemDto> getItems() { return items; }
    public void setItems(List<CartItemDto> items) { this.items = items; }

    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(BigDecimal estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }

    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }
}
