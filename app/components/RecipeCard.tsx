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
import { useImageGeneration } from '../hooks/useImageGeneration'

// Interface for Recipe from Deepseek API
interface Recipe {
  id: string                 // Unique identifier for the recipe
  title: string             // Recipe title
  description: string       // Brief description of the recipe
  ingredients: string[]     // List of required ingredients
  instructions: string[]    // Step-by-step cooking instructions
  prepTime: string         // Preparation time
  dietaryInfo: string[]    // Dietary tags and information
  recipeType: string      // Type of recipe (breakfast, lunch, dinner, etc.)
}

// Props interface for the RecipeCard component
interface RecipeCardProps {
  recipe: Recipe           // Recipe data to display
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  // Use our custom hook for image generation
  // This abstracts the image generation logic and state management
  const { imageUrl, isLoading, error, generateImage } = useImageGeneration()

  // Generate image when component mounts or recipe changes
  // This effect handles the image generation lifecycle
  useEffect(() => {
    console.log(`RecipeCard useEffect for "${recipe.title}": Calling generateImage with description: "${recipe.description.substring(0, 50)}..."`);
    generateImage(recipe.description)
  }, [recipe.description, generateImage])

  return (
    // Main container with shadow and rounded corners
    // Uses Tailwind for consistent styling
    <div className="rounded-lg shadow-lg overflow-hidden">
      {/* Image section with loading state management */}
      <div className="w-full h-48 bg-white relative">
        {/* Loading state indicator */}
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <span className="text-gray-500">loading...</span>
          </div>
        ) : error ? (
          // Error state display
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <span className="text-red-500">{error}</span>
          </div>
        ) : imageUrl ? (
          // Generated image display
          <img
            src={imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      {/* Recipe details section */}
      <div className="p-4">
        {/* Recipe title with proper heading hierarchy */}
        <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
        {/* Recipe description with appropriate text color */}
        <p className="text-gray-600 mb-4">{recipe.description}</p>
        
        {/* Dietary information tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.dietaryInfo.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Preparation time display */}
        <div className="text-sm text-gray-500">
          Prep time: {recipe.prepTime}
        </div>
      </div>
    </div>
  )
} 