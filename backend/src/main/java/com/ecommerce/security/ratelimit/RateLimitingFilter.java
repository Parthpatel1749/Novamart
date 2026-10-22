package com.ecommerce.security.ratelimit;

import com.ecommerce.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Spring Web filter intercepting incoming HTTP requests and enforcing
 * Token Bucket rate limits per IP address and endpoint sensitivity.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;

    public RateLimitingFilter(RateLimiterService rateLimiterService, ObjectMapper objectMapper) {
        this.rateLimiterService = rateLimiterService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Skip non-API routes, pre-flight CORS OPTIONS requests, and internal dev tools
        if (shouldSkipRateLimiting(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        RateLimiterService.PolicyTier tier = resolvePolicyTier(request);

        RateLimiterService.RateLimitResult result = rateLimiterService.checkRateLimit(clientIp, tier);

        // Populate standard rate limiting headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(result.getLimit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemaining()));

        if (result.isAllowed()) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(result.getRetryAfterSeconds()));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            String message = String.format("Too many requests. Rate limit exceeded for %s. Please wait %d seconds before retrying.",
                    tier.name().toLowerCase(), result.getRetryAfterSeconds());

            ApiResponse<Void> errorResponse = ApiResponse.error(message);
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        }
    }

    private boolean shouldSkipRateLimiting(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        if (path == null || !path.startsWith("/api/")) {
            return true;
        }
        return path.startsWith("/h2-console") || path.startsWith("/error");
    }

    private RateLimiterService.PolicyTier resolvePolicyTier(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path == null) {
            return RateLimiterService.PolicyTier.GENERAL;
        }

        // Tier 1: Authentication & Sensitive Credentials
        if (path.startsWith("/api/auth/login") ||
            path.startsWith("/api/auth/register") ||
            path.startsWith("/api/auth/google") ||
            path.startsWith("/api/auth/forgot-password") ||
            path.startsWith("/api/auth/reset-password") ||
            path.startsWith("/api/delivery-partners/login") ||
            path.startsWith("/api/delivery-partners/register")) {
            return RateLimiterService.PolicyTier.AUTH;
        }

        // Tier 2: Delivery OTP Verification
        if (path.endsWith("/deliver") || path.endsWith("/verify-otp")) {
            return RateLimiterService.PolicyTier.OTP;
        }

        // Tier 3: General API Operations
        return RateLimiterService.PolicyTier.GENERAL;
    }

    private String extractClientIp(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "X-Real-IP"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (StringUtils.hasText(ip) && !"unknown".equalsIgnoreCase(ip)) {
                // If there are multiple IPs in X-Forwarded-For (client, proxy1, proxy2), take the first one
                if (ip.contains(",")) {
                    return ip.split(",")[0].trim();
                }
                return ip.trim();
            }
        }

        return request.getRemoteAddr();
    }
}
