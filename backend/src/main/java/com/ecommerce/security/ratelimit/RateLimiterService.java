package com.ecommerce.security.ratelimit;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service managing Token Bucket rate limits per client IP and endpoint tier.
 */
@Service
public class RateLimiterService {

    public enum PolicyTier {
        AUTH(5, 5.0 / 60.0),       // Max 5 burst, refills 5 per minute (1 per 12 seconds)
        OTP(5, 5.0 / 60.0),        // Max 5 burst, refills 5 per minute
        GENERAL(60, 60.0 / 60.0);  // Max 60 burst, refills 60 per minute (1 per second)

        private final long capacity;
        private final double refillTokensPerSecond;

        PolicyTier(long capacity, double refillTokensPerSecond) {
            this.capacity = capacity;
            this.refillTokensPerSecond = refillTokensPerSecond;
        }

        public long getCapacity() {
            return capacity;
        }

        public double getRefillTokensPerSecond() {
            return refillTokensPerSecond;
        }
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

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    /**
     * Resolves or creates a bucket for the given client key and policy tier, then attempts to consume a token.
     */
    public RateLimitResult checkRateLimit(String clientIp, PolicyTier tier) {
        String bucketKey = clientIp + ":" + tier.name();

        TokenBucket bucket = buckets.computeIfAbsent(bucketKey, k -> 
            new TokenBucket(tier.getCapacity(), tier.getRefillTokensPerSecond())
        );

        boolean allowed = bucket.tryConsume();
        long limit = bucket.getCapacity();
        long remaining = bucket.getAvailableTokens();
        long retryAfter = allowed ? 0 : bucket.getSecondsUntilNextToken();

        // Trigger maintenance if map grows large (> 5000 tracked IPs)
        if (buckets.size() > 5000) {
            cleanupStaleBuckets();
        }

        return new RateLimitResult(allowed, limit, remaining, retryAfter);
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
