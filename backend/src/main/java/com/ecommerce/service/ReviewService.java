package com.ecommerce.service;

import com.ecommerce.dto.ReviewDto;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.Review;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    public List<ReviewDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ReviewDto> getAllReviewsAdmin() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto addReview(User user, Long productId, ReviewDto dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Review review = new Review(product, user, dto.getRating(), dto.getTitle(), dto.getComment());
        Review saved = reviewRepository.save(review);

        // Recalculate product rating
        List<Review> allReviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        double avg = allReviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
        product.setRating(Math.round(avg * 10.0) / 10.0);
        product.setReviewCount(allReviews.size());
        productRepository.save(product);

        return mapToDto(saved);
    }

    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        Product product = review.getProduct();
        reviewRepository.delete(review);

        // Recalculate
        List<Review> remaining = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        double avg = remaining.isEmpty() ? 5.0 : remaining.stream().mapToInt(Review::getRating).average().orElse(5.0);
        product.setRating(Math.round(avg * 10.0) / 10.0);
        product.setReviewCount(remaining.size());
        productRepository.save(product);
    }

    public ReviewDto mapToDto(Review r) {
        ReviewDto dto = new ReviewDto();
        dto.setId(r.getId());
        dto.setProductId(r.getProduct().getId());
        dto.setProductTitle(r.getProduct().getTitle());
        dto.setUserId(r.getUser().getId());
        dto.setUserName(r.getUser().getFullName());
        dto.setRating(r.getRating());
        dto.setTitle(r.getTitle());
        dto.setComment(r.getComment());
        dto.setVerifiedPurchase(r.isVerifiedPurchase());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
