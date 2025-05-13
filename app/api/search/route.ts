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
 * Maximum duration for the API route execution (in seconds)
 * This allows responses up to 30 seconds to accommodate longer API calls
 */
export const maxDuration = 30

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

// Cache TTL in milliseconds (24 hours)
const CACHE_TTL = 24 * 60 * 60 * 1000

/**
 * Normalize a query string for cache key generation
 * Removes extra spaces, converts to lowercase, and sorts filter terms
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
    const filterTerms = filterMatch[1]
      .split(",")
      .map((term) => term.trim().toLowerCase())
      .sort()
      .join(", ")
    return `${mainQuery} with dietary preferences: ${filterTerms}`
  }

  // If no filter terms, just normalize the query
  return query.trim().toLowerCase()
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
    const now = Date.now()
    const cachedResponse = responseCache.get(cacheKey)

    if (cachedResponse && cachedResponse.expiry > now) {
      console.log("Cache hit for query:", cacheKey)
      // Return cached response with rate limit headers
      return NextResponse.json(
        { result: cachedResponse.result },
        {
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
            "X-Cache": "HIT",
            "X-Timing-Total": (Date.now() - startTime).toString(),
          },
        },
      )
    }

    console.log("Cache miss for query:", cacheKey)

    // After cache check:
    timings.cacheCheck = Date.now() - startTime - timings.rateLimit

    // 4. Check API key configuration
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Search service is not properly configured" }, { status: 500 })
    }

    // 5. Format the message for the Deepseek API with optimized prompt
    // More concise prompt that emphasizes relevance to the query
    const messages = [
      {
        role: "system",
        content: `Generate 4 recipe variations that CLOSELY match the user's criteria. 
        
        Each recipe should maintain the core elements requested but vary in:
        - Secondary ingredients or preparation methods
        - Flavor profiles or seasonings
        - Cooking techniques
        
        IMPORTANT: All recipes MUST directly address the user's specific request.
        
        Return a JSON array with this structure:
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
        
        Return ONLY the JSON array.`,
      },
      {
        role: "user",
        content: `Generate 4 recipe variations that match these criteria: ${query}
        
        Remember to stay focused on the core request while providing interesting variations.`,
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
          max_tokens: 1200,
          temperature: 0.3,
          presence_penalty: 0.0,
          top_p: 0.8,
        }),
      })

      // After API call:
      timings.apiCall = Date.now() - startTime - timings.rateLimit - timings.cacheCheck

      // 7. Handle API response errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Deepseek API error:", errorData)
        return NextResponse.json(
          {
            error: "Failed to get response from Deepseek API",
            details: errorData,
          },
          { status: response.status },
        )
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
          return NextResponse.json(
            { error: "The API did not return valid recipe data. Please try a different search query." },
            { status: 500 },
          )
        }

        // 10. Cache the successful response
        responseCache.set(cacheKey, {
          result: cleanedResponse,
          expiry: now + CACHE_TTL,
        })

        // Periodically clean up expired cache entries (simple approach)
        if (Math.random() < 0.1) {
          // 10% chance on each request
          cleanExpiredCache()
        }

        // After response processing:
        timings.processing = Date.now() - startTime - timings.rateLimit - timings.cacheCheck - timings.apiCall

        // Return the validated result
        return NextResponse.json(
          { result: cleanedResponse },
          {
            headers: {
              "X-RateLimit-Limit": RATE_LIMIT.toString(),
              "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
              "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
              "X-Cache": "MISS",
              "X-Timing-Total": (Date.now() - startTime).toString(),
              "X-Timing-RateLimit": timings.rateLimit.toString(),
              "X-Timing-CacheCheck": timings.cacheCheck.toString(),
              "X-Timing-ApiCall": timings.apiCall.toString(),
              "X-Timing-Processing": timings.processing.toString(),
            },
          },
        )
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError)
        return NextResponse.json(
          { error: "Failed to parse recipe data from the API. Please try a different search query." },
          { status: 500 },
        )
      }
    } catch (apiError) {
      console.error("API request error:", apiError)
      return NextResponse.json(
        {
          error: "Failed to get response from Deepseek API",
          details: apiError instanceof Error ? apiError.message : "Unknown error",
        },
        { status: 500 },
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
