package com.ecommerce.security.ratelimit;

/**
 * Thread-safe implementation of the Token Bucket Rate Limiting Algorithm.
 * 
 * Concept:
 * - A virtual bucket holds up to 'capacity' tokens.
 * - Each request consumes 1 token.
 * - Tokens refill continuously at a steady rate ('refillTokensPerSecond').
 * - Bursts are permitted up to the bucket capacity, but sustained traffic
 *   is capped strictly at the refill rate.
 */
public class TokenBucket {

    private final long capacity;
    private final double refillTokensPerSecond;
    private double availableTokens;
    private long lastRefillTimestamp;
    private long lastAccessTimestamp;

    public TokenBucket(long capacity, double refillTokensPerSecond) {
        this.capacity = capacity;
        this.refillTokensPerSecond = refillTokensPerSecond;
        this.availableTokens = capacity;
        this.lastRefillTimestamp = System.currentTimeMillis();
        this.lastAccessTimestamp = System.currentTimeMillis();
    }

    /**
     * Attempts to consume 1 token from the bucket.
     * Refills tokens based on elapsed time since the last call.
     * 
     * @return true if token was consumed (request allowed), false if bucket is empty (rate limited)
     */
    public synchronized boolean tryConsume() {
        refill();
        this.lastAccessTimestamp = System.currentTimeMillis();

        if (availableTokens >= 1.0) {
            availableTokens -= 1.0;
            return true;
        }
        return false;
    }

    /**
     * Refills tokens based on the elapsed time since last refill.
     */
    private void refill() {
        long now = System.currentTimeMillis();
        long elapsedMs = now - lastRefillTimestamp;

        if (elapsedMs > 0) {
            double tokensToAdd = (elapsedMs / 1000.0) * refillTokensPerSecond;
            availableTokens = Math.min((double) capacity, availableTokens + tokensToAdd);
            lastRefillTimestamp = now;
        }
    }

    /**
     * Calculates the estimated seconds until at least 1 token is available.
     * Used for the HTTP 'Retry-After' response header.
     */
    public synchronized long getSecondsUntilNextToken() {
        refill();
        if (availableTokens >= 1.0) {
            return 0;
        }
        double tokensNeeded = 1.0 - availableTokens;
        long msRequired = (long) Math.ceil((tokensNeeded / refillTokensPerSecond) * 1000.0);
        return Math.max(1, (long) Math.ceil(msRequired / 1000.0));
    }

    public synchronized long getCapacity() {
        return capacity;
    }

    public synchronized long getAvailableTokens() {
        refill();
        return (long) Math.floor(availableTokens);
    }

    public synchronized long getLastAccessTimestamp() {
        return lastAccessTimestamp;
    }
}
