/**
 * Recipe Detail Page
 *
 * This page displays detailed information about a specific recipe.
 * It uses dynamic routing with the recipe ID as the parameter.
 * The page shows the full recipe information including ingredients,
 * and provides a button to view step-by-step cooking instructions.
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSearch } from "@/context/search-context"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChefHat, Clock } from "lucide-react"
import { TypographyH1, TypographyP, TypographyH2 } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { CookingSteps } from "@/components/cooking-steps"
import type { Recipe } from "@/components/recipe-card"

/**
 * RecipeDetailPage component
 * Displays detailed information about a specific recipe
 *
 * @returns JSX.Element - The rendered recipe detail page
 */
export default function RecipeDetailPage() {
  // Get recipes from search context to maintain state across pages
  const { recipes } = useSearch()

  // Get the recipe ID from the URL parameters
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string

  // Local state for the current recipe and cooking steps visibility
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [showCookingSteps, setShowCookingSteps] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Effect to find the recipe by ID when component mounts or recipeId changes
  useEffect(() => {
    // Function to load recipe data
    const loadRecipe = () => {
      setIsLoading(true)

      // First try to get the recipe from context
      if (recipes.length > 0) {
        const foundRecipe = recipes.find((r) => r.id === recipeId)
        if (foundRecipe) {
          setRecipe(foundRecipe)
          setIsLoading(false)
          return
        }
      }

      // If not found in context, try to get from localStorage
      try {
        const savedRecipes = localStorage.getItem("savedRecipes")
        if (savedRecipes) {
          const parsedRecipes = JSON.parse(savedRecipes) as Recipe[]
          const foundRecipe = parsedRecipes.find((r) => r.id === recipeId)
          if (foundRecipe) {
            setRecipe(foundRecipe)
            setIsLoading(false)
            return
          }
        }
      } catch (error) {
        console.error("Error retrieving recipe from localStorage:", error)
      }

      // If we still don't have a recipe, set loading to false and let the UI handle it
      setIsLoading(false)
    }

    // Load the recipe
    loadRecipe()

    // Cleanup function to handle component unmount
    return () => {
      // No cleanup needed for this effect
    }
  }, [recipes, recipeId]) // Fixed: Removed recipe from dependencies

  // Handle navigation back to home if recipe not found
  useEffect(() => {
    // Only redirect if we're done loading and no recipe was found
    if (!isLoading && !recipe) {
      const timer = setTimeout(() => {
        router.push("/")
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isLoading, recipe, router]) // This effect depends on isLoading and recipe

  // Show loading state while finding the recipe
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Show error state if recipe not found
  if (!recipe) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background text-foreground">
        <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
        <p className="mb-6">Redirecting to home page...</p>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-foreground mb-6"
          aria-label="Back to recipes"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to recipes
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recipe image */}
          <div className="relative h-[400px] rounded-lg overflow-hidden border-2 border-white">
            <Image
              src={recipe.imageUrl || "/placeholder.svg"}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />

            {/* Recipe type badge - only show if available */}
            {recipe.recipeType && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                {recipe.recipeType}
              </div>
            )}
          </div>

          {/* Recipe details */}
          <div>
            <TypographyH1>{recipe.title}</TypographyH1>

            {/* Dietary tags */}
            <div className="flex flex-wrap gap-2 my-3">
              {recipe.dietaryInfo.map((tag: string, index: number) => (
                <Badge key={index} className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 mt-6">
              <Button
                onClick={() => setShowCookingSteps(true)}
                className="flex items-center gap-2"
                aria-label="Start cooking"
              >
                <ChefHat size={18} />
                Cook
              </Button>
            </div>

            {/* Recipe description */}
            <TypographyP className="mt-6">{recipe.description}</TypographyP>

            {/* Recipe metadata */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <div className="text-muted-foreground">Difficulty</div>
                <div>Medium</div>
              </div>
              <div>
                <div className="text-muted-foreground">Prep Time</div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  {recipe.prepTime}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Servings</div>
                <div>4</div>
              </div>
            </div>

            {/* Ingredients section */}
            <div className="mt-8">
              <TypographyH2 className="mb-4">Ingredients</TypographyH2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions section (visible on mobile) */}
        <div className="mt-8 md:hidden">
          <TypographyH2 className="mb-4">Instructions</TypographyH2>
          <ol className="space-y-4 list-decimal list-inside">
            {recipe.instructions.map((instruction: string, index: number) => (
              <li key={index} className="pl-2">
                {instruction}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Cooking steps modal */}
      {showCookingSteps && <CookingSteps recipe={recipe} onClose={() => setShowCookingSteps(false)} />}
    </div>
  )
}
