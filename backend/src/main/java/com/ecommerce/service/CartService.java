package com.ecommerce.service;

import com.ecommerce.dto.AddToCartRequest;
import com.ecommerce.dto.CartDto;
import com.ecommerce.dto.CartItemDto;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(new Cart(user)));
    }

    public CartDto getUserCart(User user) {
        Cart cart = getOrCreateCart(user);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto addItemToCart(User user, AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (product.getAvailableStock() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + product.getAvailableStock() + ")");
        }

        Cart cart = getOrCreateCart(user);

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (product.getAvailableStock() < newQty) {
                throw new BadRequestException("Cannot add more. Total in cart would exceed stock.");
            }
            item.setQuantity(newQty);
            item.setUnitPrice(product.getDiscountedPrice());
            if (request.getSelectedVariant() != null) {
                item.setSelectedVariant(request.getSelectedVariant());
            }
        } else {
            CartItem newItem = new CartItem(cart, product, request.getQuantity(), product.getDiscountedPrice(), request.getSelectedVariant());
            cart.getItems().add(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        Cart saved = cartRepository.save(cart);
        return mapToDto(saved);
    }

    @Transactional
    public CartDto updateItemQuantity(User user, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to this cart");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            if (item.getProduct().getAvailableStock() < quantity) {
                throw new BadRequestException("Requested quantity exceeds available stock");
            }
            item.setQuantity(quantity);
            item.setUnitPrice(item.getProduct().getDiscountedPrice());
            cartItemRepository.save(item);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return mapToDto(cartRepository.save(cart));
    }

    @Transactional
    public CartDto removeItemFromCart(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to this cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        cart.setUpdatedAt(LocalDateTime.now());
        return mapToDto(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public CartDto mapToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());

        List<CartItemDto> itemDtos = new ArrayList<>();
        int totalQty = 0;
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            CartItemDto itemDto = new CartItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductTitle(item.getProduct().getTitle());
            itemDto.setProductBrand(item.getProduct().getBrand());
            itemDto.setProductImageUrl(item.getProduct().getImageUrl());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setUnitPrice(item.getUnitPrice());
            itemDto.setSubtotal(item.getSubtotal());
            itemDto.setSelectedVariant(item.getSelectedVariant());
            itemDto.setAvailableStock(item.getProduct().getAvailableStock());

            itemDtos.add(itemDto);
            totalQty += item.getQuantity();
            subtotal = subtotal.add(item.getSubtotal());
        }

        dto.setItems(itemDtos);
        dto.setTotalItems(totalQty);
        dto.setSubtotal(subtotal);

        // Free delivery on orders over ₹499, else ₹40
        BigDecimal delivery = subtotal.compareTo(new BigDecimal("499")) >= 0 || subtotal.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO : new BigDecimal("40.00");
        dto.setEstimatedDelivery(delivery);
        dto.setGrandTotal(subtotal.add(delivery));

        return dto;
    }
}
