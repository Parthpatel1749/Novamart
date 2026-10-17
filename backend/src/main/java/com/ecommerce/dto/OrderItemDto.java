package com.ecommerce.dto;

import java.math.BigDecimal;

public class OrderItemDto {
    private Long id;
    private Long productId;
    private String productTitle;
    private String productImageUrl;
    private String selectedVariant;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;

    public OrderItemDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public String getSelectedVariant() { return selectedVariant; }
    public void setSelectedVariant(String selectedVariant) { this.selectedVariant = selectedVariant; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
