import { SearchProvider } from "@/context/search-context"
import { SearchBar } from "@/components/search-bar"
import { SearchResults } from "@/components/search-results"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "We Have Food At Home",
  description: "Find recipes based on dietary requirements and cuisine preferences",
}

/**
 * Main page component for the search application
 * This renders the search interface with the search bar and results
 */
export default function SearchPage() {
  return (
    // Wrap the page content with the SearchProvider to provide context
    <SearchProvider>
      {/* Theme toggle in the top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen flex-col items-center justify-start pt-16 p-4">
        <div className="search-container">
          {/* Page title - now with plain white text instead of gradient */}
          <h1 className="text-6xl font-bold mb-8 text-white">We Have Food At Home</h1>

          {/* Search bar component */}
          <SearchBar />

          {/* Search results component */}
          <SearchResults />
        </div>
      </main>
    </SearchProvider>
  )
}
