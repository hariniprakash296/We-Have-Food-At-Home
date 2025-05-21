/**
 * HOME PAGE COMPONENT
 * 
 * SOLID Principles Applied:
 * - Single Responsibility (S): This page is solely responsible for composing the main search interface
 * - Open/Closed (O): The page structure allows adding new features without modifying existing ones
 * - Liskov Substitution (L): All components (SearchBar, SearchResults, etc.) can be substituted with similar implementations
 * - Interface Segregation (I): Components receive only the props they need through contexts
 * - Dependency Inversion (D): High-level components depend on abstractions (contexts) not concrete implementations
 * 
 * DRY (Don't Repeat Yourself) Principles Applied:
 * - Reusable components extracted (SearchBar, SearchResults, FilterSidebar)
 * - Common state management through contexts
 * - Consistent styling through Tailwind classes
 * - Metadata configuration follows the same pattern as layout
 */

/**
 * Import Block
 * Purpose: Import all necessary components and contexts
 * - Components are imported from their respective files for modularity
 * - Contexts provide state management across components
 * - Metadata type from Next.js for page-specific meta tags
 */
import { SearchProvider } from "@/context/search-context"
import { SearchBar } from "@/components/search-bar"
import { SearchResults } from "@/components/search-results"
import { ThemeToggle } from "@/components/theme-toggle"
import { UIProvider } from "@/context/ui-context"
import { FilterSidebar } from "@/components/filter-sidebar"
import type { Metadata } from "next"

/**
 * Page-specific Metadata Configuration
 * Purpose: Define SEO metadata specific to the home page
 * - Overrides default metadata from layout for this specific route
 * - Maintains consistency with the application's SEO strategy
 * - Follows DRY principle by reusing metadata structure
 */
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
 * SearchPage Component
 * Purpose: Main page component that composes the search interface
 * 
 * Component Structure:
 * 1. Context Providers
 *    - SearchProvider: Manages search state and logic
 *    - UIProvider: Manages UI state (modals, sidebars, etc.)
 * 
 * 2. Layout Elements:
 *    - Theme Toggle: Fixed position in top-right
 *    - Filter Sidebar: Overlay component for filters
 *    - Main Content: Centered flex container
 * 
 * 3. Main Content Components:
 *    - Title: Uses custom Pacifico font
 *    - SearchBar: User input interface
 *    - SearchResults: Displays search results
 * 
 * Key Features:
 * - Responsive layout using Tailwind classes
 * - Consistent spacing and alignment
 * - Proper component hierarchy for state management
 * - Accessibility considerations in structure
 */
export default function SearchPage() {
  return (
    <SearchProvider>
      <UIProvider>
        {/* Theme Toggle Component
           Purpose: Allow users to switch between light/dark modes
           Position: Fixed to top-right corner with high z-index for visibility */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Filter Sidebar Component
           Purpose: Provide advanced filtering options
           Position: Outside main layout for proper overlay behavior */}
        <FilterSidebar />

        {/* Main Content Area
           Purpose: Primary container for search interface
           Layout: Centered flex container with responsive padding */}
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center gap-8">
            {/* Application Title
               Purpose: Main heading with custom font
               Style: Large, bold text using Pacifico font for brand identity */}
            <h1 className="font-pacifico text-7xl font-bold text-foreground text-center">
              We Have Food At Home
            </h1>

            {/* Search Interface Container
               Purpose: Wrapper for search functionality
               Layout: Full width container for consistent sizing */}
            <div className="w-full">
              <SearchBar />
            </div>

            {/* Results Container
               Purpose: Display search results
               Layout: Full width container for result cards */}
            <div className="w-full">
              <SearchResults />
            </div>
          </div>
        </main>
      </UIProvider>
    </SearchProvider>
  )
}
