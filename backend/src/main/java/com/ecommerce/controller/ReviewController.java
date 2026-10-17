package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.ReviewDto;
import com.ecommerce.entity.User;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;
    private final AuthService authService;

    public ReviewController(ReviewService reviewService, AuthService authService) {
        this.reviewService = reviewService;
        this.authService = authService;
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok("Reviews retrieved", reviewService.getProductReviews(productId)));
    }

    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<ReviewDto>> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewDto dto) {
        User user = authService.getCurrentAuthenticatedUser();
        ReviewDto created = reviewService.addReview(user, productId, dto);
        return ResponseEntity.ok(ApiResponse.ok("Review added successfully", created));
    }

    @GetMapping("/admin/reviews")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getAllReviewsAdmin() {
        return ResponseEntity.ok(ApiResponse.ok("All reviews retrieved", reviewService.getAllReviewsAdmin()));
    }

    @DeleteMapping("/admin/reviews/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.ok("Review deleted successfully"));
    }
}
