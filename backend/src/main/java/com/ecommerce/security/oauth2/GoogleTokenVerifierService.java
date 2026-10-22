package com.ecommerce.security.oauth2;

public interface GoogleTokenVerifierService {
    GoogleUserInfo verifyToken(String idTokenString);
}
