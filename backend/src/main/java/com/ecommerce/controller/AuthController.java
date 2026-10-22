package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.entity.User;
import com.ecommerce.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.googleLoginOrRegister(request);
        String message = response.isLinkingRequired()
                ? "Existing account found. Verification required to link your Google account."
                : "Google authentication successful";
        return ResponseEntity.ok(ApiResponse.ok(message, response));
    }

    @PostMapping("/google/link")
    public ResponseEntity<ApiResponse<AuthResponse>> linkGoogle(@Valid @RequestBody GoogleLinkRequest request) {
        AuthResponse response = authService.linkGoogleAccount(request);
        return ResponseEntity.ok(ApiResponse.ok("Google account linked successfully", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> body) {
        String token = authService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(ApiResponse.ok("Password reset link generated", token));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved", user));
    }

    @PostMapping("/google/unlink")
    public ResponseEntity<ApiResponse<String>> unlinkGoogle() {
        authService.unlinkGoogleAccount();
        return ResponseEntity.ok(ApiResponse.ok("Google account disconnected successfully"));
    }
}
