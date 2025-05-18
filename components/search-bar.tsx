"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearch } from "@/context/search-context"
import { useUI } from "@/context/ui-context"

export function SearchBar() {
  // Search domain state
  const { searchQuery, setSearchQuery, performSearch } = useSearch()
  // UI state (filter sheet)
  const { toggleFilter } = useUI()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="What's cooking?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-6 bg-background border-[1px] border-border rounded-lg text-lg placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
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
