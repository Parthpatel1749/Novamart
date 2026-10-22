package com.ecommerce.service;

import com.ecommerce.dto.ProductDto;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getProducts(String query, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                        Double minRating, String brand, String sortBy) {
        List<Product> products;

        if (query != null && !query.trim().isEmpty()) {
            products = productRepository.searchProducts(query.trim());
        } else if (categoryId != null || minPrice != null || maxPrice != null || minRating != null || brand != null) {
            products = productRepository.filterProducts(categoryId, minPrice, maxPrice, minRating, brand);
        } else {
            products = productRepository.findByActiveTrue();
        }

        // Apply sorting
        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "price_asc":
                    products.sort(Comparator.comparing(Product::getPrice));
                    break;
                case "price_desc":
                    products.sort(Comparator.comparing(Product::getPrice).reversed());
                    break;
                case "rating":
                    products.sort(Comparator.comparing(Product::getRating).reversed());
                    break;
                case "newest":
                    products.sort(Comparator.comparing(Product::getCreatedAt).reversed());
                    break;
                default:
                    break;
            }
        }

        return products.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getAllProductsAdmin() {
        return productRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDto(product);
    }

    @Transactional(readOnly = true)
    public Product getProductEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    @Transactional
    @CacheEvict(value = {"brands", "categories"}, allEntries = true)
    public ProductDto createProduct(ProductDto dto) {
        Product product = new Product();
        mapDtoToEntity(dto, product);
        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"brands", "categories"}, allEntries = true)
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = getProductEntityById(id);
        mapDtoToEntity(dto, product);
        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Transactional
    @CacheEvict(value = {"brands", "categories"}, allEntries = true)
    public void deleteProduct(Long id) {
        Product product = getProductEntityById(id);
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "brands")
    public List<String> getAllBrands() {
        return productRepository.findDistinctBrands();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getLowStockProducts(int threshold) {
        return productRepository.findByStockLessThan(threshold).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProductDto mapToDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setBrand(p.getBrand());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setDiscountPercentage(p.getDiscountPercentage());
        dto.setDiscountedPrice(p.getDiscountedPrice());
        dto.setStock(p.getStock());
        dto.setAvailableStock(p.getAvailableStock());
        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getId());
            dto.setCategoryName(p.getCategory().getName());
        }
        dto.setImageUrl(p.getImageUrl());
        dto.setAdditionalImages(p.getAdditionalImages());
        dto.setSpecifications(p.getSpecifications());
        dto.setVariants(p.getVariants());
        dto.setRating(p.getRating());
        dto.setReviewCount(p.getReviewCount());
        dto.setActive(p.isActive());
        return dto;
    }

    private void mapDtoToEntity(ProductDto dto, Product p) {
        p.setTitle(dto.getTitle());
        p.setBrand(dto.getBrand());
        p.setDescription(dto.getDescription());
        p.setPrice(dto.getPrice());
        p.setDiscountPercentage(dto.getDiscountPercentage() != null ? dto.getDiscountPercentage() : 0.0);
        p.setStock(dto.getStock() != null ? dto.getStock() : 0);
        p.setImageUrl(dto.getImageUrl());
        p.setAdditionalImages(dto.getAdditionalImages());
        p.setSpecifications(dto.getSpecifications());
        p.setVariants(dto.getVariants());
        p.setActive(dto.isActive());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
            p.setCategory(category);
        }
    }
}
