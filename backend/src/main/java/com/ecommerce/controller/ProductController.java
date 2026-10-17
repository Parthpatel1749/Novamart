package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.ProductDto;
import com.ecommerce.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String sortBy) {

        List<ProductDto> products = productService.getProducts(query, categoryId, minPrice, maxPrice, minRating, brand, sortBy);
        return ResponseEntity.ok(ApiResponse.ok("Products fetched successfully", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Long id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok("Product details retrieved", product));
    }

    @GetMapping("/brands")
    public ResponseEntity<ApiResponse<List<String>>> getBrands() {
        return ResponseEntity.ok(ApiResponse.ok("Brands retrieved", productService.getAllBrands()));
    }
}
