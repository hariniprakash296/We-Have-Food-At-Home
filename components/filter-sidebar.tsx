"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

// Import UI context for sheet open state
import { useUI } from "@/context/ui-context"
import { useSearch } from "@/context/search-context"

// Define filter categories and options
const filterCategories = [
  {
    name: "PREFER",
    options: [
      { id: "vegetarian", label: "Vegetarian", emoji: "🥗" },
      { id: "vegan", label: "Vegan", emoji: "🌱" },
      { id: "pescatarian", label: "Pescatarian", emoji: "🐟" },
      { id: "kosher", label: "Kosher", emoji: "✡️" },
      { id: "halal", label: "Halal", emoji: "☪️" },
      { id: "plant-forward", label: "Plant-forward", emoji: "🥕" },
      { id: "low-carb", label: "Low-carb", emoji: "🥦" },
      { id: "low-sugar", label: "Low-sugar", emoji: "🍃" },
    ],
  },
  {
    name: "AVOID",
    options: [
      { id: "gluten", label: "Gluten", emoji: "⚡" },
      { id: "lactose", label: "Lactose", emoji: "🥛" },
      { id: "peanuts", label: "Peanuts", emoji: "🥜" },
      { id: "tree-nuts", label: "Tree nuts", emoji: "🌰" },
      { id: "fish", label: "Fish", emoji: "🐠" },
      { id: "shellfish", label: "Shellfish", emoji: "🦐" },
      { id: "alcohol", label: "Alcohol", emoji: "🍺" },
    ],
  },
  {
    name: "CRAVE",
    options: [
      { id: "beef", label: "Beef", emoji: "🥩" },
      { id: "bread", label: "Bread", emoji: "🍞" },
      { id: "cheese", label: "Cheese", emoji: "🧀" },
      { id: "condiments", label: "Condiments", emoji: "🧂" },
      { id: "crudo", label: "Crudo", emoji: "🍣" },
      { id: "pasta", label: "Pasta", emoji: "🍝" },
      { id: "pastry", label: "Pastry", emoji: "🥐" },
      { id: "pizza", label: "Pizza", emoji: "🍕" },
      { id: "pork", label: "Pork", emoji: "🐖" },
      { id: "poultry", label: "Poultry", emoji: "🍗" },
      { id: "rice", label: "Rice", emoji: "🍚" },
      { id: "salad", label: "Salad", emoji: "🥗" },
      { id: "sandwich", label: "Sandwich", emoji: "🥪" },
    ],
  },
]

/**
 * FilterSidebar component
 * Displays a sidebar with filter options for dietary preferences
 */
export function FilterSidebar() {
  // Consume UI context for open state management
  const { isFilterOpen, setFilterOpen } = useUI()

  // ----- Access search context to mutate selectedFilters -----------
  // We keep responsibility separation: UI context toggles sheet, but the filter
  // selections themselves still live in search context.
  const { selectedFilters, setSelectedFilters } = useSearch()

  // Local state to track selected filters within the component
  const [localSelectedFilters, setLocalSelectedFilters] = useState<string[]>(selectedFilters)

  // Sync local state with props when they change
  useEffect(() => {
    setLocalSelectedFilters(selectedFilters)
  }, [selectedFilters])

  // Toggle a filter selection
  const toggleFilter = (filterId: string) => {
    // Create new array with filter added or removed
    const newFilters = localSelectedFilters.includes(filterId)
      ? localSelectedFilters.filter((id) => id !== filterId)
      : [...localSelectedFilters, filterId]

    // Update local state
    setLocalSelectedFilters(newFilters)
    // Call the parent's onChange handler
    setSelectedFilters(newFilters)
  }

  return (
    <Sheet open={isFilterOpen} onOpenChange={setFilterOpen}>
      <SheetContent
        side="right"
        className="w-[300px] sm:w-[350px] bg-black border-l border-gray-800 p-0"
        aria-describedby="filter-description"
      >
        <SheetHeader className="p-4 border-b border-gray-800">
          <SheetTitle className="text-white flex items-center gap-2">
            <ChevronLeft className="h-5 w-5" />
            Filters
          </SheetTitle>
          <SheetDescription id="filter-description" className="text-gray-400">
            Select dietary preferences and food options to filter your recipe search
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100vh-70px)]">
          {filterCategories.map((category) => (
            <div key={category.name} className="p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold mb-4">{category.name}</h3>
              <div className="flex flex-wrap gap-2">
                {category.options.map((option) => {
                  const isSelected = localSelectedFilters.includes(option.id)
                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFilter(option.id)}
                      className={cn(
                        "rounded-full border border-gray-700 bg-gray-900 text-white hover:bg-gray-800",
                        isSelected && "bg-white text-black border-white",
                      )}
                    >
                      <span className="mr-1">{option.emoji}</span> {option.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
