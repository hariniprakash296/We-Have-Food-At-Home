/**
 * SEARCH BAR COMPONENT
 * 
 * SOLID Principles Applied:
 * - Single Responsibility (S): Component solely handles search input and filter toggle
 * - Open/Closed (O): Search functionality can be extended without modifying the component
 * - Liskov Substitution (L): Component can be replaced with any other search interface
 * - Interface Segregation (I): Uses specific hooks (useSearch, useUI) for required functionality
 * - Dependency Inversion (D): Depends on abstractions (contexts) rather than concrete implementations
 * 
 * DRY (Don't Repeat Yourself) Principles Applied:
 * - Reuses UI components from component library
 * - Centralizes search logic in context
 * - Consistent styling through Tailwind classes
 * - Single event handler for form submission
 */

"use client" // Mark as client component for client-side interactivity

/**
 * Import Block
 * Purpose: Import necessary dependencies and components
 * - React: Core React functionality
 * - lucide-react: Icon components
 * - UI Components: Reusable UI elements
 * - Context Hooks: State management
 */
import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearch } from "@/context/search-context"
import { useUI } from "@/context/ui-context"

/**
 * SearchBar Component
 * Purpose: Provide a search interface with filter toggle
 * 
 * Features:
 * 1. Search input field with icon
 * 2. Filter toggle button
 * 3. Form submission handling
 * 4. Keyboard accessibility
 * 
 * State Management:
 * - Uses SearchContext for search functionality
 * - Uses UIContext for filter panel visibility
 */
export function SearchBar() {
  /**
   * Hook Usage
   * - searchQuery: Current search input value
   * - setSearchQuery: Update search input
   * - performSearch: Execute search operation
   * - toggleFilter: Toggle filter panel visibility
   */
  const { searchQuery, setSearchQuery, performSearch } = useSearch()
  const { toggleFilter } = useUI()

  /**
   * Form Submit Handler
   * Purpose: Process search form submission
   * 
   * @param {React.FormEvent} e - Form submission event
   * - Prevents default form submission
   * - Validates input is not empty
   * - Triggers search operation
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      {/* Search Container
          Purpose: Wrapper for search input and filter button
          Layout: Flex container for horizontal alignment */}
      <div className="relative flex items-center">
        {/* Search Input Container
            Purpose: Wrapper for input and search icon
            Layout: Relative positioning for icon placement */}
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="What's cooking?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-6 bg-background border-[1px] border-border rounded-lg text-lg placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
          {/* Search Icon
              Purpose: Visual indicator for search functionality
              Position: Absolutely positioned within input container */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        {/* Filter Toggle Button
            Purpose: Toggle filter panel visibility
            Features: 
            - Keyboard accessibility
            - Screen reader support
            - Custom icon */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="ml-2 h-[52px] w-[52px] border-[1px] border-border"
          onClick={toggleFilter}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              toggleFilter()
            }
          }}
        >
          <span className="sr-only">Open filters</span>
          {/* Filter Icon SVG
              Purpose: Visual representation of filter functionality
              Accessibility: Hidden from screen readers (handled by sr-only span) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
