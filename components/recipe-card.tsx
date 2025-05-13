"use client"

/**
 * Recipe Card Component
 *
 * This component displays a single recipe with image, title, description, and dietary information.
 * It provides a link to the detailed recipe page.
 */

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { TypographyMuted, TypographySmall } from "@/components/ui/typography"
import Link from "next/link"

/**
 * Interface defining the shape of a recipe object
 * This interface is used throughout the application to ensure consistent recipe data structure
 */
export interface Recipe {
  id: string // Unique identifier for the recipe
  title: string // Recipe title
  description: string // Brief description of the recipe
  ingredients: string[] // List of ingredients
  instructions: string[] // List of preparation instructions
  prepTime: string // Preparation time
  imageUrl: string // URL to the recipe image
  dietaryInfo: string[] // List of dietary tags (e.g., "vegan", "gluten-free")
  recipeType?: string // Optional field for categorizing the recipe (breakfast, lunch, dinner, appetizer)
}

/**
 * Props for the RecipeCard component
 */
interface RecipeCardProps {
  recipe: Recipe // The recipe to display
}

/**
 * RecipeCard component
 * Displays a card with recipe information and links to the detailed recipe page
 *
 * @param props - Component props containing the recipe
 * @returns JSX.Element - The rendered recipe card
 */
export function RecipeCard({ recipe }: RecipeCardProps) {
  // Destructure recipe props with defaults for safety
  const {
    id,
    title,
    description,
    prepTime,
    dietaryInfo = [], // Default to empty array if missing
    recipeType, // New field for recipe type
  } = recipe

  return (
    // Use Link component instead of onClick handler to prevent page reload
    <Link href={`/recipes/${id}`} className="block">
      <Card className="recipe-card overflow-hidden border-2 border-white bg-card hover:shadow-lg transition-all duration-200">
        <div className="h-full w-full rounded-[5px]">
          {/* Recipe image */}
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={recipe.imageUrl || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />

            {/* Recipe type badge - only show if available */}
            {recipeType && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {recipeType}
              </div>
            )}
          </div>

          {/* Recipe content */}
          <CardContent className="p-4">
            {/* Recipe title with black text instead of gradient */}
            <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>

            {/* Recipe description with truncation for long text */}
            <TypographyMuted className="mb-3">
              {description.length > 100 ? `${description.substring(0, 100)}...` : description}
            </TypographyMuted>

            {/* Dietary information tags with black/white styling */}
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

            {/* Preparation time */}
            <div className="flex items-center justify-between">
              <TypographySmall>Prep time: {prepTime}</TypographySmall>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}
