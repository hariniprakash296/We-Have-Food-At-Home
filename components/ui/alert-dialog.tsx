/**
 * Alert Dialog Component
 * 
 * A comprehensive alert dialog system built with Radix UI and Shadcn UI that follows SOLID principles:
 * 
 * Single Responsibility (S):
 * - Each subcomponent handles a specific aspect of the dialog:
 *   - Root: Dialog state management
 *   - Trigger: Dialog opening mechanism
 *   - Overlay: Background dimming
 *   - Content: Main dialog container
 *   - Header/Footer: Layout structure
 *   - Title/Description: Content presentation
 *   - Action/Cancel: User interactions
 * 
 * Open/Closed (O):
 * - Components are extensible through className prop
 * - Button variants system allows style customization
 * - Animation states can be modified without changing core logic
 * 
 * Liskov Substitution (L):
 * - All components maintain Radix UI's base behavior
 * - Consistent prop interfaces across components
 * - Preserves accessibility features when extended
 * 
 * Interface Segregation (I):
 * - Components only receive relevant props
 * - Clean separation between primitive and styled components
 * 
 * Dependency Inversion (D):
 * - Built on Radix UI primitives for core functionality
 * - Styling abstracted through utility functions
 * 
 * DRY Principles:
 * - Shared styling through cn utility
 * - Consistent animation patterns
 * - Reusable button variants
 * - Common prop spreading patterns
 * 
 * Accessibility Features:
 * - WAI-ARIA compliant dialog roles
 * - Keyboard navigation support
 * - Focus management
 * - Screen reader announcements
 * - Proper heading structure
 */

"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * Root Component
 * Manages the open/closed state of the alert dialog
 */
const AlertDialog = AlertDialogPrimitive.Root

/**
 * Trigger Component
 * Element that opens the dialog when clicked
 */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

/**
 * Portal Component
 * Renders dialog outside of parent DOM hierarchy for proper stacking
 */
const AlertDialogPortal = AlertDialogPrimitive.Portal

/**
 * Overlay Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Semi-transparent background overlay
 * - Animated fade in/out
 * - Fixed positioning
 * - High z-index for proper stacking
 */
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

/**
 * Content Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Centered positioning
 * - Responsive width
 * - Grid layout for content
 * - Complex animation system:
 *   - Fade in/out
 *   - Zoom in/out
 *   - Slide animations
 * - Responsive rounded corners
 * - Drop shadow
 */
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

/**
 * Header Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * 
 * Features:
 * - Flex column layout
 * - Responsive text alignment
 * - Consistent spacing
 */
const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

/**
 * Footer Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * 
 * Features:
 * - Responsive button layout
 * - Reverse column on mobile
 * - Consistent button spacing
 */
const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

/**
 * Title Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Semantic heading
 * - Consistent text sizing
 * - Bold font weight
 */
const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

/**
 * Description Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Smaller text size
 * - Muted text color
 * - Proper spacing
 */
const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

/**
 * Action Button Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Default button styling
 * - Primary action appearance
 * - Consistent sizing
 */
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

/**
 * Cancel Button Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Outline button variant
 * - Responsive margin
 * - Secondary action appearance
 */
const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
