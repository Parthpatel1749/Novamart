package com.ecommerce.security;

import com.ecommerce.dto.GoogleAuthRequest;
import com.ecommerce.dto.GoogleLinkRequest;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.oauth2.GoogleTokenVerifierService;
import com.ecommerce.security.oauth2.GoogleUserInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class GoogleAuthTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private GoogleTokenVerifierService googleTokenVerifierService;

    private static final AtomicInteger ipCounter = new AtomicInteger(10);

    private String getNextTestIp() {
        return "192.168.100." + ipCounter.getAndIncrement();
    }

    @BeforeEach
    void setUp() {
        // Clean up test-specific users if they exist
        userRepository.findByEmail("newgoogleuser@example.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("returninggoogle@example.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("existinglocal@example.com").ifPresent(userRepository::delete);
        userRepository.findByGoogleId("google-sub-returning-123").ifPresent(userRepository::delete);
        userRepository.findByGoogleId("google-sub-new-123").ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("G-01: Successful Google authentication registers a new user with default ROLE_CUSTOMER")
    void testNewGoogleUserRegistration() throws Exception {
        GoogleUserInfo mockGoogleUser = new GoogleUserInfo(
                "google-sub-new-123",
                "newgoogleuser@example.com",
                true,
                "New Google User",
                "https://lh3.googleusercontent.com/test-pic.jpg"
        );
        when(googleTokenVerifierService.verifyToken("valid-id-token-new")).thenReturn(mockGoogleUser);

        GoogleAuthRequest request = new GoogleAuthRequest("valid-id-token-new");

        mockMvc.perform(post("/api/auth/google")
                .with(req -> { req.setRemoteAddr(getNextTestIp()); return req; })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value("newgoogleuser@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("New Google User"))
                .andExpect(jsonPath("$.data.role").value("ROLE_CUSTOMER"))
                .andExpect(jsonPath("$.data.authProvider").value("GOOGLE"))
                .andExpect(jsonPath("$.data.pictureUrl").value("https://lh3.googleusercontent.com/test-pic.jpg"));

        // Verify database persistence
        Optional<User> savedUserOpt = userRepository.findByEmail("newgoogleuser@example.com");
        assertTrue(savedUserOpt.isPresent(), "User should be persisted in database");
        User savedUser = savedUserOpt.get();
        assertEquals("google-sub-new-123", savedUser.getGoogleId());
        assertEquals(Role.ROLE_CUSTOMER, savedUser.getRole(), "Must strictly have ROLE_CUSTOMER, never ROLE_ADMIN");
        assertEquals("GOOGLE", savedUser.getAuthProvider());
        assertTrue(Boolean.TRUE.equals(savedUser.getEmailVerified()));
        assertNotNull(savedUser.getPassword(), "A non-null secure password hash should be set to prevent authentication bypass");
    }

    @Test
    @DisplayName("G-02: Invalid or expired Google token is rejected with 400 Bad Request")
    void testInvalidTokenRejection() throws Exception {
        when(googleTokenVerifierService.verifyToken("invalid-or-expired-token"))
                .thenThrow(new BadRequestException("Google ID token verification failed: Token is expired"));

        GoogleAuthRequest request = new GoogleAuthRequest("invalid-or-expired-token");

        mockMvc.perform(post("/api/auth/google")
                .with(req -> { req.setRemoteAddr(getNextTestIp()); return req; })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Google ID token verification failed: Token is expired"));
    }

    @Test
    @DisplayName("G-03: Security verification failure (signature / audience mismatch) is rejected with 400")
    void testSecurityVerificationFailureRejection() throws Exception {
        when(googleTokenVerifierService.verifyToken("tampered-token"))
                .thenThrow(new BadRequestException("Invalid Google token signature or security parameters"));

        GoogleAuthRequest request = new GoogleAuthRequest("tampered-token");

        mockMvc.perform(post("/api/auth/google")
                .with(req -> { req.setRemoteAddr(getNextTestIp()); return req; })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid Google token signature or security parameters"));
    }

    @Test
    @DisplayName("G-04: Token with unverified email is rejected with 400 Bad Request")
    void testUnverifiedEmailRejection() throws Exception {
        GoogleUserInfo unverifiedUser = new GoogleUserInfo(
                "google-sub-unverified",
                "unverified@example.com",
                false, // unverified!
                "Unverified User",
                null
        );
        when(googleTokenVerifierService.verifyToken("unverified-email-token")).thenReturn(unverifiedUser);

        GoogleAuthRequest request = new GoogleAuthRequest("unverified-email-token");

        mockMvc.perform(post("/api/auth/google")
                .with(req -> { req.setRemoteAddr(getNextTestIp()); return req; })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Google account email is not verified. Please verify your email with Google."));
    }

    @Test
    @DisplayName("G-05: Returning linked Google user authenticates and logs in successfully")
    void testReturningGoogleUserLogin() throws Exception {
        // Pre-create existing linked user
        User returningUser = new User();
        returningUser.setFullName("Returning User");
        returningUser.setEmail("returninggoogle@example.com");
        returningUser.setPassword(passwordEncoder.encode("ExistingSecPass123"));
        returningUser.setRole(Role.ROLE_CUSTOMER);
        returningUser.setAuthProvider("GOOGLE");
        returningUser.setGoogleId("google-sub-returning-123");
        returningUser.setEmailVerified(true);
        returningUser.setPictureUrl("https://lh3.googleusercontent.com/avatar-old.jpg");
        userRepository.save(returningUser);

        GoogleUserInfo returningInfo = new GoogleUserInfo(
                "google-sub-returning-123",
                "returninggoogle@example.com",
                true,
                "Returning User",
                "https://lh3.googleusercontent.com/avatar-new.jpg"
        );
        when(googleTokenVerifierService.verifyToken("returning-token")).thenReturn(returningInfo);

        GoogleAuthRequest request = new GoogleAuthRequest("returning-token");

        mockMvc.perform(post("/api/auth/google")
                .with(req -> { req.setRemoteAddr(getNextTestIp()); return req; })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value("returninggoogle@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("Returning User"));

        // Verify existing profile name is preserved in database
        User updated = userRepository.findByEmail("returninggoogle@example.com").orElseThrow();
        assertEquals("Returning User", updated.getFullName());
    }

    @Test
    @DisplayName("G-06: Existing email/password account requires explicit password verification to link (Non-silent linking)")
    void testAccountLinkingRequiredForExistingLocalAccount() throws Exception {
        // Pre-create an email/password account
        User localUser = new User();
        localUser.setFullName("Local Account Holder");
        localUser.setEmail("existinglocal@example.com");
        localUser.setPassword(passwordEncoder.encode("LocalSecret123!"));
        localUser.setRole(Role.ROLE_CUSTOMER);
        localUser.setAuthProvider("LOCAL");
        localUser.setEmailVerified(true);
        userRepository.save(localUser);

        // Google login attempt with the same email
        GoogleUserInfo googleMatch = new GoogleUserInfo(
                "google-sub-local-match",
                "existinglocal@example.com",
                true,
                "Local Account Holder",
                "https://lh3.googleusercontent.com/photo.jpg"
        );
        when(googleTokenVerifierService.verifyToken("token-for-local-match")).thenReturn(googleMatch);

        GoogleAuthRequest request = new GoogleAuthRequest("token-for-local-match");

        mockMvc.perform(post("/api/auth/google")
                .with(req -> { req.setRemoteAddr(getNextTestIp()); return req; })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.linkingRequired").value(true))
                .andExpect(jsonPath("$.data.existingEmail").value("existinglocal@example.com"))
                .andExpect(jsonPath("$.data.token").doesNotExist()); // No JWT should be issued without password verification!

        // Confirm user in DB still has LOCAL provider and no Google ID
        User unmodified = userRepository.findByEmail("existinglocal@example.com").orElseThrow();
        assertNull(unmodified.getGoogleId(), "Google ID must not be linked silently");
        assertEquals("LOCAL", unmodified.getAuthProvider());
    }

    @Test
    @DisplayName("G-07: Linking Google account succeeds when correct existing password is provided")
    void testLinkGoogleAccountSuccess() throws Exception {
        User localUser = new User();
        localUser.setFullName("Linking Tester");
        localUser.setEmail("existinglocal@example.com");
        localUser.setPassword(passwordEncoder.encode("CorrectPassword123!"));
        localUser.setRole(Role.ROLE_CUSTOMER);
        localUser.setAuthProvider("LOCAL");
        userRepository.save(localUser);

        GoogleUserInfo googleInfo = new GoogleUserInfo(
                "google-sub-linked-777",
                "existinglocal@example.com",
                true,
                "Linking Tester",
                "https://lh3.googleusercontent.com/newlink.jpg"
        );
        when(googleTokenVerifierService.verifyToken("valid-link-token")).thenReturn(googleInfo);

        GoogleLinkRequest linkRequest = new GoogleLinkRequest("valid-link-token", "CorrectPassword123!");

        mockMvc.perform(post("/api/auth/google/link")
                .with(req -> { req.setRemoteAddr(getNextTestIp()); return req; })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(linkRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value("existinglocal@example.com"))
                .andExpect(jsonPath("$.data.authProvider").value("LOCAL_AND_GOOGLE"));

        // Confirm database state
        User linkedUser = userRepository.findByEmail("existinglocal@example.com").orElseThrow();
        assertEquals("google-sub-linked-777", linkedUser.getGoogleId());
        assertEquals("LOCAL_AND_GOOGLE", linkedUser.getAuthProvider());
        assertEquals("https://lh3.googleusercontent.com/newlink.jpg", linkedUser.getPictureUrl());
    }

    @Test
    @DisplayName("G-08: Linking Google account fails when incorrect password is provided")
    void testLinkGoogleAccountWrongPasswordFails() throws Exception {
        User localUser = new User();
        localUser.setFullName("Linking Tester 2");
        localUser.setEmail("existinglocal@example.com");
        localUser.setPassword(passwordEncoder.encode("CorrectPassword123!"));
        localUser.setRole(Role.ROLE_CUSTOMER);
        localUser.setAuthProvider("LOCAL");
        userRepository.save(localUser);

        GoogleUserInfo googleInfo = new GoogleUserInfo(
                "google-sub-linked-888",
                "existinglocal@example.com",
                true,
                "Linking Tester 2",
                null
        );
        when(googleTokenVerifierService.verifyToken("link-token-wrong-pw")).thenReturn(googleInfo);

        GoogleLinkRequest linkRequest = new GoogleLinkRequest("link-token-wrong-pw", "WrongPassword999!");

        mockMvc.perform(post("/api/auth/google/link")
                .with(req -> { req.setRemoteAddr(getNextTestIp()); return req; })
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(linkRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid password for existing account"));

        // Verify account remained unlinked
        User unchangedUser = userRepository.findByEmail("existinglocal@example.com").orElseThrow();
        assertNull(unchangedUser.getGoogleId());
    }

    @Test
    @DisplayName("G-09: Unlinking Google account requires valid authentication (401 Unauthorized)")
    void testUnlinkRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/auth/google/unlink")
                .with(req -> { req.setRemoteAddr(getNextTestIp()); return req; }))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("G-10: Authenticated user can unlink Google account")
    void testAuthenticatedUserCanUnlinkGoogleAccount() throws Exception {
        User user = new User();
        user.setFullName("Unlink Candidate");
        user.setEmail("existinglocal@example.com");
        user.setPassword(passwordEncoder.encode("SafePassword123!"));
        user.setRole(Role.ROLE_CUSTOMER);
        user.setAuthProvider("LOCAL_AND_GOOGLE");
        user.setGoogleId("google-to-unlink-999");
        userRepository.save(user);

        String jwt = jwtTokenProvider.generateTokenFromEmail(user.getEmail(), user.getRole().name());

        mockMvc.perform(post("/api/auth/google/unlink")
                .with(req -> { req.setRemoteAddr(getNextTestIp()); return req; })
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        User unlinkedUser = userRepository.findByEmail("existinglocal@example.com").orElseThrow();
        assertNull(unlinkedUser.getGoogleId(), "Google ID should be cleared");
        assertEquals("LOCAL", unlinkedUser.getAuthProvider(), "Provider should revert to LOCAL");
    }

    @Test
    @DisplayName("G-11: Rate limiting protects /api/auth/google endpoint from brute-force/DOS (429 Too Many Requests)")
    void testGoogleAuthRateLimiting() throws Exception {
        String rateLimitTestIp = "192.168.200.99";
        when(googleTokenVerifierService.verifyToken("rate-test-token"))
                .thenThrow(new BadRequestException("Token invalid"));

        GoogleAuthRequest request = new GoogleAuthRequest("rate-test-token");
        String jsonBody = objectMapper.writeValueAsString(request);

        // Exhaust the 5 burst tokens allowed in the AUTH tier
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/google")
                    .with(req -> { req.setRemoteAddr(rateLimitTestIp); return req; })
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonBody));
        }

        // 6th request from same IP must be rejected with 429 Too Many Requests
        mockMvc.perform(post("/api/auth/google")
                .with(req -> { req.setRemoteAddr(rateLimitTestIp); return req; })
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonBody))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.message").value(containsString("Rate limit exceeded for auth")));
    }
}
