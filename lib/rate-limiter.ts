/**
 * Rate Limiter Utility
 *
 * This file implements a rate limiting mechanism to prevent abuse of the API.
 * It uses an LRU cache to track requests by IP address and enforces limits
 * on the number of requests allowed within a time interval.
 */

import { LRUCache } from "lru-cache"

/**
 * Interface defining the options for rate limiting
 */
type RateLimitOptions = {
  limit: number // Maximum number of requests allowed
  interval: number // Time interval in milliseconds
}

/**
 * Default rate limiting options
 */
const defaultOptions: RateLimitOptions = {
  limit: 5,
  interval: 60 * 1000, // 1 minute
}

/**
 * LRU cache to store tokens for each IP address
 * Each IP address has an array of timestamps representing requests
 */
const tokenCache = new LRUCache<string, number[]>({
  max: 500, // max 500 different IPs
  ttl: defaultOptions.interval,
})

/**
 * Apply rate limiting to an IP address
 * @param ip - The IP address to rate limit
 * @returns Object containing rate limit information
 */
export function rateLimit(ip: string) {
  // Get the current timestamp
  const now = Date.now()

  // Get existing tokens for this IP or initialize an empty array
  const token = tokenCache.get(ip) || []

  // Filter tokens that are older than the interval
  const validTokens = token.filter((time) => time > now - defaultOptions.interval)

  // Update the cache with the filtered tokens
  tokenCache.set(ip, validTokens)

  // Check if the IP has exceeded the rate limit
  if (validTokens.length >= defaultOptions.limit) {
    // Calculate when the rate limit will reset
    const resetTime = validTokens[0] + defaultOptions.interval

    // Return information about the rate limit
    return {
      limited: true,
      resetTime,
    }
  }

  // Add the current timestamp to the tokens
  validTokens.push(now)

  // Update the cache with the new tokens
  tokenCache.set(ip, validTokens)

  // Return information about the rate limit
  return {
    limited: false,
    remaining: defaultOptions.limit - validTokens.length,
    resetTime: validTokens[0] + defaultOptions.interval,
  }
}

/**
 * Get a human-readable string for when the rate limit will reset
 * @param resetTime - The timestamp when the rate limit will reset
 * @returns String representing the time until reset
 */
export function getResetTimeString(resetTime: number): string {
  // Calculate the difference between the reset time and now
  const diff = Math.max(0, resetTime - Date.now())

  // Convert to seconds and round up
  const seconds = Math.ceil(diff / 1000)

  // Return a formatted string
  return `${seconds} seconds`
}
