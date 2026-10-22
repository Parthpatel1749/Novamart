package com.ecommerce.security.ratelimit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Service managing Token Bucket rate limits per client IP and endpoint tier.
 * Tuned for high concurrency and configurable for load tests and production.
 */
@Service
public class RateLimiterService {

    public enum PolicyTier {
        AUTH,
        OTP,
        GENERAL
    }

    public static class RateLimitResult {
        private final boolean allowed;
        private final long limit;
        private final long remaining;
        private final long retryAfterSeconds;

        public RateLimitResult(boolean allowed, long limit, long remaining, long retryAfterSeconds) {
            this.allowed = allowed;
            this.limit = limit;
            this.remaining = remaining;
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public boolean isAllowed() { return allowed; }
        public long getLimit() { return limit; }
        public long getRemaining() { return remaining; }
        public long getRetryAfterSeconds() { return retryAfterSeconds; }
    }

    private final boolean rateLimitingEnabled;
    private final long generalCapacity;
    private final double generalRefillRate;
    private final long authCapacity;
    private final double authRefillRate;
    private final long otpCapacity;
    private final double otpRefillRate;

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    public RateLimiterService(
            @Value("${app.rate-limiting.enabled:true}") boolean rateLimitingEnabled,
            @Value("${app.rate-limiting.general-capacity:300}") long generalCapacity,
            @Value("${app.rate-limiting.general-refill-rate:50.0}") double generalRefillRate,
            @Value("${app.rate-limiting.auth-capacity:5}") long authCapacity,
            @Value("${app.rate-limiting.auth-refill-rate:0.0833}") double authRefillRate) {
        this.rateLimitingEnabled = rateLimitingEnabled;
        this.generalCapacity = generalCapacity;
        this.generalRefillRate = generalRefillRate;
        this.authCapacity = authCapacity;
        this.authRefillRate = authRefillRate;
        this.otpCapacity = 10;
        this.otpRefillRate = 0.2;
    }

    /**
     * Resolves or creates a bucket for the given client key and policy tier, then attempts to consume a token.
     */
    public RateLimitResult checkRateLimit(String clientIp, PolicyTier tier) {
        if (!rateLimitingEnabled) {
            return new RateLimitResult(true, 1000000, 1000000, 0);
        }

        long capacity = resolveCapacity(tier);
        double refillRate = resolveRefillRate(tier);

        String bucketKey = clientIp + ":" + tier.name();

        TokenBucket bucket = buckets.computeIfAbsent(bucketKey, k -> new TokenBucket(capacity, refillRate));

        boolean allowed = bucket.tryConsume();
        long limit = bucket.getCapacity();
        long remaining = bucket.getAvailableTokens();
        long retryAfter = allowed ? 0 : bucket.getSecondsUntilNextToken();

        // Sampled probabilistic maintenance to avoid latency spikes on request threads
        if (buckets.size() > 5000 && ThreadLocalRandom.current().nextInt(100) == 0) {
            cleanupStaleBuckets();
        }

        return new RateLimitResult(allowed, limit, remaining, retryAfter);
    }

    private long resolveCapacity(PolicyTier tier) {
        return switch (tier) {
            case AUTH -> authCapacity;
            case OTP -> otpCapacity;
            default -> generalCapacity;
        };
    }

    private double resolveRefillRate(PolicyTier tier) {
        return switch (tier) {
            case AUTH -> authRefillRate;
            case OTP -> otpRefillRate;
            default -> generalRefillRate;
        };
    }

    /**
     * Periodic cleanup of inactive buckets that haven't been accessed for more than 10 minutes.
     */
    public void cleanupStaleBuckets() {
        long tenMinutesAgo = System.currentTimeMillis() - (10 * 60 * 1000);
        buckets.entrySet().removeIf(entry -> entry.getValue().getLastAccessTimestamp() < tenMinutesAgo);
    }

    public int getActiveBucketCount() {
        return buckets.size();
    }
}

