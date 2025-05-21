/**
 * Calendar Component
 * 
 * A comprehensive calendar component built with React Day Picker that follows SOLID principles:
 * 
 * Single Responsibility (S):
 * - Focused solely on date selection and display
 * - Each class name handles specific styling aspects
 * - Navigation components handle specific interactions
 * 
 * Open/Closed (O):
 * - Extensible through comprehensive className system
 * - Custom components can be provided
 * - Styling can be customized without modifying core logic
 * 
 * Liskov Substitution (L):
 * - Maintains React Day Picker's base behavior
 * - Preserves all original component props
 * - Consistent interaction patterns
 * 
 * Interface Segregation (I):
 * - Clean separation between presentation and logic
 * - Focused prop interface through CalendarProps
 * - Modular styling system
 * 
 * Dependency Inversion (D):
 * - Built on React Day Picker abstraction
 * - Styling abstracted through utility functions
 * - Icon components abstracted for flexibility
 * 
 * DRY Principles:
 * - Shared button variants
 * - Consistent styling patterns
 * - Reusable className structures
 * - Centralized style definitions
 * 
 * Accessibility Features:
 * - ARIA attributes for date selection
 * - Keyboard navigation support
 * - Focus management
 * - Screen reader announcements
 * - High contrast states
 * 
 * Features:
 * - Date range selection
 * - Outside days display
 * - Today highlighting
 * - Disabled dates support
 * - Responsive layout
 * - Custom navigation icons
 * - Multiple style variants
 * 
 * Usage Example:
 * ```tsx
 * <Calendar
 *   mode="single"
 *   selected={date}
 *   onSelect={setDate}
 *   className="rounded-md border"
 * />
 * ```
 */

"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * Calendar Props Interface
 * 
 * Extends DayPicker props to maintain full compatibility:
 * @typedef {Object} CalendarProps
 * @extends {React.ComponentProps<typeof DayPicker>}
 */
export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * Calendar Component
 * 
 * @component
 * @param {CalendarProps} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.classNames] - Custom class names for subcomponents
 * @param {boolean} [props.showOutsideDays=true] - Whether to show days from previous/next months
 * 
 * Styling System:
 * - months: Flex layout with responsive behavior
 * - month: Vertical spacing
 * - caption: Header with month/year display
 * - nav: Navigation buttons container
 * - table: Calendar grid layout
 * - cell: Individual day cell styling
 * - day: Day button appearance
 * 
 * States:
 * - selected: Primary color highlighting
 * - today: Accent background
 * - outside: Muted appearance
 * - disabled: Reduced opacity
 * - range: Special styling for date ranges
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
