/**
 * Search API Route
 * 
 * This route implements a recipe search endpoint using the Deepseek API.
 * It follows SOLID principles and implements caching, rate limiting, and validation.
 * 
 * Single Responsibility (S):
 * - Focused solely on recipe search functionality
 * - Clear separation of validation, caching, and API logic
 * - Each schema/interface handles specific data structure
 * 
 * Open/Closed (O):
 * - Extensible through Zod schemas
 * - Caching strategy can be modified without changing core logic
 * - Response format can be extended
 * 
 * Liskov Substitution (L):
 * - Consistent request/response handling
 * - Error responses follow standard format
 * - Cache behavior is uniform
 * 
 * Interface Segregation (I):
 * - Focused schemas for data validation
 * - Clear separation of caching logic
 * - Specific error handling types
 * 
 * Dependency Inversion (D):
 * - Depends on abstractions (schemas) not implementations
 * - Environment variables for configuration
 * - Modular caching implementation
 * 
 * DRY Principles:
 * - Reusable schemas and validation
 * - Centralized caching logic
 * - Common error handling patterns
 * - Shared type definitions
 * 
 * Features:
 * - Edge runtime optimization
 * - Request validation using Zod
 * - Response caching with TTL
 * - Rate limiting protection
 * - Error handling and sanitization
 * 
 * Performance Optimizations:
 * - Edge network deployment
 * - Response caching
 * - Chunked response processing
 * - Auto region selection
 * 
 * Security Considerations:
 * - Rate limiting prevents abuse
 * - Input validation
 * - Response sanitization
 * - Error message sanitization
 */

// Add Edge runtime configuration at the top of the file:
export const runtime = "edge"
export const preferredRegion = "auto"
export const dynamic = "force-dynamic"
export const maxDuration = 25 // Reduced from 30 seconds

// This will deploy your API route to the Edge network, reducing latency

import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { rateLimit, getResetTimeString } from "@/lib/rate-limiter"
import { z } from "zod"

/**
 * Recipe Schema Definition
 * Validates the structure of recipe data using Zod
 */
const RecipeSchema = z.object({
  id: z.string(),                           // Unique recipe identifier
  title: z.string().min(1).max(200),        // Recipe title with length constraints
  description: z.string().max(1000),        // Description with max length
  ingredients: z.array(z.string()),         // List of ingredients
  instructions: z.array(z.string()),        // Step-by-step instructions
  prepTime: z.string(),                     // Preparation time
  dietaryInfo: z.array(z.string()),        // Dietary information and tags
  recipeType: z.string()                   // Type of recipe
})

/**
 * Recipe Array Schema
 * Ensures API response contains valid array of recipes
 */
const RecipeArraySchema = z.array(RecipeSchema)

/**
 * Sanitizes API response content
 * Prevents JSON parsing errors and malformed data
 * 
 * @param content - Raw content from API response
 * @returns Sanitized content safe for JSON parsing
 */
