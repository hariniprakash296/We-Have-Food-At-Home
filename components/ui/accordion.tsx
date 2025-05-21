/**
 * ACCORDION COMPONENT
 * 
 * SOLID Principles Applied:
 * - Single Responsibility (S): Each subcomponent handles one specific aspect of accordion functionality
 * - Open/Closed (O): Styles and behavior can be extended via props without modifying core components
 * - Liskov Substitution (L): Components use Radix UI primitives that can be substituted
 * - Interface Segregation (I): Each subcomponent accepts only relevant props
 * - Dependency Inversion (D): Depends on Radix UI abstractions rather than concrete implementations
 * 
 * DRY (Don't Repeat Yourself) Principles Applied:
 * - Reuses Radix UI primitives for core functionality
 * - Shared className merging utility
 * - Common animation patterns
 * - Consistent prop spreading pattern
 * 
 * Based on Shadcn UI Accordion Component:
 * @see https://ui.shadcn.com/docs/components/accordion
 * 
 * Accessibility Features:
 * - ARIA attributes handled by Radix UI
 * - Keyboard navigation support
 * - Focus management
 * - Screen reader announcements
 */

"use client" // Mark as client component for interactive features

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Root Accordion Component
 * Purpose: Container for accordion items
 * 
 * Features:
 * - Multiple or single item expansion
 * - Controlled or uncontrolled state
 * - Collapsible sections
 */
const Accordion = AccordionPrimitive.Root

/**
 * AccordionItem Component
 * Purpose: Individual collapsible section
 * 
 * Features:
 * - Bottom border for visual separation
 * - Flexible content structure
 * - State management integration
 * 
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>} props - Component properties
 * @param {React.Ref} ref - Forward ref for accordion item
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

/**
 * AccordionTrigger Component
 * Purpose: Clickable header that toggles content visibility
 * 
 * Features:
 * - Chevron icon with rotation animation
 * - Hover underline effect
 * - Flexible layout with centered content
 * - Smooth transitions
 * 
 * Styling:
 * - Flex layout for content alignment
 * - Medium font weight
 * - Interactive hover state
 * - Icon rotation animation
 * 
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>} props - Component properties
 * @param {React.Ref} ref - Forward ref for trigger element
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

/**
 * AccordionContent Component
 * Purpose: Expandable content section
 * 
 * Features:
 * - Smooth expand/collapse animations
 * - Overflow handling
 * - Consistent padding
 * 
 * Animations:
 * - accordion-up: Collapse animation
 * - accordion-down: Expand animation
 * 
 * State Management:
 * - Uses data-state for animation control
 * - Handles overflow during transitions
 * 
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>} props - Component properties
 * @param {React.Ref} ref - Forward ref for content section
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
