package com.ecommerce.service;

import com.ecommerce.dto.AuthRequest;
import com.ecommerce.dto.AuthResponse;
import com.ecommerce.dto.PasswordResetRequest;
import com.ecommerce.dto.RegisterRequest;
import com.ecommerce.entity.DeliveryPartner;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.DeliveryPartnerRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final java.util.Set<String> usedResetTokens = java.util.concurrent.ConcurrentHashMap.newKeySet();

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       DeliveryPartnerRepository deliveryPartnerRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole()
        );

        if (user.getRole() == Role.ROLE_DELIVERY_PARTNER) {
            Optional<DeliveryPartner> partnerOpt = deliveryPartnerRepository.findByUserId(user.getId());
            if (partnerOpt.isPresent()) {
                DeliveryPartner dp = partnerOpt.get();
                response.setDeliveryPartnerId(dp.getId());
                response.setDeliveryPartnerStatus(dp.getStatus().name());
            }
        }

        return response;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists");
        }

        Role role = Role.ROLE_CUSTOMER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("ROLE_DELIVERY_PARTNER")) {
            role = Role.ROLE_DELIVERY_PARTNER;
        }

        User user = new User(
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhone(),
                role
        );

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateTokenFromEmail(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getPhone(),
                savedUser.getRole()
        );
    }

    public String forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return tokenProvider.generatePasswordResetToken(user.getEmail());
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new BadRequestException("New password is required");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName());

        if (isAuthenticated) {
            String currentUserEmail = auth.getName();
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

            // A non-admin user can ONLY change their own password
            if (!isAdmin && !currentUserEmail.equalsIgnoreCase(user.getEmail())) {
                throw new BadRequestException("You are not authorized to reset the password for another user");
            }

            // Non-admin user must provide and verify their current (old) password
            if (!isAdmin) {
                if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                    throw new BadRequestException("Current password is required to change password");
                }
                if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                    throw new BadRequestException("Current password does not match");
                }
            }
        } else {
            // Unauthenticated callers MUST provide a valid, cryptographically signed, unexpired reset token
            if (request.getResetToken() == null || request.getResetToken().isBlank()) {
                throw new BadRequestException("Authentication or valid password reset token is required");
            }
            if (!tokenProvider.validatePasswordResetToken(request.getResetToken(), user.getEmail())) {
                throw new BadRequestException("Invalid or expired password reset token");
            }
            if (usedResetTokens.contains(request.getResetToken())) {
                throw new BadRequestException("Password reset token has already been used");
            }
            usedResetTokens.add(request.getResetToken());
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new BadRequestException("User is not authenticated");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
