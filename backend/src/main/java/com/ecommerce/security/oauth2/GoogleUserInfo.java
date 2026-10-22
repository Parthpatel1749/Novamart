package com.ecommerce.security.oauth2;

public class GoogleUserInfo {
    private final String sub;
    private final String email;
    private final boolean emailVerified;
    private final String fullName;
    private final String pictureUrl;

    public GoogleUserInfo(String sub, String email, boolean emailVerified, String fullName, String pictureUrl) {
        this.sub = sub;
        this.email = email;
        this.emailVerified = emailVerified;
        this.fullName = fullName;
        this.pictureUrl = pictureUrl;
    }

    public String getSub() { return sub; }
    public String getEmail() { return email; }
    public boolean isEmailVerified() { return emailVerified; }
    public String getFullName() { return fullName; }
    public String getPictureUrl() { return pictureUrl; }
}
