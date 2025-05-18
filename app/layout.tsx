import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Pacifico } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pacifico",
})

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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
}

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
