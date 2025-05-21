/**
 * BUTTON COMPONENT
 * 
 * SOLID Principles Applied:
 * - Single Responsibility (S): Component solely handles button styling and interactions
 * - Open/Closed (O): Variants and sizes can be extended without modifying core functionality
 * - Liskov Substitution (L): Can be used as button or other element via asChild prop
 * - Interface Segregation (I): Props interface extends only necessary HTML button attributes
 * - Dependency Inversion (D): Depends on abstractions (ButtonProps interface, Slot component)
 * 
 * DRY (Don't Repeat Yourself) Principles Applied:
 * - Centralized variant definitions using cva
 * - Reusable className utility
 * - Common styles shared across variants
 * - Consistent prop patterns
 * 
 * Based on Shadcn UI Button Component:
 * @see https://ui.shadcn.com/docs/components/button
 * 
 * Accessibility Features:
 * - Focus visible states
 * - Disabled states
 * - ARIA support via native button attributes
 * - Keyboard navigation support
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button Variants Configuration
 * Purpose: Define all possible button styles using class-variance-authority
 * 
 * Base Styles:
 * - Flex layout with centered content
 * - Rounded corners
 * - Focus ring styling
 * - Disabled state handling
 * - Smooth transitions
 * 
 * Variants:
 * - default: Primary action button
 * - destructive: Dangerous or delete actions
 * - outline: Secondary actions with border
 * - secondary: Alternative styling
 * - ghost: Minimal styling with hover
 * - link: Text-like button with underline
 * 
 * Sizes:
 * - default: Standard size
 * - sm: Compact version
 * - lg: Large version
 * - icon: Square button for icons
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

/**
 * Button Props Interface
 * Purpose: Define component props with TypeScript
 * 
 * Properties:
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement> - All native button props
 * @extends VariantProps<typeof buttonVariants> - Variant props from cva
 * @property {boolean} [asChild] - Render as child component instead of button
 * 
 * Usage:
 * - Provides type safety for all button props
 * - Enables variant and size selection
 * - Allows polymorphic rendering via asChild
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Button Component
 * Purpose: Flexible, styled button component with variants
 * 
 * Features:
 * - Multiple style variants
 * - Size options
 * - Polymorphic rendering
 * - Focus management
 * - Disabled states
 * 
 * @component
 * @param {ButtonProps} props - Component properties
 * @param {React.Ref<HTMLButtonElement>} ref - Forward ref for button element
 * 
 * Implementation:
 * - Uses Radix UI Slot for polymorphic rendering
 * - Merges className props with variants
 * - Forwards refs for accessibility
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
