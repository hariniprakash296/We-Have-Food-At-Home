/**
 * SEARCH RESULTS COMPONENT
 * 
 * SOLID Principles Applied:
 * - Single Responsibility (S): Component solely handles displaying search results and their states
 * - Open/Closed (O): New result states can be added without modifying existing ones
 * - Liskov Substitution (L): Different result displays (error, loading, results) can be substituted
 * - Interface Segregation (I): Uses specific parts of search context needed for display
 * - Dependency Inversion (D): Depends on abstractions (contexts, interfaces) not implementations
 * 
 * DRY (Don't Repeat Yourself) Principles Applied:
 * - Reusable UI components for typography and badges
 * - Centralized state management through context
 * - Consistent styling through Tailwind classes
 * - Common layout patterns for different states
 * 
 * Component States:
 * 1. Error State: Displays error message with suggestions
 * 2. Loading State: Shows progress indicator and partial results
 * 3. No Results State: Displays helpful message for empty results
 * 4. Results State: Renders grid of recipe cards with filters
 */

"use client" // Mark as client component for client-side interactivity

/**
 * Import Block
 * Purpose: Import necessary dependencies and components
 * - Context: Search state management
 * - Components: UI elements and recipe card
 * - Icons: Visual indicators
 */
import { useSearch } from "@/context/search-context"
import { RecipeCard } from "@/components/recipe-card"
import { TypographyH2, TypographyP } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

/**
 * SearchResults Component
 * Purpose: Display search results with various states and filter management
 * 
 * Features:
 * 1. Dynamic state rendering based on search context
 * 2. Progress indication during loading
 * 3. Filter management with removable badges
 * 4. Responsive grid layout for results
 * 5. Error handling and user feedback
 * 
 * @returns {JSX.Element} Rendered search results component
 */
export function SearchResults() {
  /**
   * Context Hook Usage
   * Purpose: Access search state and filter management
   * 
   * State Variables:
   * - recipes: Array of found recipes
   * - loading: Current loading state
   * - loadingProgress: Loading progress percentage
   * - error: Error message if present
   * - hasSearched: Whether a search has been performed
   * - searchQuery: Current search term
   * - selectedFilters: Active filter array
   * - setSelectedFilters: Filter update function
   */
  const { 
    recipes, 
    loading, 
    loadingProgress, 
    error, 
    hasSearched, 
    searchQuery, 
    selectedFilters, 
    setSelectedFilters 
  } = useSearch()

  /**
   * Filter Removal Handler
   * Purpose: Remove individual filters from the active set
   * 
   * @param {string} filterId - Identifier of filter to remove
   * Implementation: Creates new filter array excluding specified ID
   */
  const removeFilter = (filterId: string) => {
    setSelectedFilters(selectedFilters.filter((id) => id !== filterId))
  }

  /**
   * Error State Render
   * Purpose: Display error message with helpful suggestions
   * Features:
   * - Visual error indication
   * - Clear error message
   * - User guidance for next steps
   */
  if (error) {
    return (
      <div className="mt-8 p-4 bg-destructive/20 border border-destructive rounded-md text-destructive-foreground">
        <TypographyH2 className="mb-2">Error</TypographyH2>
        <TypographyP>{error}</TypographyP>
        <TypographyP className="mt-2">Please try a different search query or try again later.</TypographyP>
      </div>
    )
  }

  /**
   * Loading State Render
   * Purpose: Show loading progress and partial results
   * Features:
   * - Progress bar with percentage
   * - Dynamic loading message
   * - Partial results display if available
   */
  if (loading) {
    return (
      <div className="mt-8 flex flex-col items-center w-full max-w-md">
        <div className="loading-spinner mb-4"></div>
        <Progress value={loadingProgress} className="w-full h-2 mb-2" />
        <p className="text-sm text-muted-foreground">
          {loadingProgress < 100 ? `Finding recipes (${Math.round(loadingProgress)}%)...` : "Processing recipes..."}
        </p>

        {/* Partial Results Display
            Purpose: Show available results while loading continues
            Layout: Responsive grid with reduced opacity */}
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

  /**
   * No Results State Render
   * Purpose: Display message when search yields no results
   * Features:
   * - Shows searched term
   * - Provides guidance for modifying search
   */
  if (hasSearched && recipes.length === 0) {
    return (
      <div className="mt-8 p-4 bg-card border border-border rounded-md text-card-foreground">
        <TypographyP>
          No recipes found for "{searchQuery}". Please try different dietary requirements or cuisine preferences.
        </TypographyP>
      </div>
    )
  }

  /**
   * Initial State Handler
   * Purpose: Handle pre-search state
   * Implementation: Returns null when no search performed
   */
  if (!hasSearched) {
    return null
  }

  /**
   * Results State Render
   * Purpose: Display found recipes and active filters
   * Layout: 
   * - Responsive header with title and filters
   * - Grid layout for recipe cards
   * Features:
   * - Removable filter badges
   * - Responsive grid system
   * - Accessible filter removal
   */
  return (
    <div className="mt-8 w-full max-w-6xl">
      {/* Header Section
          Purpose: Display title and active filters
          Layout: Responsive flex container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <TypographyH2 className="mb-0">Recipes for You</TypographyH2>

        {/* Active Filters Display
            Purpose: Show and manage active filters
            Features: 
            - Interactive filter badges
            - Accessible remove buttons
            - Responsive layout */}
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

      {/* Results Grid
          Purpose: Display recipe cards in responsive grid
          Layout: 1 column mobile, 2 columns tablet, 3 columns desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
