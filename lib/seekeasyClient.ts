/**
 * SeekEasy MCP client helper
 * -------------------------------------------------------------
 * Exposes a single async function `getSeekeasyClient()` that returns a
 * connected instance of the MCP `Client`. The first call performs the
 * OAuth negotiation; subsequent calls reuse the same connection.
 *
 * This module is intended for **browser** usage only. If you import it
 * from the server (e.g. during Next.js SSR), the constructor guard will
 * throw to avoid accidental window / localStorage access.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { BrowserOAuthProvider } from "@/lib/auth/BrowserOAuthProvider"

// Endpoint that exposes the MCP interface for the SeekEasy tool-set
const MCP_ENDPOINT = "https://smithery.ai/server/@seekeasy/seekeasy"

let client: Client | undefined
let connectPromise: Promise<Client> | undefined

/**
 * Returns a connected MCP client instance (singleton).
 */
export async function getSeekeasyClient(): Promise<Client> {
  if (typeof window === "undefined") {
    throw new Error("getSeekeasyClient() should only be called in the browser")
  }

  // Reuse the existing connection if we already have one --------------------
  if (client) return client
  if (connectPromise) return connectPromise!

  // Create transport with BrowserOAuthProvider (handles the PKCE flow)
  // SDK may expect either `string` or `URL`; cast to `any` to satisfy TS until
  // upstream typings are updated.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transport = new StreamableHTTPClientTransport(MCP_ENDPOINT as any, {
    authProvider: new BrowserOAuthProvider("https://server.smithery.ai", "We-Have-Food-At-Home"),
  })

  client = new Client(
    { name: "we-have-food-at-home", version: "1.0.0" },
    { capabilities: {} }        // minimal capabilities for now
  )
  // Wrap the connect() call so that the resulting promise resolves with the
  // connected client instance (typed correctly as `Client`).
  connectPromise = (async (): Promise<Client> => {
    await client.connect(transport)
    return client
  })()

  return connectPromise!
} 