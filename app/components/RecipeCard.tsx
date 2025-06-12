/**
 * RecipeCard Component
 * 
 * A comprehensive recipe card component that follows SOLID principles:
 * 
 * Single Responsibility (S):
 * - Focused solely on displaying recipe information and associated image
 * - Each section handles specific aspects (image, details, tags)
 * - Clear separation between image generation and display logic
 * 
 * Open/Closed (O):
 * - Extensible through props interface
 * - Styling can be customized through Tailwind classes
 * - Image generation logic abstracted through custom hook
 * 
 * Liskov Substitution (L):
 * - Component maintains consistent behavior with Recipe interface
 * - Props follow TypeScript interface contracts
 * - Image states handled uniformly
 * 
 * Interface Segregation (I):
 * - Clean separation between recipe data and component props
 * - Focused interfaces for Recipe and RecipeCardProps
 * - Image generation hook provides specific functionality
 * 
 * Dependency Inversion (D):
 * - Depends on abstractions (Recipe interface) not concrete implementations
 * - Image generation abstracted through custom hook
 * - Component is agnostic to image generation implementation
 * 
 * DRY Principles:
 * - Reusable interfaces for recipe data
 * - Consistent styling patterns through Tailwind classes
 * - Centralized image generation logic in custom hook
 * - Shared loading and error state handling
 * 
 * Component Structure:
 * - Root container with shadow and rounded corners
 * - Image section with loading/error states
 * - Details section with title, description, tags
 * - Responsive layout with proper spacing
 * 
 * Features:
 * - Dynamic image generation based on recipe description
 * - Loading state management
 * - Error handling and display
 * - Dietary information tags
 * - Preparation time display
 * 
 * Accessibility Features:
 * - Semantic HTML structure
 * - Alt text for images
 * - Color contrast for text
 * - Loading state indicators
 * 
 * Integration with Shadcn UI:
 * - Consistent with Shadcn design system
 * - Uses Tailwind utility classes
 * - Follows Shadcn component patterns
 * 
 * Props and State Management:
 * - Recipe data passed through props
 * - Image generation state managed by custom hook
 * - Loading and error states handled internally
 * 
 * Usage Example:
 * ```tsx
 * <RecipeCard
 *   recipe={{
 *     id: "1",
 *     title: "Pasta Carbonara",
 *     description: "Classic Italian pasta dish",
 *     ingredients: ["pasta", "eggs", "cheese"],
 *     instructions: ["Boil pasta", "Mix sauce"],
 *     prepTime: "30 mins",
 *     dietaryInfo: ["Italian", "Contains Eggs"],
 *     recipeType: "dinner"
 *   }}
 * />
 * ```
 */

import { useEffect } from 'react'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { TypographyMuted, TypographySmall } from '@/components/ui/typography'

/**
 * Recipe Interface
 * Purpose: Define type structure for recipe data
 */
export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  prepTime: string
  imageUrl?: string // Made optional since we'll generate it
  dietaryInfo: string[]
  recipeType?: string
}

interface RecipeCardProps {
  recipe: Recipe
}

/**
 * RecipeCard Component
 * Purpose: Display recipe preview in card format with AI-generated images
 */
export function RecipeCard({ recipe }: RecipeCardProps) {
  // Use our custom hook for image generation
  const { imageUrl, isLoading, error, generateImage } = useImageGeneration()

  // Generate image when component mounts or recipe changes
  useEffect(() => {
    console.log(`RecipeCard: Starting image generation for "${recipe.title}"`);
    console.log(`RecipeCard: Description: "${recipe.description}"`);
    generateImage(recipe.description)
  }, [recipe.description, generateImage])

  // Log state changes
  useEffect(() => {
    console.log(`RecipeCard: State update for "${recipe.title}":`);
    console.log('- imageUrl:', imageUrl);
    console.log('- isLoading:', isLoading);
    console.log('- error:', error);
  }, [imageUrl, isLoading, error, recipe.title])

  const {
    id,
    title,
    description,
    prepTime,
    dietaryInfo = [],
    recipeType,
  } = recipe

  return (
    <Link href={`/recipes/${id}`} className="block">
      <Card className="recipe-card overflow-hidden border-2 border-white bg-card hover:shadow-lg transition-all duration-200">
        <div className="h-full w-full rounded-[5px]">
          {/* Image Container with loading states */}
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
                src={imageUrl || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            )}

            {recipeType && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {recipeType}
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>

            <TypographyMuted className="mb-3">
              {description.length > 100 ? `${description.substring(0, 100)}...` : description}
            </TypographyMuted>

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

            <div className="flex items-center justify-between">
              <TypographySmall>Prep time: {prepTime}</TypographySmall>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
} 