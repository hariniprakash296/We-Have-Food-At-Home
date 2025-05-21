/**
 * ROOT LAYOUT COMPONENT
 * 
 * SOLID Principles Applied:
 * - Single Responsibility (S): This layout component is solely responsible for defining the root structure and theme setup
 * - Open/Closed (O): The layout is open for extension (via children prop) but closed for modification
 * - Liskov Substitution (L): Any React component can be passed as children without breaking the layout
 * - Interface Segregation (I): The component accepts only the necessary props (children)
 * - Dependency Inversion (D): High-level theme configuration is injected via ThemeProvider
 * 
 * DRY (Don't Repeat Yourself) Principles Applied:
 * - Common styling and theme configuration centralized in this layout
 * - Font configurations defined once and reused throughout the app
 * - Metadata and viewport configurations centralized for entire application
 */

import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Pacifico } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

/**
 * Font Configuration Block
 * Purpose: Configure and optimize the Inter font for consistent typography
 * - subsets: Specifies which character sets to include (latin for English)
 * - display: 'swap' ensures text remains visible during font loading
 * - variable: Creates a CSS variable for use throughout the app
 */
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

/**
 * Secondary Font Configuration
 * Purpose: Setup Pacifico font for decorative elements
 * - weight: Specifies the font weight to load (400 is regular)
 * - Similar configuration pattern as Inter for consistency
 */
const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pacifico",
})

/**
 * Metadata Configuration Block
 * Purpose: Define SEO and social media metadata for the entire application
 * - Implements comprehensive meta tags for better SEO
 * - Includes OpenGraph and Twitter card configurations for social sharing
 * - Centralizes all meta information in one place (DRY principle)
 */
export const metadata: Metadata = {
  title: {
    default: "We Have Food At Home",
    template: "%s | We Have Food At Home",
  },
  description: "Find recipes based on dietary requirements and cuisine preferences",
  keywords: ["recipes", "food", "cooking", "dietary requirements", "cuisine", "meal planning"],
  authors: [{ name: "We Have Food At Home Team" }],
  creator: "We Have Food At Home Team",
  generator: "v0.dev",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wehavefooodathome.com",
    title: "We Have Food At Home",
    description: "Find recipes based on dietary requirements and cuisine preferences",
    siteName: "We Have Food At Home",
  },
  twitter: {
    card: "summary_large_image",
    title: "We Have Food At Home",
    description: "Find recipes based on dietary requirements and cuisine preferences",
  },
}

/**
 * Viewport Configuration Block
 * Purpose: Define responsive design and theme color settings
 * - Implements responsive viewport settings for mobile optimization
 * - Configures theme colors for light/dark mode
 * - Ensures proper scaling on different devices
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
}

/**
 * Root Layout Component
 * Purpose: Serve as the main layout wrapper for the entire application
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be rendered within the layout
 * 
 * Key Features:
 * 1. Sets up HTML document structure with language and accessibility attributes
 * 2. Configures font variables and applies them globally
 * 3. Implements dark mode by default
 * 4. Wraps the application in ThemeProvider for consistent theming
 * 5. Applies base styling including antialiasing and minimum height
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${pacifico.variable} dark`}>
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
