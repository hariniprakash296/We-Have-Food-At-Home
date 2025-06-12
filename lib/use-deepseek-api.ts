/**
 * Deepseek API Hook
 * 
 * A custom React hook for interacting with the Deepseek API for recipe search.
 * Follows SOLID principles and implements caching and progressive loading.
 * 
 * Single Responsibility (S):
 * - Focused solely on recipe search functionality
 * - Clear separation of caching and API calls
 * - Each interface handles specific data structure
 * 
 * Open/Closed (O):
 * - Extensible through interfaces
 * - Caching can be modified without changing core logic
 * - Response parsing can be customized
 * 
 * Liskov Substitution (L):
 * - Consistent response handling
 * - Error handling follows standard patterns
 * - Cache behavior is uniform
 * 
 * Interface Segregation (I):
 * - Focused interfaces for responses
 * - Clear separation of caching logic
 * - Specific error handling types
 * 
 * Dependency Inversion (D):
 * - Depends on abstractions (interfaces) not implementations
 * - Cache implementation through Map
 * - Modular response parsing
 * 
 * DRY Principles:
 * - Reusable interfaces
 * - Centralized caching logic
 * - Common error handling patterns
 * - Shared type definitions
 * 
 * Features:
 * - Browser-side caching
 * - Progressive loading
 * - Error handling
 * - Response parsing
 * 
 * Performance Optimizations:
 * - In-memory caching
 * - Progressive loading
 * - Request timeout handling
 * - Response validation
 * 
 * Error Handling:
 * - API errors
 * - Timeout errors
 * - Parsing errors
 * - Cache errors
 * 
 * Usage Example:
 * ```typescript
 * const { isLoading, loadingProgress, searchRecipes } = useDeepseekApi()
 * 
 * const handleSearch = async () => {
 *   try {
 *     const results = await searchRecipes("vegetarian pasta")
 *     console.log(results)
 *   } catch (error) {
 *     console.error(error)
 *   }
 * }
 * ```
 */

"use client"

import { useState, useCallback } from "react"
import type { Recipe } from "@/components/recipe-card"

/**
 * Browser cache configuration
 * Simple in-memory cache with TTL
 */
const browserCache = new Map<string, { data: SearchResponse; timestamp: number }>()
const BROWSER_CACHE_TTL = 15 * 60 * 1000 // 15 minutes TTL

/**
 * Search response interface
 * Defines structure of API responses
 */
interface SearchResponse {
  result: string    // Search result data
  error?: string   // Optional error message
}

/**
 * Deepseek API hook
 * Manages recipe search functionality
 * 
 * @returns Object containing loading state and search functions
 */
export function useDeepseekApi() {
  // Loading state management
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  /**
   * Recipe data parser
   * Converts API response to Recipe objects
   * 
   * @param jsonString - JSON string from API
   * @returns Array of parsed Recipe objects
   */
  const parseRecipeData = useCallback((jsonString: string): Recipe[] => {
    try {
      // Parse JSON response
      const data = JSON.parse(jsonString)
      
      // Handle different response formats
      const recipes = Array.isArray(data) ? data : data.recipes || []
      
      // Map to Recipe format with fallbacks
      return recipes.map((recipe: any, index: number) => ({
        id: recipe.id || `recipe-${index + 1}`,
        title: recipe.title || "Untitled Recipe",
        description: recipe.description || "No description available",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        prepTime: recipe.prepTime || "Unknown",
        dietaryInfo: Array.isArray(recipe.dietaryInfo) ? recipe.dietaryInfo : [],
        recipeType: recipe.recipeType || null,
      }))
    } catch (error) {
      console.error("Error parsing recipe data:", error)
      return []
    }
  }, [])

  /**
   * Recipe search function
   * Performs API call with caching and progress tracking
   * 
   * @param query - Search query string
   * @param onPartialResult - Optional callback for progressive loading
   * @returns Promise resolving to search response
   */
  const searchRecipes = useCallback(
    async (query: string, onPartialResult?: (recipes: Recipe[]) => void): Promise<SearchResponse> => {
      // Normalize query for cache
      const cacheKey = query.trim().toLowerCase()

      // Check browser cache
      const cachedItem = browserCache.get(cacheKey)
      if (cachedItem && Date.now() - cachedItem.timestamp < BROWSER_CACHE_TTL) {
        console.log("Browser cache hit for:", cacheKey)

        // Handle partial results for cached data
        if (onPartialResult && cachedItem.data.result) {
          try {
            const recipes = parseRecipeData(cachedItem.data.result)
            onPartialResult(recipes)
          } catch (error) {
            console.error("Error parsing cached results:", error)
          }
        }

        return cachedItem.data
      }

      // Initialize loading state
      setIsLoading(true)
      setLoadingProgress(0)

      // Configure progress animation
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + (100 - prev) * 0.05
          return Math.min(newProgress, 95)
        })
      }, 300)

      try {
        // Setup request with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 78000)

        // Make API request
        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Handle cached responses
        const isCached = response.headers.get("X-Cache") === "HIT"
        if (isCached) {
          setLoadingProgress(90)
        }

        // Parse response
        const data = await response.json()

        // Validate response
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch search results")
        }

        // Handle partial results
        if (onPartialResult && data.result) {
          try {
            const recipes = parseRecipeData(data.result)
            onPartialResult(recipes)
          } catch (error) {
            console.error("Error parsing partial results:", error)
          }
        }

        // Complete progress
        setLoadingProgress(100)

        // Cache successful response
        browserCache.set(cacheKey, { data, timestamp: Date.now() })

        return data
      } catch (error) {
        console.error("API request error:", error)
        
        // Handle timeout errors
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error("Request timed out. Please try again.")
        }
        
        throw error
      } finally {
        // Cleanup
        clearInterval(progressInterval)
        setIsLoading(false)
      }
    },
    [parseRecipeData],
  )

  // Return hook interface
  return {
    isLoading,
    loadingProgress,
    searchRecipes,
    parseRecipeData,
  }
}
