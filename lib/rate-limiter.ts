/**
 * Rate Limiter Utility
 * 
 * A comprehensive rate limiting implementation using LRU cache.
 * Follows SOLID principles and implements efficient request tracking.
 * 
 * Single Responsibility (S):
 * - Focused solely on rate limiting functionality
 * - Clear separation of token management and time tracking
 * - Each function handles specific aspect of rate limiting
 * 
 * Open/Closed (O):
 * - Extensible through options interface
 * - Cache implementation can be modified
 * - Time tracking can be customized
 * 
 * Liskov Substitution (L):
 * - Consistent token management
 * - Uniform time tracking
 * - Standard cache behavior
 * 
 * Interface Segregation (I):
 * - Focused interfaces for options
 * - Clear separation of concerns
 * - Specific return types
 * 
 * Dependency Inversion (D):
 * - Depends on abstractions (LRU cache) not implementations
 * - Time tracking through standard Date API
 * - Modular token management
 * 
 * DRY Principles:
 * - Reusable interfaces
 * - Centralized token management
 * - Common time tracking patterns
 * - Shared configuration
 * 
 * Features:
 * - Request tracking by IP
 * - Automatic token expiration
 * - Configurable limits
 * - Human-readable reset times
 * 
 * Performance Optimizations:
 * - LRU cache for efficient storage
 * - Automatic cleanup of expired tokens
 * - Optimized time calculations
 * 
 * Security Considerations:
 * - IP-based tracking
 * - Automatic token expiration
 * - Memory usage limits
 * 
 * Usage Example:
 * ```typescript
 * const result = rateLimit("127.0.0.1")
 * if (result.limited) {
 *   console.log(`Rate limited. Try again in ${getResetTimeString(result.resetTime)}`)
 * }
 * ```
 */

import { LRUCache } from "lru-cache"

/**
 * Rate limiting options interface
 * Defines configuration for rate limiting behavior
 */
type RateLimitOptions = {
  limit: number    // Maximum requests allowed
  interval: number // Time window in milliseconds
}

/**
 * Default configuration
 * Sets standard rate limiting parameters
 */
const defaultOptions: RateLimitOptions = {
  limit: 5,        // 5 requests
  interval: 60 * 1000, // per minute
}

/**
 * Token cache
 * LRU cache storing request timestamps by IP
 * 
 * Configuration:
 * - Maximum 500 IPs tracked
 * - Automatic expiration after interval
 */
const tokenCache = new LRUCache<string, number[]>({
  max: 500, // Maximum IPs tracked
  ttl: defaultOptions.interval, // Auto-expire after interval
})

/**
 * Apply rate limiting to an IP
 * Tracks and limits requests from specific IPs
 * 
 * @param ip - IP address to rate limit
 * @returns Object containing rate limit status
 */
export function rateLimit(ip: string) {
  // Get current timestamp
  const now = Date.now()

  // Get or initialize token array
  const token = tokenCache.get(ip) || []

  // Remove expired tokens
  const validTokens = token.filter((time) => time > now - defaultOptions.interval)

  // Update cache with valid tokens
  tokenCache.set(ip, validTokens)

  // Check if limit exceeded
  if (validTokens.length >= defaultOptions.limit) {
    // Calculate reset time
    const resetTime = validTokens[0] + defaultOptions.interval

    // Return limited status
    return {
      limited: true,
      resetTime,
    }
  }

  // Add new token
  validTokens.push(now)

  // Update cache
  tokenCache.set(ip, validTokens)

  // Return not limited status
  return {
    limited: false,
    remaining: defaultOptions.limit - validTokens.length,
    resetTime: validTokens[0] + defaultOptions.interval,
  }
}

/**
 * Get human-readable reset time
 * Converts timestamp to readable duration
 * 
 * @param resetTime - Timestamp when limit resets
 * @returns Human-readable time string
 */
export function getResetTimeString(resetTime: number): string {
  // Calculate remaining time
  const diff = Math.max(0, resetTime - Date.now())

  // Convert to seconds
  const seconds = Math.ceil(diff / 1000)

  // Return formatted string
  return `${seconds} seconds`
}
