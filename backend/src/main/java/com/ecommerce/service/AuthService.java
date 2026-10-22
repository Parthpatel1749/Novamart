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

import com.ecommerce.dto.GoogleAuthRequest;
import com.ecommerce.dto.GoogleLinkRequest;
import com.ecommerce.security.oauth2.GoogleTokenVerifierService;
import com.ecommerce.security.oauth2.GoogleUserInfo;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final GoogleTokenVerifierService googleTokenVerifierService;
    private final java.util.Set<String> usedResetTokens = java.util.concurrent.ConcurrentHashMap.newKeySet();

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       DeliveryPartnerRepository deliveryPartnerRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       GoogleTokenVerifierService googleTokenVerifierService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.googleTokenVerifierService = googleTokenVerifierService;
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildAuthResponse(user, token);
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

        return buildAuthResponse(savedUser, token);
    }

    @Transactional
    public AuthResponse googleLoginOrRegister(GoogleAuthRequest request) {
        GoogleUserInfo googleUser = googleTokenVerifierService.verifyToken(request.getIdToken());
        if (!googleUser.isEmailVerified()) {
            throw new BadRequestException("Google account email is not verified. Please verify your email with Google.");
        }

        // 1. Check if identity is already linked by Google Subject ID
        Optional<User> userByGoogleId = userRepository.findByGoogleId(googleUser.getSub());
        if (userByGoogleId.isPresent()) {
            User user = userByGoogleId.get();
            if (!user.isActive()) {
                throw new BadRequestException("Account has been deactivated. Please contact customer support.");
            }

            // Sync avatar or verified status if missing
            boolean updated = false;
            if (StringUtils.hasText(googleUser.getPictureUrl()) && !StringUtils.hasText(user.getPictureUrl())) {
                user.setPictureUrl(googleUser.getPictureUrl());
                updated = true;
            }
            if (user.getEmailVerified() == null || !user.getEmailVerified()) {
                user.setEmailVerified(true);
                updated = true;
            }
            if (updated) {
                userRepository.save(user);
            }

            String token = tokenProvider.generateTokenFromEmail(user.getEmail(), user.getRole().name());
            return buildAuthResponse(user, token);
        }

        // 2. Check if an account already exists with the same email
        Optional<User> userByEmail = userRepository.findByEmail(googleUser.getEmail());
        if (userByEmail.isPresent()) {
            User existingUser = userByEmail.get();
            // Secure account linking required: do not silently merge
            return AuthResponse.requireLinking(
                    existingUser.getEmail(),
                    existingUser.getFullName(),
                    googleUser.getPictureUrl()
            );
        }

        // 3. New user registration via Google (Strictly safe default role: ROLE_CUSTOMER)
        User newUser = new User();
        newUser.setEmail(googleUser.getEmail());
        newUser.setFullName(StringUtils.hasText(googleUser.getFullName())
                ? googleUser.getFullName()
                : googleUser.getEmail().split("@")[0]);
        // Set secure unguessable random password to prevent null password issues in Spring Security
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        newUser.setRole(Role.ROLE_CUSTOMER);
        newUser.setActive(true);
        newUser.setGoogleId(googleUser.getSub());
        newUser.setPictureUrl(googleUser.getPictureUrl());
        newUser.setEmailVerified(true);
        newUser.setAuthProvider("GOOGLE");
        newUser.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(newUser);
        String token = tokenProvider.generateTokenFromEmail(savedUser.getEmail(), savedUser.getRole().name());
        return buildAuthResponse(savedUser, token);
    }

    @Transactional
    public AuthResponse linkGoogleAccount(GoogleLinkRequest request) {
        GoogleUserInfo googleUser = googleTokenVerifierService.verifyToken(request.getIdToken());
        if (!googleUser.isEmailVerified()) {
            throw new BadRequestException("Google account email is not verified. Please verify your email with Google.");
        }

        User user = userRepository.findByEmail(googleUser.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + googleUser.getEmail()));

        // Validate password of existing account
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid password for existing account");
        }

        // Validate not already linked to another Google ID
        if (StringUtils.hasText(user.getGoogleId()) && !user.getGoogleId().equals(googleUser.getSub())) {
            throw new BadRequestException("This account is already linked to a different Google account");
        }

        // Ensure no other user is linked to this Google ID
        Optional<User> otherUser = userRepository.findByGoogleId(googleUser.getSub());
        if (otherUser.isPresent() && !otherUser.get().getId().equals(user.getId())) {
            throw new BadRequestException("This Google account is already linked to another NovaMart user");
        }

        user.setGoogleId(googleUser.getSub());
        if (StringUtils.hasText(googleUser.getPictureUrl())) {
            user.setPictureUrl(googleUser.getPictureUrl());
        }
        user.setEmailVerified(true);
        user.setAuthProvider("LOCAL_AND_GOOGLE");

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateTokenFromEmail(savedUser.getEmail(), savedUser.getRole().name());
        return buildAuthResponse(savedUser, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole()
        );
        response.setPictureUrl(user.getPictureUrl());
        response.setAuthProvider(user.getAuthProvider());

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
        if ("GOOGLE".equals(user.getAuthProvider())) {
            user.setAuthProvider("LOCAL_AND_GOOGLE");
        }
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

    @Transactional
    public void unlinkGoogleAccount() {
        User user = getCurrentAuthenticatedUser();
        if (!StringUtils.hasText(user.getGoogleId())) {
            throw new BadRequestException("No Google account is currently linked to your profile");
        }
        if ("GOOGLE".equals(user.getAuthProvider())) {
            throw new BadRequestException("Please set a local account password before disconnecting Google sign-in");
        }
        user.setGoogleId(null);
        user.setAuthProvider("LOCAL");
        userRepository.save(user);
    }
}
