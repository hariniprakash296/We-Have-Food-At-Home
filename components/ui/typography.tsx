/**
 * TYPOGRAPHY COMPONENTS
 * 
 * SOLID Principles Applied:
 * - Single Responsibility (S): Each typography component handles one specific text style
 * - Open/Closed (O): Styles can be extended via className prop without modifying base styles
 * - Liskov Substitution (L): All typography components follow same props interface
 * - Interface Segregation (I): Components use minimal required props (children and className)
 * - Dependency Inversion (D): Components depend on abstractions (TypographyProps interface)
 * 
 * DRY (Don't Repeat Yourself) Principles Applied:
 * - Common interface for all typography components
 * - Shared utility function (cn) for class name merging
 * - Consistent prop pattern across components
 * - Reusable Tailwind classes for common styles
 * 
 * Based on Shadcn UI Typography Component:
 * @see https://ui.shadcn.com/docs/components/typography
 */

import type React from "react"
import { cn } from "@/lib/utils"

/**
 * Typography Props Interface
 * Purpose: Define common props for all typography components
 * 
 * @property {React.ReactNode} children - Content to be rendered
 * @property {string} [className] - Optional additional CSS classes
 */
interface TypographyProps {
  children: React.ReactNode
  className?: string
}

/**
 * H1 Typography Component
 * Purpose: Main heading with largest size
 * 
 * Styling Features:
 * - Responsive text size (4xl to 5xl)
 * - Extra bold weight
 * - Tight letter spacing
 * - Scroll margin for better anchor positioning
 * 
 * @param {TypographyProps} props - Component properties
 */
export function TypographyH1({ children, className }: TypographyProps) {
  return <h1 className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}>{children}</h1>
}

/**
 * H2 Typography Component
 * Purpose: Secondary heading with border
 * 
 * Styling Features:
 * - Bottom border
 * - Semibold weight
 * - Removes top margin from first instance
 * - Consistent scroll margin
 */
export function TypographyH2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0", className)}>
      {children}
    </h2>
  )
}

/**
 * H3 Typography Component
 * Purpose: Tertiary heading
 * 
 * Styling Features:
 * - Medium-large text size
 * - Semibold weight
 * - Consistent tracking and scroll margin
 */
export function TypographyH3({ children, className }: TypographyProps) {
  return <h3 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}>{children}</h3>
}

/**
 * H4 Typography Component
 * Purpose: Quaternary heading
 * 
 * Styling Features:
 * - Standard large text size
 * - Semibold weight
 * - Maintains heading hierarchy
 */
export function TypographyH4({ children, className }: TypographyProps) {
  return <h4 className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}>{children}</h4>
}

/**
 * Paragraph Typography Component
 * Purpose: Standard body text
 * 
 * Styling Features:
 * - Comfortable line height
 * - Adds top margin to subsequent paragraphs
 * - Maintains readability
 */
export function TypographyP({ children, className }: TypographyProps) {
  return <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>{children}</p>
}

/**
 * Blockquote Typography Component
 * Purpose: Quoted or referenced text
 * 
 * Styling Features:
 * - Left border for visual distinction
 * - Italic text style
 * - Consistent spacing
 */
export function TypographyBlockquote({ children, className }: TypographyProps) {
  return <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)}>{children}</blockquote>
}

/**
 * List Typography Component
 * Purpose: Unordered list with bullets
 * 
 * Styling Features:
 * - Disc-style bullets
 * - Consistent item spacing
 * - Left margin for alignment
 */
export function TypographyList({ children, className }: TypographyProps) {
  return <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}>{children}</ul>
}

/**
 * Inline Code Typography Component
 * Purpose: Code snippets within text
 * 
 * Styling Features:
 * - Monospace font
 * - Background highlight
 * - Rounded corners
 * - Proper padding for readability
 */
export function TypographyInlineCode({ children, className }: TypographyProps) {
  return (
    <code
      className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)}
    >
      {children}
    </code>
  )
}

/**
 * Lead Typography Component
 * Purpose: Introductory or emphasized text
 * 
 * Styling Features:
 * - Larger text size
 * - Muted color for visual hierarchy
 * - Maintains readability
 */
export function TypographyLead({ children, className }: TypographyProps) {
  return <p className={cn("text-xl text-muted-foreground", className)}>{children}</p>
}

/**
 * Large Typography Component
 * Purpose: Emphasized text blocks
 * 
 * Styling Features:
 * - Large text size
 * - Semibold weight
 * - Flexible container (div)
 */
export function TypographyLarge({ children, className }: TypographyProps) {
  return <div className={cn("text-lg font-semibold", className)}>{children}</div>
}

/**
 * Small Typography Component
 * Purpose: De-emphasized or supplementary text
 * 
 * Styling Features:
 * - Small text size
 * - Medium weight
 * - Compact line height
 */
export function TypographySmall({ children, className }: TypographyProps) {
  return <small className={cn("text-sm font-medium leading-none", className)}>{children}</small>
}

/**
 * Muted Typography Component
 * Purpose: Secondary or supporting text
 * 
 * Styling Features:
 * - Small text size
 * - Muted color
 * - Maintains readability
 */
export function TypographyMuted({ children, className }: TypographyProps) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
}
