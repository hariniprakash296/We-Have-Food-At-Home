/**
 * INPUT COMPONENT
 * 
 * SOLID Principles Applied:
 * - Single Responsibility (S): Component solely handles input field functionality and styling
 * - Open/Closed (O): Styles can be extended via className prop without modifying base styles
 * - Liskov Substitution (L): Can be used anywhere a native input element is expected
 * - Interface Segregation (I): Uses native input props interface for type safety
 * - Dependency Inversion (D): Depends on React's core abstractions for refs and props
 * 
 * DRY (Don't Repeat Yourself) Principles Applied:
 * - Centralized styling through Tailwind classes
 * - Reusable className merging utility
 * - Consistent prop spreading pattern
 * - Single source of truth for input styles
 * 
 * Based on Shadcn UI Input Component:
 * @see https://ui.shadcn.com/docs/components/input
 * 
 * Accessibility Features:
 * - Focus visible states with ring styling
 * - Disabled state handling
 * - Native input attributes support
 * - Color contrast compliance
 * - Screen reader compatibility
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input Component
 * Purpose: Flexible, styled input field with consistent design
 * 
 * Features:
 * 1. Visual Styling:
 *    - Consistent height and width
 *    - Rounded corners
 *    - Border with input color
 *    - Background color support
 *    - Padding for content
 * 
 * 2. Interactive States:
 *    - Focus ring with offset
 *    - Hover state
 *    - Disabled state styling
 *    - File input styling
 * 
 * 3. Typography:
 *    - Responsive text size
 *    - Placeholder text styling
 *    - File input text customization
 * 
 * 4. Accessibility:
 *    - Focus visible indicators
 *    - Disabled cursor styles
 *    - Native input attributes
 * 
 * @component
 * @param {React.ComponentProps<"input">} props - Native input element props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.type] - Input type attribute
 * @param {React.Ref<HTMLInputElement>} ref - Forward ref for input element
 * 
 * Implementation:
 * - Uses forwardRef for ref handling
 * - Merges custom classes with base styles
 * - Preserves all native input functionality
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-md border border-input bg-background",
          // Padding and typography
          "px-3 py-2 text-base md:text-sm",
          // File input customization
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Placeholder and focus states
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Custom classes
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
