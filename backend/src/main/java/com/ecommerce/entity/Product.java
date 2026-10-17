package com.ecommerce.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String brand;

    @Column(length = 3000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private Double discountPercentage = 0.0;

    private Integer stock = 0;

    private Integer reservedStock = 0;

    private Integer soldQuantity = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    private String imageUrl;

    @Column(length = 2000)
    private String additionalImages; // comma or json formatted URLs

    @Column(length = 2000)
    private String specifications; // Key-value pairs or text

    @Column(length = 1000)
    private String variants; // JSON/CSV string of variants (e.g. Colors, Sizes)

    private Double rating = 4.5;

    private Integer reviewCount = 0;

    private boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Product() {}

    public BigDecimal getDiscountedPrice() {
        if (discountPercentage == null || discountPercentage <= 0) {
            return price;
        }
        BigDecimal discountFactor = BigDecimal.valueOf(1.0 - (discountPercentage / 100.0));
        return price.multiply(discountFactor).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    public int getAvailableStock() {
        return Math.max(0, (stock != null ? stock : 0) - (reservedStock != null ? reservedStock : 0));
    }

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

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Integer getReservedStock() { return reservedStock; }
    public void setReservedStock(Integer reservedStock) { this.reservedStock = reservedStock; }

    public Integer getSoldQuantity() { return soldQuantity; }
    public void setSoldQuantity(Integer soldQuantity) { this.soldQuantity = soldQuantity; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
