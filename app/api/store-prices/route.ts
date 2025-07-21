/**
 * Store Prices API Route
 *
 * POST /api/store-prices
 * Body: { itemName: string }
 * Response: { prices: { store: string; price: string; url?: string }[] }
 *
 * The route proxies the incoming request to Smithery AI's SeekEasy MCP service and
 * returns the JSON response to the frontend. We keep a minimal in-memory cache
 * (stale-while-revalidate style) so rapid re-renders of the same card do **not**
 * hammer the external API.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * 🛠  QUICK-START for new engineers
 *   1. Add the following to your local .env file **(never commit!)**
 *        SEEKEASY_API_KEY=<your-smithery-key>
 *        SEEKEASY_PROFILE=funny-beetle-rd4yUB    # optional – default used if unset
 *   2. Frontend usage is already wired via useStorePrices.ts → simply call:
 *        fetch("/api/store-prices", { method:"POST", body: JSON.stringify({ itemName }) })
 *   3. Runtime: Edge (fast, geo-distributed). If you need Node-specific APIs,
 *      move this file to /pages/api/ but ensure you remove this Edge version.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server"
import { z } from "zod"

export const runtime = "edge"
export const preferredRegion = "auto"
export const dynamic = "force-dynamic"
export const maxDuration = 15

/* ---------------------------------------------------------------------------
 * 1️⃣  Validate incoming body: must have non-empty itemName
 * ------------------------------------------------------------------------ */
const RequestSchema = z.object({
  itemName: z.string().min(1),
})

/* ---------------------------------------------------------------------------
 * Typed shape of price objects we return to the client. The Smithery API may
 * include additional fields – we only expose these three for now.
 * ------------------------------------------------------------------------ */
interface StorePrice {
  store: string
  price: string
  url?: string
}

interface CacheEntry {
  prices: StorePrice[]
  expiry: number // epoch millis when entry becomes stale
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

function normalizeKey(item: string) {
  return item.trim().toLowerCase()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parseResult = RequestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { itemName } = parseResult.data
    const cacheKey = normalizeKey(itemName)
    const cached = cache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      return NextResponse.json({ prices: cached.prices }, { headers: { "X-Cache": "HIT" } })
    }

    /* ---------------------------------------------------------------------
     *  🔑  Build request to Smithery SeekEasy MCP
     * ------------------------------------------------------------------ */
    const apiKey = process.env.SEEKEASY_API_KEY
    const profile = process.env.SEEKEASY_PROFILE || "funny-beetle-rd4yUB"

    if (!apiKey) {
      return NextResponse.json({ error: "SEEKEASY_API_KEY not set on server" }, { status: 500 })
    }

    // Official endpoint per Smithery docs
    const apiUrl = `https://server.smithery.ai/@seekeasy/seekeasy/mcp?api_key=${apiKey}&profile=${profile}`

    // Forward the POST with required body shape { item: itemName }
    const externalResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ item: itemName }),
    })

    if (!externalResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch prices" }, { status: 502 })
    }

    const externalData = await externalResponse.json()

    /* -------------------------------------------------------------------
     * Normalize Smithery response → our StorePrice[]  (top 3 only)
     * Field names may evolve; adjust mapping if the upstream API changes.
     * ---------------------------------------------------------------- */
    const prices: StorePrice[] = (externalData.results || externalData.prices || externalData.data || [])
      .slice(0, 3)
      .map((p: any) => ({
        store: p.store || p.vendor || "Unknown",
        price: p.price || p.cost || "$-",
        url: p.url || p.link || undefined,
      }))

    // Cache and send response
    cache.set(cacheKey, { prices, expiry: Date.now() + CACHE_TTL })

    return NextResponse.json({ prices }, { headers: { "X-Cache": "MISS" } })
  } catch (error) {
    console.error("/api/store-prices error", error)
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
} 