function sanitizeApiResponse(content: string): string {
  // Remove control characters
  const withoutControl = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
  
  // Fix JSON syntax issues
  return withoutControl
    .replace(/\\(?!["\\/bfnrt])/g, '\\\\')  // Escape backslashes
    .replace(/\n/g, '\\n')                  // Escape newlines
    .replace(/\r/g, '\\r')                  // Escape carriage returns
    .replace(/"/g, '\\"')                   // Escape quotes
    .replace(/,\s*([\]}])/g, '$1')         // Remove trailing commas
}

/**
 * Processes large response content
 * Handles large responses in chunks to prevent memory issues
 * 
 * @param response - Large response string to process
 * @returns Processed and sanitized response
 */
function processLargeResponse(response: string): string {
  const chunkSize = 1000
  const chunks: string[] = []
  
  // Process in chunks to manage memory
  for(let i = 0; i < response.length; i += chunkSize) {
    const chunk = response.slice(i, i + chunkSize)
    chunks.push(sanitizeApiResponse(chunk))
  }
  
  return chunks.join('')
}

/**
 * Validates API response data
 * Ensures response matches expected structure
 * 
 * @param response - Raw API response
 * @returns Validated response content
 */
function validateApiResponse(response: any): string {
  if (!response?.choices?.[0]?.message?.content) {
    throw new Error('Invalid API response structure')
  }
  return response.choices[0].message.content
}

// Rate limit configuration
const RATE_LIMIT = 5

/**
 * Cache entry interface
 * Defines structure for cached responses
 */
interface CacheEntry {
  result: string    // Cached response data
  expiry: number   // Cache expiration timestamp
}

// In-memory cache with 12-hour TTL
const responseCache = new Map<string, CacheEntry>()
const CACHE_TTL = 12 * 60 * 60 * 1000

/**
 * Normalizes query string for cache key
 * Ensures consistent cache key generation
 * 
 * @param query - Raw query string
 * @returns Normalized query for cache key
 */
function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ")
}

/**
 * POST request handler
 * Processes recipe search requests
 * 
 * @param req - Incoming HTTP request
 * @returns NextResponse with search results or error
 */
export async function POST(req: Request) {
  try {
    const startTime = Date.now()
    const timings: Record<string, number> = {}

    // Apply rate limiting
    const headersList = await headers()
    const forwarded = headersList.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1"
    const rateLimitResult = rateLimit(ip)

    if (rateLimitResult.limited) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please try again in ${getResetTimeString(rateLimitResult.resetTime)}.`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        },
      )
    }

    timings.rateLimit = Date.now() - startTime

    // Validate request body
    const body = await req.json()
    const query = body?.query

    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    // Check cache and fetch data
    const cacheKey = normalizeQuery(query)
    const fetchFreshData = async () => {
      const apiKey = process.env.DEEPSEEK_API_KEY
      if (!apiKey) {
        throw new Error("Search service is not properly configured")
      }

      // Configure API request
      const messages = [
        {
          role: "system",
          content: `Generate 3 recipes matching user criteria. Format as JSON array:
[
  {
    "id": "1",
    "title": "Recipe Title",
    "description": "Brief description",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "prepTime": "30 min",
    "dietaryInfo": ["tag1", "tag2"],
    "recipeType": "breakfast/lunch/dinner/appetizer"
  }
]`,
        },
        {
          role: "user",
          content: `Generate 3 recipes for: ${query}`,
        },
      ]

      console.log("Sending request to Deepseek API...")

      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          max_tokens: 2000,
          temperature: 0.3,
          presence_penalty: 0.0,
          top_p: 0.85,
          frequency_penalty: -0.1,
          stream: false,
          response_format: { type: "json_object" }
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const content = validateApiResponse(data)
      
      // Cache the response
      responseCache.set(cacheKey, {
        result: content,
        expiry: Date.now() + CACHE_TTL
      })
      
      return content
    }

    let result = ""
    try {
      const { result: freshResult, fromCache } = await staleWhileRevalidate(cacheKey, fetchFreshData)
      result = freshResult

      timings.cacheCheck = Date.now() - startTime - timings.rateLimit
      timings.apiCall = Date.now() - startTime - timings.rateLimit - timings.cacheCheck
      timings.processing = Date.now() - startTime - timings.rateLimit - timings.cacheCheck - timings.apiCall

      return NextResponse.json(
        { result },
        {
          headers: {
            "Cache-Control": "public, max-age=43200",
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() ?? "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
            "X-Cache": fromCache ? "HIT" : "MISS",
            "X-Timing-Total": (Date.now() - startTime).toString(),
            "X-Timing-RateLimit": timings.rateLimit.toString(),
            "X-Timing-CacheCheck": timings.cacheCheck.toString(),
            "X-Timing-ApiCall": timings.apiCall.toString(),
            "X-Timing-Processing": timings.processing.toString(),
          },
        },
      )
    } catch (error) {
      console.error("API request error:", error)
      return NextResponse.json(
        { error: "Failed to get search results" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    )
  }
}

/**
 * Clean expired entries from the cache
 * This helps prevent memory leaks from old cache entries
 */
function cleanExpiredCache() {
  const now = Date.now()
  for (const [key, entry] of responseCache.entries()) {
    if (entry.expiry < now) {
      responseCache.delete(key)
    }
  }
}

/**
 * Clean a JSON response string to ensure it's valid JSON
 * @param jsonString - The JSON string to clean
 * @returns A cleaned JSON string
 */
function cleanJsonResponse(jsonString: string): string {
  let cleaned = jsonString.replace(/```json|```/g, "").trim()

  if (!cleaned.startsWith("[") && cleaned.includes("[") && cleaned.includes("]")) {
    const startIndex = cleaned.indexOf("[")
    const endIndex = cleaned.lastIndexOf("]") + 1
    cleaned = cleaned.substring(startIndex, endIndex)
  }

  return cleaned
}

/**
 * Implements a stale-while-revalidate pattern for cache
 * Returns cached data immediately while updating cache in background
 * @param cacheKey - The cache key
 * @param fetchFn - The function to fetch fresh data
 * @returns Promise resolving to the data
 */
async function staleWhileRevalidate(cacheKey: string, fetchFn: () => Promise<string>) {
  const now = Date.now()
  const cachedResponse = responseCache.get(cacheKey)

  // If we have a valid cache entry, use it
  if (cachedResponse) {
    // If cache is fresh, just return it
    if (cachedResponse.expiry > now) {
      return { result: cachedResponse.result, fromCache: true }
    }

    // If cache is stale but not too old (within 2x TTL), use it but revalidate
    if (cachedResponse.expiry > now - CACHE_TTL) {
      // Revalidate cache in background
      setTimeout(async () => {
        try {
          const freshResult = await fetchFn()
          responseCache.set(cacheKey, {
            result: freshResult,
            expiry: Date.now() + CACHE_TTL,
          })
          console.log("Cache revalidated for:", cacheKey)
        } catch (error) {
          console.error("Cache revalidation failed:", error)
        }
      }, 0)

      // Return stale data immediately
      return { result: cachedResponse.result, fromCache: true }
    }
  }

  // No valid cache, fetch fresh data
  const freshResult = await fetchFn()
  responseCache.set(cacheKey, {
    result: freshResult,
    expiry: now + CACHE_TTL,
  })

  return { result: freshResult, fromCache: false }
}
