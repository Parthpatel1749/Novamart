package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleLinkRequest {

    @NotBlank(message = "Google ID token is required")
    private String idToken;

    @NotBlank(message = "Password is required to link an existing account")
    private String password;

    public GoogleLinkRequest() {}

    public GoogleLinkRequest(String idToken, String password) {
        this.idToken = idToken;
        this.password = password;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
