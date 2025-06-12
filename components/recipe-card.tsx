/**
 * RECIPE CARD COMPONENT
 * 
 * SOLID Principles Applied:
 * - Single Responsibility (S): Component solely handles displaying a single recipe's preview
 * - Open/Closed (O): New recipe properties can be added without modifying existing display logic
 * - Liskov Substitution (L): Component works with any recipe object that matches the interface
 * - Interface Segregation (I): Uses only the recipe properties needed for display
 * - Dependency Inversion (D): Depends on Recipe interface rather than concrete implementation
 * 
 * DRY (Don't Repeat Yourself) Principles Applied:
 * - Reusable UI components from component library
 * - Consistent styling through Tailwind classes
 * - Centralized Recipe interface for type safety
 * - Common image handling patterns
 * 
 * Component Features:
 * 1. Responsive image display with fallback
 * 2. Interactive hover states
 * 3. Truncated description for long text
 * 4. Dietary information tags
 * 5. Preparation time display
 */

"use client" // Mark as client component for client-side interactivity

/**
 * Import Block
 * Purpose: Import necessary UI components and Next.js utilities
 * - Card components for layout structure
 * - Next.js Image for optimized image loading
 * - Typography components for consistent text styling
 * - Next.js Link for client-side navigation
 */
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { TypographyMuted, TypographySmall } from "@/components/ui/typography"
import Link from "next/link"
import { useEffect } from "react" // Effect to trigger image generation on mount
// Custom hook (lives in app/hooks)
import { useImageGeneration } from "@/app/hooks/useImageGeneration"

/**
 * Recipe Interface
 * Purpose: Define type structure for recipe data
 * 
 * Properties:
 * @property {string} id - Unique identifier for recipe
 * @property {string} title - Recipe name
 * @property {string} description - Recipe overview
 * @property {string[]} ingredients - List of required ingredients
 * @property {string[]} instructions - Step-by-step preparation steps
 * @property {string} prepTime - Time required for preparation
 * @property {string} imageUrl - Recipe image location
 * @property {string[]} dietaryInfo - Dietary tags and restrictions
 * @property {string} [recipeType] - Optional recipe category
 * 
 * Implementation:
 * - Used throughout app for type safety
 * - Ensures consistent data structure
 * - Optional fields marked with '?'
 */
export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  prepTime: string
  imageUrl?: string // optional – will be overwritten by AI-generated image
  dietaryInfo: string[]
  recipeType?: string
}

/**
 * RecipeCard Props Interface
 * Purpose: Define expected props for RecipeCard component
 * 
 * @property {Recipe} recipe - Complete recipe object matching Recipe interface
 */
interface RecipeCardProps {
  recipe: Recipe
}

/**
 * RecipeCard Component (Dynamic Image Version)
 *
 * This updated implementation generates an AI image on-the-fly using the
 * useImageGeneration hook. It keeps the same visual design while ensuring the
 * /api/image-generation route is called for every card rendered.
 */
export function RecipeCard({ recipe }: RecipeCardProps) {
  // Pull helpers from our custom image-generation hook
  const { imageUrl, isLoading, error, generateImage } = useImageGeneration()

  // Kick off generation when the component mounts (or when the description
  // changes – e.g., when list updates).
  useEffect(() => {
    generateImage(recipe.description)
  }, [recipe.description, generateImage])

  /* Optional: log useful debug info in dev */
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("RecipeCard debug →", {
        title: recipe.title,
        imageUrl,
        isLoading,
        error,
      })
    }
  }, [recipe.title, imageUrl, isLoading, error])

  /**
   * Props Destructuring
   * Purpose: Extract needed properties with defaults
   * 
   * Implementation:
   * - Provides fallback empty array for dietaryInfo
   * - Optional recipeType handled safely
   */
  const {
    id,
    title,
    description,
    prepTime,
    dietaryInfo = [],
    recipeType,
  } = recipe

  return (
    /**
     * Card Container
     * Purpose: Wrap card in Next.js Link for navigation
     * Features:
     * - Client-side navigation
     * - Interactive hover states
     * - Consistent border and background
     */
    <Link href={`/recipes/${id}`} className="block">
      <Card className="recipe-card overflow-hidden border-2 border-white bg-card hover:shadow-lg transition-all duration-200">
        <div className="h-full w-full rounded-[5px]">
          {/* Image slot - handles loading, error, and success states */}
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Generating image...</div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/placeholder.svg"
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
            ) : (
              <Image
                src={imageUrl || recipe.imageUrl || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            )}

            {/* Recipe Type Badge
                Purpose: Display category if available
                Features:
                - Conditional rendering
                - Semi-transparent background
                - Consistent positioning */}
            {recipeType && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {recipeType}
              </div>
            )}
          </div>

          {/* Content Container
              Purpose: Display recipe information
              Layout: Consistent padding and spacing */}
          <CardContent className="p-4">
            {/* Recipe Title
                Purpose: Display prominent recipe name
                Style: Bold, larger text with consistent color */}
            <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>

            {/* Recipe Description
                Purpose: Show brief overview with truncation
                Features:
                - Text truncation for long descriptions
                - Muted styling for secondary information */}
            <TypographyMuted className="mb-3">
              {description.length > 100 ? `${description.substring(0, 100)}...` : description}
            </TypographyMuted>

            {/* Dietary Tags
                Purpose: Display dietary information
                Features:
                - Flexible wrap layout
                - Consistent tag styling
                - Dark mode support */}
            <div className="flex flex-wrap gap-2 mb-3">
              {dietaryInfo.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full text-xs inline-block bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Preparation Time
                Purpose: Show time requirement
                Layout: Aligned to bottom of card */}
            <div className="flex items-center justify-between">
              <TypographySmall>Prep time: {prepTime}</TypographySmall>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}
