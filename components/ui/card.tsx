/**
 * CARD COMPONENTS
 * 
 * SOLID Principles Applied:
 * - Single Responsibility (S): Each component handles one specific part of the card structure
 * - Open/Closed (O): Styles can be extended via className prop without modifying base components
 * - Liskov Substitution (L): All card components follow same HTML div interface
 * - Interface Segregation (I): Components use minimal required HTML div attributes
 * - Dependency Inversion (D): Components depend on React's core abstractions
 * 
 * DRY (Don't Repeat Yourself) Principles Applied:
 * - Common forwarded ref pattern across components
 * - Shared className merging utility
 * - Consistent prop spreading pattern
 * - Reusable Tailwind classes
 * 
 * Based on Shadcn UI Card Component:
 * @see https://ui.shadcn.com/docs/components/card
 * 
 * Accessibility Features:
 * - Semantic structure
 * - Color contrast compliance
 * - Keyboard navigation support
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card Component
 * Purpose: Container component for card-based information display
 * 
 * Features:
 * - Rounded corners
 * - Border and shadow
 * - Background and text colors
 * - Flexible content structure
 * 
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Component properties
 * @param {React.Ref<HTMLDivElement>} ref - Forward ref for div element
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader Component
 * Purpose: Top section of card for titles and descriptions
 * 
 * Features:
 * - Flex column layout
 * - Consistent spacing
 * - Standard padding
 * 
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Component properties
 * @param {React.Ref<HTMLDivElement>} ref - Forward ref for div element
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle Component
 * Purpose: Main heading for card content
 * 
 * Features:
 * - Large text size
 * - Semibold weight
 * - Tight line height
 * - Custom tracking
 * 
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Component properties
 * @param {React.Ref<HTMLDivElement>} ref - Forward ref for div element
 */
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription Component
 * Purpose: Secondary text content below title
 * 
 * Features:
 * - Smaller text size
 * - Muted color
 * - Proper contrast
 * 
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Component properties
 * @param {React.Ref<HTMLDivElement>} ref - Forward ref for div element
 */
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent Component
 * Purpose: Main content area of the card
 * 
 * Features:
 * - Consistent padding
 * - Removed top padding
 * - Flexible content area
 * 
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Component properties
 * @param {React.Ref<HTMLDivElement>} ref - Forward ref for div element
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter Component
 * Purpose: Bottom section of card for actions or additional info
 * 
 * Features:
 * - Flex layout for items
 * - Consistent padding
 * - Removed top padding
 * - Aligned items center
 * 
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Component properties
 * @param {React.Ref<HTMLDivElement>} ref - Forward ref for div element
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
