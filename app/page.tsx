/**
 * Home Page
 *
 * This is the main landing page of the application that displays
 * the recipe search interface and search results.
 */

import { SearchProvider } from "@/context/search-context"
import { SearchBar } from "@/components/search-bar"
import { SearchResults } from "@/components/search-results"
import { ThemeToggle } from "@/components/theme-toggle"
import { UIProvider } from "@/context/ui-context"
import { FilterSidebar } from "@/components/filter-sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "We Have Food At Home",
  description: "Find recipes based on dietary requirements and cuisine preferences",
  keywords: ["recipes", "food", "cooking", "dietary requirements", "cuisine", "meal planning"],
  openGraph: {
    title: "We Have Food At Home",
    description: "Find recipes based on dietary requirements and cuisine preferences",
    type: "website",
  },
}

/**
 * Main page component for the search application
 * This renders the search interface with the search bar and results
 */
export default function SearchPage() {
  return (
    <SearchProvider>
      <UIProvider>
        {/* Theme toggle in the top-right corner */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Filter sidebar sheet – kept outside normal layout so it can overlay */}
        <FilterSidebar />

        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center gap-8">
            {/* Page title with Pacifico font */}
            <h1 className="font-pacifico text-7xl font-bold text-foreground text-center">
              We Have Food At Home
            </h1>

            {/* Search bar component */}
            <div className="w-full">
              <SearchBar />
            </div>

            {/* Search results component */}
            <div className="w-full">
              <SearchResults />
            </div>
          </div>
        </main>
      </UIProvider>
    </SearchProvider>
  )
}
