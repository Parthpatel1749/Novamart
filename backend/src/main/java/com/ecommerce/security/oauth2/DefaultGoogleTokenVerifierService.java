package com.ecommerce.security.oauth2;

import com.ecommerce.exception.BadRequestException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collections;

@Service
public class DefaultGoogleTokenVerifierService implements GoogleTokenVerifierService {

    private static final Logger log = LoggerFactory.getLogger(DefaultGoogleTokenVerifierService.class);

    private final String configuredClientId;
    private final GoogleIdTokenVerifier verifier;

    @Autowired
    public DefaultGoogleTokenVerifierService(@Value("${app.google.client-id:}") String configuredClientId) {
        this.configuredClientId = configuredClientId != null ? configuredClientId.trim() : "";

        GoogleIdTokenVerifier.Builder builder = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        );

        if (StringUtils.hasText(this.configuredClientId)) {
            builder.setAudience(Collections.singletonList(this.configuredClientId));
        }

        builder.setIssuers(Arrays.asList("accounts.google.com", "https://accounts.google.com"));
        this.verifier = builder.build();
    }

    // Constructor for testing with custom verifier
    public DefaultGoogleTokenVerifierService(String configuredClientId, GoogleIdTokenVerifier verifier) {
        this.configuredClientId = configuredClientId != null ? configuredClientId.trim() : "";
        this.verifier = verifier;
    }

    @Override
    public GoogleUserInfo verifyToken(String idTokenString) {
        if (!StringUtils.hasText(idTokenString)) {
            throw new BadRequestException("Google ID token cannot be empty");
        }

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString.trim());
            if (idToken == null) {
                log.warn("Google ID token verification failed (token is invalid or expired)");
                throw new BadRequestException("Invalid or expired Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            // Validate audience
            if (StringUtils.hasText(configuredClientId)) {
                Object aud = payload.getAudience();
                boolean audienceMatches = false;
                if (aud instanceof String && configuredClientId.equals(aud)) {
                    audienceMatches = true;
                } else if (aud instanceof Iterable<?>) {
                    for (Object a : (Iterable<?>) aud) {
                        if (configuredClientId.equals(a)) {
                            audienceMatches = true;
                            break;
                        }
                    }
                }
                if (!audienceMatches) {
                    log.warn("Google ID token audience mismatch");
                    throw new BadRequestException("Google token was not issued for this application");
                }
            }

            String sub = payload.getSubject();
            if (!StringUtils.hasText(sub)) {
                throw new BadRequestException("Google token missing subject identifier");
            }

            String email = payload.getEmail();
            if (!StringUtils.hasText(email)) {
                throw new BadRequestException("Google token missing email claim");
            }

            Boolean emailVerified = payload.getEmailVerified();
            if (emailVerified == null || !emailVerified) {
                throw new BadRequestException("Google account email is not verified by Google");
            }

            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            return new GoogleUserInfo(
                    sub,
                    email.toLowerCase().trim(),
                    emailVerified,
                    name != null ? name.trim() : "",
                    pictureUrl != null ? pictureUrl.trim() : ""
            );
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Exception during Google ID token verification: {}", e.getMessage());
            throw new BadRequestException("Failed to verify Google ID token: " + e.getMessage());
        }
    }
}
