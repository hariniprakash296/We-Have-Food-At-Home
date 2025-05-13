/**
 * Search Context Provider
 *
 * This file implements a React Context that manages the search state and functionality
 * for the Recipe Finder application. It provides a centralized way to manage search
 * queries, results, loading states, and errors across components.
 */

"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode, useEffect } from "react"
import { useDeepseekApi } from "@/lib/use-deepseek-api"
import type { Recipe } from "@/components/recipe-card"

/**
 * Interface defining the shape of the search context
 */
interface SearchContextType {
  query: string // The current search query
  recipes: Recipe[] // The parsed recipes
  loading: boolean // Whether a search is in progress
  loadingProgress: number // Loading progress (0-100%)
  error: string | null // Any error that occurred during search
  hasSearched: boolean // Whether a search has been performed
  selectedFilters: string[] // Selected filter IDs
  setQuery: (query: string) => void // Function to update the query
  performSearch: (searchQuery: string) => Promise<void> // Function to execute a search
  setSelectedFilters: (filters: string[]) => void // Function to update selected filters
  getRecipeById: (id: string) => Recipe | undefined // Function to get a recipe by ID
}

/**
 * Create the context with default values
 */
const SearchContext = createContext<SearchContextType>({
  query: "",
  recipes: [],
  loading: false,
  loadingProgress: 0,
  error: null,
  hasSearched: false,
  selectedFilters: [],
  setQuery: () => {},
  performSearch: async () => {},
  setSelectedFilters: () => {},
  getRecipeById: () => undefined,
})

/**
 * Custom hook to use the search context
 */
export const useSearch = () => useContext(SearchContext)

/**
 * Props for the SearchProvider component
 */
interface SearchProviderProps {
  children: ReactNode // Child components that will have access to the context
}

/**
 * SearchProvider component
 * This component provides the search context to its children
 */
export function SearchProvider({ children }: SearchProviderProps) {
  // State for the search query
  const [query, setQuery] = useState("")

  // State for the parsed recipes
  const [recipes, setRecipes] = useState<Recipe[]>([])

  // State for loading status
  const [loading, setLoading] = useState(false)

  // State for loading progress
  const [loadingProgress, setLoadingProgress] = useState(0)

  // State for error messages
  const [error, setError] = useState<string | null>(null)

  // State to track if a search has been performed
  const [hasSearched, setHasSearched] = useState(false)

  // State for selected filters
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  // Use the deepseek API hook to get the search function and parser
  const { searchRecipes, parseRecipeData, isLoading, loadingProgress: apiLoadingProgress } = useDeepseekApi()

  // Update loading progress from API
  useEffect(() => {
    setLoadingProgress(apiLoadingProgress)
  }, [apiLoadingProgress])

  // Function to get a recipe by ID (from context or localStorage)
  const getRecipeById = useCallback(
    (id: string): Recipe | undefined => {
      // First try to find in current state
      const recipeFromState = recipes.find((r) => r.id === id)
      if (recipeFromState) return recipeFromState

      // If not found in state, try localStorage
      try {
        const savedRecipes = localStorage.getItem("savedRecipes")
        if (savedRecipes) {
          const parsedRecipes = JSON.parse(savedRecipes) as Recipe[]
          return parsedRecipes.find((r) => r.id === id)
        }
      } catch (error) {
        console.error("Error retrieving recipes from localStorage:", error)
      }

      return undefined
    },
    [recipes],
  )

  // Load saved recipes on initial mount
  useEffect(() => {
    // Try to load saved recipes from localStorage on component mount
    const savedRecipes = localStorage.getItem("savedRecipes")
    const lastQuery = localStorage.getItem("lastSearchQuery")

    if (savedRecipes && lastQuery) {
      try {
        const parsedRecipes = JSON.parse(savedRecipes)
        setRecipes(parsedRecipes)
        setQuery(lastQuery)
        setHasSearched(true)
      } catch (error) {
        console.error("Error loading saved recipes:", error)
      }
    }
  }, [])

  // Save recipes to localStorage when they change
  useEffect(() => {
    // When recipes change and we have results, save to localStorage
    if (recipes.length > 0) {
      try {
        localStorage.setItem("savedRecipes", JSON.stringify(recipes))
        localStorage.setItem("lastSearchQuery", query)
      } catch (error) {
        console.error("Error saving recipes to localStorage:", error)
      }
    }
  }, [recipes, query])

  /**
   * Handle partial results for progressive loading
   * @param partialRecipes - Partial recipe results
   */
  const handlePartialResults = useCallback((partialRecipes: Recipe[]) => {
    if (partialRecipes.length > 0) {
      setRecipes(partialRecipes)
    }
  }, [])

  /**
   * Perform a search with the given query
   * This function makes an API call to the search endpoint
   * @param searchQuery - The query to search for
   */
  const performSearch = useCallback(
    async (searchQuery: string) => {
      // Reset error state
      setError(null)

      // Set loading state to true
      setLoading(true)
      setLoadingProgress(0)

      try {
        // Build a combined query with filters
        let combinedQuery = searchQuery

        if (selectedFilters.length > 0) {
          // Add filter terms to the query
          const filterTerms = selectedFilters.join(", ")
          combinedQuery = `${searchQuery} with dietary preferences: ${filterTerms}`
        }

        // Use the searchRecipes function from the useDeepseekApi hook
        // Pass the handlePartialResults callback for progressive loading
        const data = await searchRecipes(combinedQuery, handlePartialResults)

        // Parse the recipe data
        const parsedRecipes = parseRecipeData(data.result)

        // Check if we got valid recipes
        if (parsedRecipes.length === 0) {
          throw new Error("No recipes found. Please try a different search query.")
        }

        // Set the recipes (may be redundant if handlePartialResults was called)
        setRecipes(parsedRecipes)

        // Set hasSearched to true
        setHasSearched(true)
      } catch (err) {
        console.error("Search error:", err)
        // Set error state
        setError(err instanceof Error ? err.message : "An unknown error occurred")

        // Clear recipes on error
        setRecipes([])
      } finally {
        // Set loading state to false
        setLoading(false)
      }
    },
    [searchRecipes, parseRecipeData, selectedFilters, handlePartialResults],
  )

  // Create the context value using useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      query,
      recipes,
      loading: loading || isLoading,
      loadingProgress,
      error,
      hasSearched,
      selectedFilters,
      setQuery,
      performSearch,
      setSelectedFilters,
      getRecipeById,
    }),
    [
      query,
      recipes,
      loading,
      isLoading,
      loadingProgress,
      error,
      hasSearched,
      selectedFilters,
      performSearch,
      getRecipeById,
    ],
  )

  // Provide the context value to children
  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>
}
