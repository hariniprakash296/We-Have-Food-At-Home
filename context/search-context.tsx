/**
 * Search Context Provider
 *
 * This file implements a React Context that manages the search state and functionality
 * for the Recipe Finder application. It provides a centralized way to manage search
 * queries, results, loading states, and errors across components.
 */

"use client"

import * as React from "react"
import { useDeepseekApi } from "@/lib/use-deepseek-api"
import type { Recipe } from "@/components/recipe-card"

/**
 * Interface defining the shape of the search context
 */
interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  recipes: Recipe[]
  loading: boolean
  loadingProgress: number
  error: string | null
  hasSearched: boolean
  selectedFilters: string[]
  setSelectedFilters: (filters: string[]) => void
  performSearch: (searchQuery: string) => Promise<void>
  getRecipeById: (id: string) => Recipe | undefined
}

/**
 * Create the context with default values
 */
const SearchContext = React.createContext<SearchContextType>({
  searchQuery: "",
  setSearchQuery: () => {},
  recipes: [],
  loading: false,
  loadingProgress: 0,
  error: null,
  hasSearched: false,
  selectedFilters: [],
  setSelectedFilters: () => {},
  performSearch: async () => {},
  getRecipeById: () => undefined,
})

/**
 * Custom hook to use the search context
 */
export function useSearch() {
  const context = React.useContext(SearchContext)
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}

/**
 * Props for the SearchProvider component
 */
interface SearchProviderProps {
  children: React.ReactNode // Child components that will have access to the context
}

/**
 * SearchProvider component
 * This component provides the search context to its children
 */
export function SearchProvider({ children }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [recipes, setRecipes] = React.useState<Recipe[]>([])
  const [loading, setLoading] = React.useState(false)
  const [loadingProgress, setLoadingProgress] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([])

  const { searchRecipes, parseRecipeData, isLoading, loadingProgress: apiLoadingProgress } = useDeepseekApi()

  React.useEffect(() => {
    setLoadingProgress(apiLoadingProgress)
  }, [apiLoadingProgress])

  const getRecipeById = React.useCallback(
    (id: string): Recipe | undefined => {
      const recipeFromState = recipes.find((r) => r.id === id)
      if (recipeFromState) return recipeFromState

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

  React.useEffect(() => {
    const savedRecipes = localStorage.getItem("savedRecipes")
    const lastQuery = localStorage.getItem("lastSearchQuery")

    if (savedRecipes && lastQuery) {
      try {
        const parsedRecipes = JSON.parse(savedRecipes)
        setRecipes(parsedRecipes)
        setSearchQuery(lastQuery)
        setHasSearched(true)
      } catch (error) {
        console.error("Error loading saved recipes:", error)
      }
    }
  }, [])

  React.useEffect(() => {
    if (recipes.length > 0) {
      try {
        localStorage.setItem("savedRecipes", JSON.stringify(recipes))
        localStorage.setItem("lastSearchQuery", searchQuery)
      } catch (error) {
        console.error("Error saving recipes to localStorage:", error)
      }
    }
  }, [recipes, searchQuery])

  const handlePartialResults = React.useCallback((partialRecipes: Recipe[]) => {
    if (partialRecipes.length > 0) {
      setRecipes(partialRecipes)
    }
  }, [])

  const performSearch = React.useCallback(
    async (searchQuery: string) => {
      setError(null)
      setLoading(true)
      setLoadingProgress(0)

      try {
        let combinedQuery = searchQuery

        if (selectedFilters.length > 0) {
          const filterTerms = selectedFilters.join(", ")
          combinedQuery = `${searchQuery} with dietary preferences: ${filterTerms}`
        }

        const data = await searchRecipes(combinedQuery, handlePartialResults)

        const parsedRecipes = parseRecipeData(data.result)

        if (parsedRecipes.length === 0) {
          throw new Error("No recipes found. Please try a different search query.")
        }

        setRecipes(parsedRecipes)
        setHasSearched(true)
      } catch (err) {
        console.error("Search error:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setRecipes([])
      } finally {
        setLoading(false)
      }
    },
    [searchRecipes, parseRecipeData, selectedFilters, handlePartialResults],
  )

  const value = React.useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      recipes,
      loading: loading || isLoading,
      loadingProgress,
      error,
      hasSearched,
      selectedFilters,
      setSelectedFilters,
      performSearch,
      getRecipeById,
    }),
    [
      searchQuery,
      recipes,
      loading,
      isLoading,
      loadingProgress,
      error,
      hasSearched,
      selectedFilters,
      setSelectedFilters,
      performSearch,
      getRecipeById,
    ],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}
