/**
 * Alert Component
 * 
 * A flexible alert component system built with React and Shadcn UI that follows SOLID principles:
 * 
 * Single Responsibility (S):
 * - Each subcomponent (Alert, AlertTitle, AlertDescription) handles one specific aspect of the alert
 * - Alert manages the container and variants
 * - AlertTitle handles the heading styling
 * - AlertDescription manages the content formatting
 * 
 * Open/Closed (O):
 * - Variant system allows extending styles without modifying base component
 * - className prop enables external style customization
 * 
 * Liskov Substitution (L):
 * - All subcomponents can be used independently or together
 * - Components maintain consistent behavior when extended
 * 
 * Interface Segregation (I):
 * - Each component accepts only the props it needs
 * - Clean separation between variant props and HTML attributes
 * 
 * Dependency Inversion (D):
 * - Components depend on abstractions (React.HTMLAttributes) not concrete implementations
 * - Variant system is abstracted through class-variance-authority
 * 
 * DRY Principles:
 * - Reusable variant definitions
 * - Shared className utilities through cn function
 * - Consistent prop spreading pattern across components
 * 
 * Accessibility Features:
 * - Uses semantic HTML structure
 * - Includes role="alert" for screen readers
 * - Proper heading hierarchy with h5 for AlertTitle
 * - Maintains text contrast through variant system
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Alert Variant System
 * 
 * Defines the visual styles for different alert types using class-variance-authority:
 * - Base styles: width, padding, border, and SVG icon positioning
 * - Variants: 
 *   - default: standard alert with background color
 *   - destructive: error/warning style with destructive colors
 */
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Alert Container Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.variant] - Visual variant (default | destructive)
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref
 * 
 * Features:
 * - Polymorphic component using forwardRef
 * - Variant support through class-variance-authority
 * - Flexible styling through className prop
 * - Accessible alert role for screen readers
 */
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

/**
 * Alert Title Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref<HTMLParagraphElement>} ref - Forwarded ref
 * 
 * Features:
 * - Semantic h5 heading element
 * - Consistent typography styling
 * - Flexible customization through className
 */
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

/**
 * Alert Description Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref<HTMLParagraphElement>} ref - Forwarded ref
 * 
 * Features:
 * - Optimized text formatting for readability
 * - Consistent paragraph spacing
 * - Flexible styling through className
 */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
