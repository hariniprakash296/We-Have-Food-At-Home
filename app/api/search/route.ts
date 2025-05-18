// Add Edge runtime configuration at the top of the file:
export const runtime = "edge"
export const preferredRegion = "auto"
export const dynamic = "force-dynamic"
export const maxDuration = 25 // Reduced from 30 seconds

// This will deploy your API route to the Edge network, reducing latency

/**
 * Search API Route
 *
 * This file implements the API route for searching recipes using the Deepseek API.
 * It handles rate limiting, validation, caching, and error handling for recipe search requests.
 */

import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { rateLimit, getResetTimeString } from "@/lib/rate-limiter"

/**
 * Maximum number of requests allowed per IP address within the rate limit duration
 */
const RATE_LIMIT = 5

/**
 * Simple in-memory cache for API responses
 * Maps query strings to cached results with expiration times
 */
interface CacheEntry {
  result: string
  expiry: number
}

// In-memory cache with 24-hour TTL
const responseCache = new Map<string, CacheEntry>()

// Cache TTL in milliseconds (12 hours instead of 24)
const CACHE_TTL = 12 * 60 * 60 * 1000

/**
 * Normalize a query string for cache key generation
 * @param query - The query string to normalize
 * @returns Normalized query string for consistent cache keys
 */
function normalizeQuery(query: string): string {
  // Extract any filter terms if present
  const filterMatch = query.match(/with dietary preferences: (.+)$/i)

  if (filterMatch) {
    const mainQuery = query
      .replace(/with dietary preferences: .+$/i, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/[^\w\s]/g, "") // Remove special characters
    const filterTerms = filterMatch[1]
      .split(",")
      .map((term) => term.trim().toLowerCase())
      .sort()
      .join(",")
    return `${mainQuery}:${filterTerms}`
  }

  // If no filter terms, just normalize the query
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[^\w\s]/g, "") // Remove special characters
}

/**
 * API route handler for search requests
 * This function processes POST requests to /api/search
 * @param req - The incoming request object
 * @returns NextResponse - The response object
 */
export async function POST(req: Request) {
  try {
    // Add profiling to identify bottlenecks:
    const startTime = Date.now()
    const timings: Record<string, number> = {}

    // 1. Apply rate limiting based on client IP
    const headersList = headers()
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

    // After rate limiting:
    timings.rateLimit = Date.now() - startTime

    // 2. Extract and validate the query from the request body
    const body = await req.json()
    const query = body?.query

    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    if (query.includes("Failed to fetch search results") || query.includes("Error:")) {
      return NextResponse.json(
        { error: "Invalid search query. Please try again with a different query." },
        { status: 400 },
      )
    }

    // 3. Check cache using stale-while-revalidate
    const cacheKey = normalizeQuery(query)
    const fetchFreshData = async () => {
      // All the API call logic goes here
      // Copy the existing API call code from the current implementation
      // and return the cleanedResponse

      const apiKey = process.env.DEEPSEEK_API_KEY
      if (!apiKey) {
        throw new Error("Search service is not properly configured")
      }

      // 5. Format the message for the Deepseek API with optimized prompt
      // More concise prompt that emphasizes relevance to the query
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
  ]
  Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `Generate 3 recipes for: ${query}`,
        },
      ]

      // 6. Make the request to the Deepseek API
      try {
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
            max_tokens: 1000, // Balanced for quality and speed
            temperature: 0.3, // Keep some creativity while maintaining speed
            presence_penalty: 0.0,
            top_p: 0.85, // Slightly higher for better quality
            frequency_penalty: -0.1, // Reduce redundancy
            stream: false, // Ensure non-streaming for faster complete response
            response_format: { type: "json_object" } // Enforce JSON formatting
          }),
        })

        // 7. Handle API response errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Deepseek API error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            query,
          })
          throw new Error(`Failed to get response from Deepseek API: ${response.status} - ${JSON.stringify(errorData)}`)
        }

        // 8. Process successful response
        const data = await response.json()
        const responseText = data.choices?.[0]?.message?.content || "[]"

        console.log("API Response:", responseText.substring(0, 100) + "...")

        // 9. Clean and validate the response
        const cleanedResponse = cleanJsonResponse(responseText)

        try {
          // Attempt to parse the cleaned response
          const parsedResponse = JSON.parse(cleanedResponse)

          // Check if it's an array with at least one item
          if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
            console.error("Response is not a valid array or is empty")
            throw new Error("The API did not return valid recipe data. Please try a different search query.")
          }

          return cleanedResponse
        } catch (parseError) {
          console.error("Failed to parse API response:", parseError)
          throw new Error("Failed to parse recipe data from the API. Please try a different search query.")
        }
      } catch (apiError) {
        console.error("API request error:", apiError)
        throw new Error(
          `Failed to get response from Deepseek API: ${apiError instanceof Error ? apiError.message : "Unknown error"}`,
        )
      }
    }

    let cleanedResponse = ""
    try {
      const { result, fromCache } = await staleWhileRevalidate(cacheKey, fetchFreshData)
      cleanedResponse = result

      // After cache check:
      timings.cacheCheck = Date.now() - startTime - timings.rateLimit

      // After API call:
      timings.apiCall = Date.now() - startTime - timings.rateLimit - timings.cacheCheck

      // After response processing:
      timings.processing = Date.now() - startTime - timings.rateLimit - timings.cacheCheck - timings.apiCall

      return NextResponse.json(
        { result: cleanedResponse },
        {
          headers: {
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

      // After cache check:
      timings.cacheCheck = Date.now() - startTime - timings.rateLimit

      // After API call:
      timings.apiCall = Date.now() - startTime - timings.rateLimit - timings.cacheCheck

      // After response processing:
      timings.processing = Date.now() - startTime - timings.rateLimit - timings.cacheCheck - timings.apiCall

      return NextResponse.json(
        {
          error: "Failed to get search results",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        {
          status: 500,
          headers: {
            "X-Timing-Total": (Date.now() - startTime).toString(),
            "X-Timing-RateLimit": timings.rateLimit.toString(),
            "X-Timing-CacheCheck": timings.cacheCheck.toString(),
            "X-Timing-ApiCall": timings.apiCall.toString(),
            "X-Timing-Processing": timings.processing.toString(),
          },
        },
      )
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Failed to process your request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
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
