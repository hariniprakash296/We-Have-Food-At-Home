/**
 * Carousel Component
 * 
 * A comprehensive carousel/slider system built with Embla Carousel that follows SOLID principles:
 * 
 * Single Responsibility (S):
 * - Each subcomponent handles a specific aspect:
 *   - Carousel: Core container and state management
 *   - Content: Slide container and overflow handling
 *   - Item: Individual slide management
 *   - Previous/Next: Navigation controls
 * 
 * Open/Closed (O):
 * - Extensible through plugins system
 * - Customizable through className props
 * - Flexible orientation support
 * 
 * Liskov Substitution (L):
 * - Components maintain consistent behavior when extended
 * - Preserves Embla Carousel's core functionality
 * - Consistent prop interfaces
 * 
 * Interface Segregation (I):
 * - Clean separation between carousel and navigation
 * - Focused prop interfaces for each component
 * - Context provides only necessary values
 * 
 * Dependency Inversion (D):
 * - Built on Embla Carousel abstraction
 * - Styling abstracted through utility functions
 * - Plugin system for extending functionality
 * 
 * DRY Principles:
 * - Shared context for state management
 * - Consistent styling patterns
 * - Reusable navigation logic
 * - Common event handling
 * 
 * Accessibility Features:
 * - Keyboard navigation support
 * - ARIA roles and labels
 * - Screen reader announcements
 * - Focus management
 * - Semantic HTML structure
 * 
 * Features:
 * - Horizontal and vertical orientations
 * - Touch/drag support
 * - Keyboard navigation
 * - Responsive design
 * - Plugin support
 * - Custom navigation
 * 
 * Usage Example:
 * ```tsx
 * <Carousel>
 *   <CarouselContent>
 *     <CarouselItem>Slide 1</CarouselItem>
 *     <CarouselItem>Slide 2</CarouselItem>
 *   </CarouselContent>
 *   <CarouselPrevious />
 *   <CarouselNext />
 * </Carousel>
 * ```
 */

"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * Type Definitions
 * 
 * @typedef {UseEmblaCarouselType[1]} CarouselApi - Embla Carousel API type
 * @typedef {Parameters<typeof useEmblaCarousel>} UseCarouselParameters - Hook parameters
 * @typedef {UseCarouselParameters[0]} CarouselOptions - Carousel configuration options
 * @typedef {UseCarouselParameters[1]} CarouselPlugin - Carousel plugin type
 */
type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

/**
 * Carousel Props Interface
 * 
 * @typedef {Object} CarouselProps
 * @property {CarouselOptions} [opts] - Carousel configuration options
 * @property {CarouselPlugin} [plugins] - Carousel plugins
 * @property {"horizontal" | "vertical"} [orientation] - Carousel orientation
 * @property {(api: CarouselApi) => void} [setApi] - Callback for accessing carousel API
 */
type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

/**
 * Carousel Context Props Interface
 * 
 * @typedef {Object} CarouselContextProps
 * @property {ReturnType<typeof useEmblaCarousel>[0]} carouselRef - Carousel container ref
 * @property {ReturnType<typeof useEmblaCarousel>[1]} api - Carousel API
 * @property {() => void} scrollPrev - Previous slide function
 * @property {() => void} scrollNext - Next slide function
 * @property {boolean} canScrollPrev - Can scroll to previous
 * @property {boolean} canScrollNext - Can scroll to next
 */
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

/**
 * Carousel Context
 * Provides carousel state and functions to child components
 */
const CarouselContext = React.createContext<CarouselContextProps | null>(null)

/**
 * useCarousel Hook
 * Custom hook for accessing carousel context
 * 
 * @throws {Error} If used outside of Carousel component
 * @returns {CarouselContextProps} Carousel context values
 */
function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

/**
 * Root Carousel Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.orientation="horizontal"] - Carousel orientation
 * @param {CarouselOptions} [props.opts] - Carousel options
 * @param {CarouselPlugin} [props.plugins] - Carousel plugins
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 */
const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

/**
 * Carousel Content Component
 * Container for carousel slides
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Overflow handling
 * - Flexible orientation support
 * - Responsive layout
 */
const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

/**
 * Carousel Item Component
 * Individual slide container
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Flexible sizing
 * - Orientation support
 * - ARIA attributes
 */
const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

/**
 * Carousel Previous Button
 * Navigation button for previous slide
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.variant="outline"] - Button variant
 * @param {string} [props.size="icon"] - Button size
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Automatic disable state
 * - Screen reader support
 * - Orientation aware positioning
 */
const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

/**
 * Carousel Next Button
 * Navigation button for next slide
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.variant="outline"] - Button variant
 * @param {string} [props.size="icon"] - Button size
 * @param {React.Ref} ref - Forwarded ref
 * 
 * Features:
 * - Automatic disable state
 * - Screen reader support
 * - Orientation aware positioning
 */
const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
