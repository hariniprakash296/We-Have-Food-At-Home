"use client"

import type React from "react"
import { useState, type KeyboardEvent, useRef, useEffect } from "react"
import { useSearch } from "@/context/search-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import { FilterSidebar } from "@/components/filter-sidebar"

/**
 * SearchBar component that provides an input field and button for searching
 * This component handles user input and triggers the search functionality
 */
export function SearchBar() {
  // Get the necessary state and functions from the search context
  const { setQuery, performSearch, loading, selectedFilters, setSelectedFilters } = useSearch()

  // Local state to track input value (for controlled component)
  const [inputValue, setInputValue] = useState("")

  // State for filter sidebar visibility
  const [filterOpen, setFilterOpen] = useState(false)

  // Reference to store the timeout ID
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // Reference to store the abort controller
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Handle input change events
   * Updates the local input value state as the user types
   * @param e - The change event from the input element
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  /**
   * Handle the search submission
   * Updates the context query and triggers the search
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create a new abort controller
    abortControllerRef.current = new AbortController()

    // Set a new timeout (300ms debounce)
    debounceTimerRef.current = setTimeout(() => {
      performSearch(inputValue)
    }, 300)
  }

  /**
   * Handle key press events in the input field
   * Allows users to press Enter to trigger the search
   * @param e - The keyboard event from the input element
   */
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch(e)
    }
  }

  /**
   * Handle filter changes
   * @param filters - The new selected filters
   */
  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="flex w-full max-w-xl gap-2 mb-8">
      {/* Search input with icon */}
      <div className="relative flex-grow">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Search size={18} />
        </div>
        <Input
          type="text"
          placeholder="What's cooking?"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-4 py-6 rounded-full bg-card border-gray-700 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={loading}
          aria-label="Search query"
        />
      </div>

      {/* Filter button with badge for selected filters count */}
      <Button
        onClick={() => setFilterOpen(true)}
        disabled={loading}
        size="icon"
        variant="outline"
        className="rounded-full h-12 w-12 bg-card border-gray-700 hover:bg-gray-800 relative"
        aria-label="Filter options"
      >
        <SlidersHorizontal size={18} />
        {selectedFilters.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-300 via-orange-200 to-yellow-200 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {selectedFilters.length}
          </span>
        )}
      </Button>

      {/* Filter sidebar component */}
      <FilterSidebar
        open={filterOpen}
        onOpenChange={setFilterOpen}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
      />
    </div>
  )
}
