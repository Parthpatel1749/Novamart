package com.ecommerce.dto;

import java.math.BigDecimal;

public class ProductDto {
    private Long id;
    private String title;
    private String brand;
    private String description;
    private BigDecimal price;
    private Double discountPercentage;
    private BigDecimal discountedPrice;
    private Integer stock;
    private Integer availableStock;
    private Long categoryId;
    private String categoryName;
    private String imageUrl;
    private String additionalImages;
    private String specifications;
    private String variants;
    private Double rating;
    private Integer reviewCount;
    private boolean active;

    public ProductDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Double getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Double discountPercentage) { this.discountPercentage = discountPercentage; }

    public BigDecimal getDiscountedPrice() { return discountedPrice; }
    public void setDiscountedPrice(BigDecimal discountedPrice) { this.discountedPrice = discountedPrice; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Integer getAvailableStock() { return availableStock; }
    public void setAvailableStock(Integer availableStock) { this.availableStock = availableStock; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAdditionalImages() { return additionalImages; }
    public void setAdditionalImages(String additionalImages) { this.additionalImages = additionalImages; }

    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }

    public String getVariants() { return variants; }
    public void setVariants(String variants) { this.variants = variants; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
