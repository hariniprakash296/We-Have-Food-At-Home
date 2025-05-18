/**
 * SearchResults Component
 *
 * This component displays the results of a recipe search. It handles different states:
 * - Loading: Shows a loading spinner with progress indicator
 * - Error: Displays an error message
 * - No results: Shows a message when no recipes are found
 * - Results: Displays a grid of recipe cards
 */

"use client"

import { useSearch } from "@/context/search-context"
import { RecipeCard } from "@/components/recipe-card"
import { TypographyH2, TypographyP } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

/**
 * SearchResults component
 * @returns JSX.Element - The rendered search results
 */
export function SearchResults() {
  // Get the search state from context
  const { recipes, loading, loadingProgress, error, hasSearched, searchQuery, selectedFilters, setSelectedFilters } =
    useSearch()

  /**
   * Remove a filter from the selected filters
   * @param filterId - The ID of the filter to remove
   */
  const removeFilter = (filterId: string) => {
    setSelectedFilters(selectedFilters.filter((id) => id !== filterId))
  }

  // If there's an error, display it
  if (error) {
    return (
      <div className="mt-8 p-4 bg-destructive/20 border border-destructive rounded-md text-destructive-foreground">
        <TypographyH2 className="mb-2">Error</TypographyH2>
        <TypographyP>{error}</TypographyP>
        <TypographyP className="mt-2">Please try a different search query or try again later.</TypographyP>
      </div>
    )
  }

  // If loading, show a loading indicator with progress
  if (loading) {
    return (
      <div className="mt-8 flex flex-col items-center w-full max-w-md">
        <div className="loading-spinner mb-4"></div>
        <Progress value={loadingProgress} className="w-full h-2 mb-2" />
        <p className="text-sm text-muted-foreground">
          {loadingProgress < 100 ? `Finding recipes (${Math.round(loadingProgress)}%)...` : "Processing recipes..."}
        </p>

        {/* Show partial results if available */}
        {recipes.length > 0 && (
          <div className="mt-8 w-full max-w-6xl">
            <TypographyH2 className="mb-4">Recipes loading...</TypographyH2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // If a search has been performed but no results were found
  if (hasSearched && recipes.length === 0) {
    return (
      <div className="mt-8 p-4 bg-card border border-border rounded-md text-card-foreground">
        <TypographyP>
          No recipes found for "{searchQuery}". Please try different dietary requirements or cuisine preferences.
        </TypographyP>
      </div>
    )
  }

  // If no search has been performed yet, don't render anything
  if (!hasSearched) {
    return null
  }

  // Render the recipe cards
  return (
    <div className="mt-8 w-full max-w-6xl">
      {/* Results header with title and active filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <TypographyH2 className="mb-0">Recipes for You</TypographyH2>

        {/* Display active filters as badges with remove option - now in black and white */}
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFilters.map((filter) => (
              <Badge
                key={filter}
                className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 px-3 py-1"
              >
                {filter}
                <button
                  className="ml-1 rounded-full hover:bg-gray-400/20"
                  onClick={() => removeFilter(filter)}
                  aria-label={`Remove ${filter} filter`}
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Grid of recipe cards - now 3 columns instead of 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
