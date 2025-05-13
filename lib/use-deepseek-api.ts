/**
 * Deepseek API Hook
 *
 * This custom hook encapsulates the logic for making API calls to the Deepseek API.
 * It provides a clean interface for searching recipes and handles loading states.
 */

"use client"

import { useState, useCallback } from "react"
import type { Recipe } from "@/components/recipe-card"

// Simple in-memory cache for browser
const browserCache = new Map<string, { data: SearchResponse; timestamp: number }>()
const BROWSER_CACHE_TTL = 15 * 60 * 1000 // 15 minutes

/**
 * Interface for the search response
 */
interface SearchResponse {
  result: string // The search result
  error?: string // Optional error message
}

/**
 * Custom hook for interacting with the Deepseek API
 * @returns Object containing loading state and search function
 */
export function useDeepseekApi() {
  // State to track loading status
  const [isLoading, setIsLoading] = useState(false)

  // State to track progressive loading status (0-100%)
  const [loadingProgress, setLoadingProgress] = useState(0)

  /**
   * Function to parse recipe data from API response
   * @param jsonString - JSON string from API response
   * @returns Array of Recipe objects
   */
  const parseRecipeData = useCallback((jsonString: string): Recipe[] => {
    try {
      // Fast path: If the string is already valid JSON, parse it directly
      try {
        const parsedData = JSON.parse(jsonString)

        // If it's an array, process it
        if (Array.isArray(parsedData)) {
          return parsedData.map((recipe: any, index: number) => ({
            id: recipe.id || `recipe-${index + 1}`,
            title: recipe.title || "Untitled Recipe",
            description: recipe.description || "No description available",
            ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
            instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
            prepTime: recipe.prepTime || "Unknown",
            imageUrl: `/placeholder.svg?height=192&width=384&query=${encodeURIComponent(recipe.title || "food")}`,
            dietaryInfo: Array.isArray(recipe.dietaryInfo) ? recipe.dietaryInfo : [],
            recipeType: recipe.recipeType || null,
          }))
        }
      } catch (e) {
        // If direct parsing fails, continue to the cleanup logic
      }

      // Clean up the string - only do this if needed
      const cleanedString = jsonString.replace(/```json|```/g, "").trim()

      // Extract array portion if needed
      let arrayString = cleanedString
      if (!cleanedString.startsWith("[") && cleanedString.includes("[") && cleanedString.includes("]")) {
        const startIndex = cleanedString.indexOf("[")
        const endIndex = cleanedString.lastIndexOf("]") + 1
        arrayString = cleanedString.substring(startIndex, endIndex)
      }

      // Parse the cleaned string
      const parsedData = JSON.parse(arrayString)

      // Ensure it's an array
      if (!Array.isArray(parsedData)) {
        throw new Error("Invalid recipe data format: not an array")
      }

      // Map to Recipe format
      return parsedData.map((recipe: any, index: number) => ({
        id: recipe.id || `recipe-${index + 1}`,
        title: recipe.title || "Untitled Recipe",
        description: recipe.description || "No description available",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        prepTime: recipe.prepTime || "Unknown",
        imageUrl: `/placeholder.svg?height=192&width=384&query=${encodeURIComponent(recipe.title || "food")}`,
        dietaryInfo: Array.isArray(recipe.dietaryInfo) ? recipe.dietaryInfo : [],
        recipeType: recipe.recipeType || null,
      }))
    } catch (error) {
      console.error("Error parsing recipe data:", error)
      throw error
    }
  }, [])

  /**
   * Function to search for recipes using the API
   * @param query - The search query containing dietary requirements and cuisine preferences
   * @param onPartialResult - Optional callback for progressive loading
   * @returns Promise resolving to the search response
   */
  const searchRecipes = useCallback(
    async (query: string, onPartialResult?: (recipes: Recipe[]) => void): Promise<SearchResponse> => {
      // Normalize query for consistent cache keys
      const cacheKey = query.trim().toLowerCase()

      // Check browser cache first
      const cachedItem = browserCache.get(cacheKey)
      if (cachedItem && Date.now() - cachedItem.timestamp < BROWSER_CACHE_TTL) {
        console.log("Browser cache hit for:", cacheKey)

        // If we have a partial result callback, call it with the cached data
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

      // Rest of the existing function...
      setIsLoading(true)
      setLoadingProgress(0)

      // Start progress animation
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          // Gradually increase progress, but never reach 100% until complete
          const newProgress = prev + (100 - prev) * 0.1
          return Math.min(newProgress, 95)
        })
      }, 300)

      try {
        // Make API request to the search endpoint
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Check if the response is from cache (faster response)
        const isCached = response.headers.get("X-Cache") === "HIT"

        // If it's a cached response, speed up the progress animation
        if (isCached) {
          setLoadingProgress(90)
        }

        // Parse the response
        const data = await response.json()

        // If the response is not ok, throw an error
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch search results")
        }

        // If we have a partial result callback and valid data, parse and send it
        if (onPartialResult && data.result) {
          try {
            const recipes = parseRecipeData(data.result)
            onPartialResult(recipes)
          } catch (error) {
            console.error("Error parsing partial results:", error)
          }
        }

        // Complete the progress
        setLoadingProgress(100)

        // Cache the successful response in browser
        browserCache.set(cacheKey, { data, timestamp: Date.now() })

        // Return the data
        return data
      } catch (error) {
        console.error("API request error:", error)
        // Re-throw the error to be handled by the caller
        throw error
      } finally {
        // Clear the progress interval
        clearInterval(progressInterval)
        // Set loading state to false
        setIsLoading(false)
      }
    },
    [parseRecipeData],
  )

  return {
    isLoading,
    loadingProgress,
    searchRecipes,
    parseRecipeData,
  }
}
