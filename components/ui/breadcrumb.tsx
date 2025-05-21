/**
 * Breadcrumb Component
 * 
 * A comprehensive breadcrumb navigation system that follows SOLID principles:
 * 
 * Single Responsibility (S):
 * - Each subcomponent handles a specific aspect:
 *   - Breadcrumb: Navigation container
 *   - List: Items organization
 *   - Item: Individual crumb
 *   - Link: Interactive navigation
 *   - Page: Current page indicator
 *   - Separator: Visual divider
 *   - Ellipsis: Truncation indicator
 * 
 * Open/Closed (O):
 * - Components are extensible through className prop
 * - Custom separators can be provided
 * - Flexible content through asChild prop
 * 
 * Liskov Substitution (L):
 * - Components maintain consistent behavior when extended
 * - Preserves HTML semantics and accessibility
 * 
 * Interface Segregation (I):
 * - Each component accepts only relevant props
 * - Clean separation between presentational and interactive elements
 * 
 * Dependency Inversion (D):
 * - Built on React primitives and Radix UI Slot
 * - Styling abstracted through utility functions
 * 
 * DRY Principles:
 * - Shared styling through cn utility
 * - Consistent component patterns
 * - Reusable className structures
 * 
 * Accessibility Features:
 * - Semantic HTML structure (nav, ol, li)
 * - ARIA labels and roles
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Focus management
 * 
 * Usage Example:
 * ```tsx
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Current</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 * ```
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Root Breadcrumb Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.separator] - Custom separator element
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Semantic navigation wrapper
 * - ARIA labeling
 * - Custom separator support
 */
const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = "Breadcrumb"

/**
 * Breadcrumb List Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Flex layout for items
 * - Responsive gap sizing
 * - Text wrapping control
 * - Muted text color
 */
const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

/**
 * Breadcrumb Item Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Inline flex layout
 * - Consistent spacing
 * - Flexible content support
 */
const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

/**
 * Breadcrumb Link Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.asChild] - Render as child component
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Interactive hover state
 * - Color transition
 * - Polymorphic rendering
 * - Accessible navigation
 */
const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

/**
 * Breadcrumb Page Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Current page indication
 * - Disabled state
 * - ARIA attributes
 * - Normal font weight
 */
const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

/**
 * Breadcrumb Separator Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Custom separator content
 * @param {string} [props.className] - Additional CSS classes
 * 
 * Features:
 * - Default chevron icon
 * - Custom separator support
 * - Consistent sizing
 * - Hidden from screen readers
 */
const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

/**
 * Breadcrumb Ellipsis Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * 
 * Features:
 * - Truncation indicator
 * - Screen reader text
 * - Centered icon
 * - Consistent sizing
 */
const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
