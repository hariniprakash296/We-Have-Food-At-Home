"use client"

import * as React from "react"

/**
 * UIContextType defines UI-level state shared across components (non-domain specific).
 */
interface UIContextType {
  /** Whether the filter sidebar sheet is open */
  isFilterOpen: boolean
  /** Toggle the filter sidebar */
  toggleFilter: () => void
  /** Imperative setter for advanced cases */
  setFilterOpen: (open: boolean) => void
}

// Create context with sensible defaults (these will never be used – provider overrides them)
const UIContext = React.createContext<UIContextType>({
  isFilterOpen: false,
  toggleFilter: () => {},
  setFilterOpen: () => {},
})

/**
 * Custom hook to access UI context.
 * Throws error if accessed outside provider – ensures correct usage.
 */
export function useUI() {
  const ctx = React.useContext(UIContext)
  if (!ctx) {
    throw new Error("useUI must be used within a UIProvider")
  }
  return ctx
}

/**
 * UIProvider – wraps children and supplies UI-level state.
 */
export function UIProvider({ children }: { children: React.ReactNode }) {
  // --- State ---------------------------------------------------------------
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  // --- Memoised helpers ----------------------------------------------------
  const toggleFilter = React.useCallback(() => {
    setIsFilterOpen((prev) => !prev)
  }, [])

  // Compose value object – stable across renders except when deps change
  const value = React.useMemo(
    () => ({
      isFilterOpen,
      toggleFilter,
      setFilterOpen: setIsFilterOpen,
    }),
    [isFilterOpen, toggleFilter],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
} 