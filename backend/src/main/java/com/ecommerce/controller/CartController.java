package com.ecommerce.controller;

import com.ecommerce.dto.AddToCartRequest;
import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.CartDto;
import com.ecommerce.entity.User;
import com.ecommerce.service.AuthService;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    public CartController(CartService cartService, AuthService authService) {
        this.cartService = cartService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart() {
        User user = authService.getCurrentAuthenticatedUser();
        CartDto cart = cartService.getUserCart(user);
        return ResponseEntity.ok(ApiResponse.ok("Cart retrieved", cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addItem(@Valid @RequestBody AddToCartRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        CartDto cart = cartService.addItemToCart(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", cart));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartDto>> updateQuantity(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        User user = authService.getCurrentAuthenticatedUser();
        int quantity = body.getOrDefault("quantity", 1);
        CartDto cart = cartService.updateItemQuantity(user, id, quantity);
        return ResponseEntity.ok(ApiResponse.ok("Cart item updated", cart));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        CartDto cart = cartService.removeItemFromCart(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", cart));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearCart() {
        User user = authService.getCurrentAuthenticatedUser();
        cartService.clearCart(user);
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared"));
    }
}
