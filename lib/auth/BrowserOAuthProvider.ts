/**
 * BrowserOAuthProvider
 * -----------------------------------------------------------
 * Implements the `OAuthClientProvider` interface from the MCP SDK.
 * This provider is intended for browser-only usage. It persists
 * client information and OAuth tokens to `localStorage` so that the
 * user only needs to authorise the application the first time.
 *
 * The implementation follows the reference code in Smithery docs.
 */

// SDK Types --------------------------------------------------
import type { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js"
import type {
  OAuthClientInformation,
  OAuthClientMetadata,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js"

/**
 * Lightweight helper: safely access `localStorage` – it does not exist
 * during Server-Side Rendering. All code paths that reference storage
 * are wrapped in `typeof window !== "undefined"` guards.
 */
function safeLocalStorage(): Storage | null {
  return typeof window !== "undefined" ? window.localStorage : null
}

export class BrowserOAuthProvider implements OAuthClientProvider {
  private _tokens?: OAuthTokens
  private _clientInfo?: OAuthClientInformation
  private _codeVerifier?: string

  constructor(
    /** Base URL of the Smithery server, e.g. `https://server.smithery.ai` */
    private readonly serverUrl: string,
    /** A human-readable name shown on the Smithery authorisation page. */
    private readonly clientName = "We-Have-Food-At-Home"
  ) {
    // Attempt to hydrate previously saved tokens --------------------------------
    const storage = safeLocalStorage()
    if (storage) {
      const stored = storage.getItem(`mcp_tokens_${this.serverUrl}`)
      if (stored) {
        try {
          this._tokens = JSON.parse(stored) as OAuthTokens
        } catch {
          // ignore – corrupted entry
        }
      }
    }
  }

  /* -------------------------------------------------------------------------
   *  Required interface implementation
   * ---------------------------------------------------------------------- */

  /** Redirect URL for the OAuth PKCE flow. */
  get redirectUrl(): string {
    // e.g. https://myapp.com/oauth/callback
    if (typeof window === "undefined") return "" // SSR safeguard
    return `${window.location.origin}/oauth/callback`
  }

  /** Metadata that is sent to the Smithery server when registering the client. */
  get clientMetadata(): OAuthClientMetadata {
    if (typeof window === "undefined") {
      // Provide minimal info during SSR; this will be recalculated in the browser.
      return {
        client_name: this.clientName,
        client_uri: "",
        redirect_uris: [],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        scope: "read write",
        token_endpoint_auth_method: "none",
      }
    }

    return {
      client_name: this.clientName,
      client_uri: window.location.origin,
      redirect_uris: [this.redirectUrl],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      scope: "read write",
      token_endpoint_auth_method: "none",
    }
  }

  /* ---- Client Information -------------------------------------------------- */
  clientInformation(): OAuthClientInformation | undefined {
    return this._clientInfo
  }

  async saveClientInformation(info: OAuthClientInformation): Promise<void> {
    this._clientInfo = info
  }

  /* ---- Tokens -------------------------------------------------------------- */
  tokens(): OAuthTokens | undefined {
    return this._tokens
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    this._tokens = tokens
    const storage = safeLocalStorage()
    if (storage) {
      storage.setItem(`mcp_tokens_${this.serverUrl}`, JSON.stringify(tokens))
    }
  }

  /* ---- PKCE helpers -------------------------------------------------------- */
  async saveCodeVerifier(verifier: string): Promise<void> {
    this._codeVerifier = verifier
  }

  async codeVerifier(): Promise<string> {
    if (!this._codeVerifier) throw new Error("No code verifier stored")
    return this._codeVerifier
  }

  /* ---- Browser Redirect ---------------------------------------------------- */
  async redirectToAuthorization(url: URL): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("Attempted to redirect during SSR – this provider is browser-only")
    }
    window.location.href = url.toString()
  }
} 