/**
 * useStorePrices Hook
 *
 * Fetches best store prices for a given recipe (via Smithery AI Seekeasy MCP proxy).
 * Mirrors the API/state shape of existing useImageGeneration for consistency.
 */

import { useState, useCallback, useRef } from "react"
import type { StorePrice } from "@/components/recipe-card"
import { getSeekeasyClient } from "@/lib/seekeasyClient"
// Simple in-memory cache shared across all hook instances to avoid duplicate fetches
const priceCache = new Map<string, { prices: StorePrice[]; error?: string }>()

interface UseStorePricesReturn {
  storePrices: StorePrice[]
  isLoading: boolean
  error: string | null
  fetchStorePrices: (itemName: string) => Promise<void>
}

/**
 * Custom hook for retrieving store-price data.
 */
export function useStorePrices(): UseStorePricesReturn {
  const [storePrices, setStorePrices] = useState<StorePrice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Guard to ensure we attempt the fetch only once per component lifecycle
  const attemptedRef = useRef(false)

  /**
   * Fetch top-3 store prices for a recipe / item.
   */
  const fetchStorePrices = useCallback(async (itemName: string) => {
    if (!itemName) return

    // Normalise as cache key
    const cacheKey = itemName.trim().toLowerCase()

    // Early exit if we've already tried during this component lifecycle
    if (attemptedRef.current) return

    // Return cached response if available
    const cached = priceCache.get(cacheKey)
    if (cached) {
      setStorePrices(cached.prices)
      setError(cached.error ?? null)
      attemptedRef.current = true
      return
    }

    attemptedRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      // 1️⃣  Connect to the Smithery MCP server (singleton)
      const client = await getSeekeasyClient()

      // 2️⃣  Call the SeekEasy price-lookup tool
      //     ‣ The exact tool name may evolve; adjust if Smithery changes it.
      // Use `callTool` per MCP SDK
      const raw = await (client as any).callTool({
        name: "@seekeasy/seekeasy.prices",
        arguments: {
          item: itemName,
        },
      })

      // 3️⃣  Normalise the response ⇒ StorePrice[]
      const rawPrices = (raw as any)?.prices || (raw as any)?.results || (raw as any)?.data || []

      const prices: StorePrice[] = rawPrices.slice(0, 3).map((p: any) => ({
        store: p.store || p.vendor || "Unknown",
        price: p.price || p.cost || "$-",
        url: p.url || p.link || undefined,
      }))

      setStorePrices(prices)
      priceCache.set(cacheKey, { prices })
    } catch (err) {
      console.error("useStorePrices error", err)
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      setStorePrices([])
      priceCache.set(cacheKey, { prices: [], error: message })
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    storePrices,
    isLoading,
    error,
    fetchStorePrices,
  }
} 