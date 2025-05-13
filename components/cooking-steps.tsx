/**
 * Cooking Steps Component
 *
 * This component displays step-by-step cooking instructions in a modal overlay.
 * It allows users to navigate through each instruction with previous/next buttons.
 * Each step is displayed with an image and text instruction.
 */

"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, ChevronUp, ChevronDown } from "lucide-react"
import type { Recipe } from "@/components/recipe-card"

/**
 * Props for the CookingSteps component
 */
interface CookingStepsProps {
  recipe: Recipe // The recipe to display
  onClose: () => void // Function to call when closing the modal
}

export function CookingSteps({ recipe, onClose }: CookingStepsProps) {
  // Track the current instruction step
  const [currentStep, setCurrentStep] = useState(0)

  /**
   * Navigate to the next instruction step
   */
  const goToNextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  /**
   * Navigate to the previous instruction step
   */
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    // Full-screen modal overlay
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header with title and close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-foreground">{recipe.title}</h2>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {recipe.instructions.length}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close cooking steps">
            <X />
          </Button>
        </div>

        {/* Main content with image and instruction */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Step image */}
          <div className="relative">
            <Image
              src={`/abstract-geometric-shapes.png?height=600&width=800&query=${encodeURIComponent(`cooking step ${currentStep + 1} for ${recipe.title}`)}`}
              alt={`Step ${currentStep + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <div className="text-center">
                <span className="text-lg font-medium text-white">
                  Step {currentStep + 1}/{recipe.instructions.length}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Step instruction and navigation */}
          <div className="p-6 flex flex-col">
            <div className="flex-1">
              <p className="text-xl text-foreground">{recipe.instructions[currentStep]}</p>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
                aria-label="Previous step"
              >
                <ChevronUp size={18} />
                Previous
              </Button>

              <Button
                onClick={goToNextStep}
                disabled={currentStep === recipe.instructions.length - 1}
                className="flex items-center gap-2"
                aria-label="Next step"
              >
                Next
                <ChevronDown size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
