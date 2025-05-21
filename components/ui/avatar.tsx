/**
 * Avatar Component
 * 
 * A flexible avatar system built with Radix UI that follows SOLID principles:
 * 
 * Single Responsibility (S):
 * - Each subcomponent has a specific role:
 *   - Root: Container and sizing
 *   - Image: Image display and optimization
 *   - Fallback: Default display when image fails
 * 
 * Open/Closed (O):
 * - Components are extensible through className prop
 * - Styling can be customized without modifying core logic
 * - Fallback content is customizable
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
 * - Consistent component patterns
 * - Reusable className structures
 * 
 * Accessibility Features:
 * - Proper image alt text support
 * - Semantic fallback content
 * - ARIA attributes for status
 * 
 * Usage Example:
 * ```tsx
 * <Avatar>
 *   <AvatarImage src="user.jpg" alt="User" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 * ```
 */

"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * Root Avatar Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Fixed dimensions (h-10 w-10)
 * - Circular shape
 * - Overflow handling
 * - Flex container for content
 * - Non-scaling behavior (shrink-0)
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

/**
 * Avatar Image Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Maintains square aspect ratio
 * - Full width and height coverage
 * - Automatic image optimization
 * - Fallback handling on load failure
 */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/**
 * Avatar Fallback Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Centered content alignment
 * - Full dimension coverage
 * - Muted background color
 * - Circular shape matching container
 * - Flexible content support (text, icons, etc.)
 */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
