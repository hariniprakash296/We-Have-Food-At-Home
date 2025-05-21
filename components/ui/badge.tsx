/**
 * Badge Component
 * 
 * A versatile badge component that follows SOLID principles:
 * 
 * Single Responsibility (S):
 * - Focused solely on displaying small status indicators or labels
 * - Each variant handles a specific visual style
 * 
 * Open/Closed (O):
 * - Extensible through variant system
 * - Customizable through className prop
 * - New variants can be added without modifying core code
 * 
 * Liskov Substitution (L):
 * - Maintains consistent behavior across all variants
 * - Preserves HTML div element behavior
 * 
 * Interface Segregation (I):
 * - Clean separation between variant props and HTML attributes
 * - Minimal required props for basic usage
 * 
 * Dependency Inversion (D):
 * - Relies on abstractions (cva) for variant management
 * - Styling abstracted through utility functions
 * 
 * DRY Principles:
 * - Shared base styles in variant definition
 * - Consistent hover state patterns
 * - Reusable className structures
 * 
 * Accessibility Features:
 * - Focus ring for keyboard navigation
 * - High contrast color combinations
 * - Readable text size
 * 
 * Usage Example:
 * ```tsx
 * <Badge>Default</Badge>
 * <Badge variant="secondary">Secondary</Badge>
 * <Badge variant="destructive">Destructive</Badge>
 * <Badge variant="outline">Outline</Badge>
 * ```
 */

import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge Variant System
 * 
 * Defines the visual styles for different badge types using class-variance-authority:
 * Base styles:
 * - Inline flex layout
 * - Rounded corners
 * - Consistent padding
 * - Small text size
 * - Focus states
 * 
 * Variants:
 * - default: Primary color with hover effect
 * - secondary: Secondary color scheme
 * - destructive: Error/warning style
 * - outline: Bordered appearance
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

/**
 * Badge Props Interface
 * 
 * Extends HTMLDivElement props with variant options:
 * @property {string} [className] - Additional CSS classes
 * @property {string} [variant] - Visual style variant
 *   - default: Primary style
 *   - secondary: Alternative style
 *   - destructive: Warning/error style
 *   - outline: Bordered style
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

/**
 * Badge Component
 * 
 * @component
 * @param {BadgeProps} props - Component props
 * 
 * Features:
 * - Multiple visual variants
 * - Hover state animations
 * - Focus ring for accessibility
 * - Flexible content support
 * - Responsive sizing
 * - High contrast text
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
