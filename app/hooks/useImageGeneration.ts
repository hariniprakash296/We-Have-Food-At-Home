/**
 * useImageGeneration Hook
 * 
 * A custom React hook for generating images from text descriptions.
 * Follows SOLID principles and implements proper state management.
 * 
 * Single Responsibility (S):
 * - Focused solely on image generation functionality
 * - Clear separation of state management and API calls
 * - Each interface handles specific data structure
 * 
 * Open/Closed (O):
 * - Extensible through return interface
 * - State management can be modified without changing core logic
 * - Error handling can be extended
 * 
 * Liskov Substitution (L):
 * - Consistent state management
 * - Error handling follows standard patterns
 * - API calls maintain uniform behavior
 * 
 * Interface Segregation (I):
 * - Focused interfaces for hook return values
 * - Clear separation of state management
 * - Specific error handling types
 * 
 * Dependency Inversion (D):
 * - Depends on abstractions (interfaces) not implementations
 * - State management through React hooks
 * - Modular API call implementation
 * 
 * DRY Principles:
 * - Reusable interfaces
 * - Centralized state management
 * - Common error handling patterns
 * - Shared type definitions
 * 
 * Features:
 * - Image URL state management
 * - Loading state handling
 * - Error state management
 * - Automatic cleanup
 * 
 * State Management:
 * - imageUrl: Stores generated image URL
 * - isLoading: Tracks API request status
 * - error: Handles error messages
 * 
 * Error Handling:
 * - API errors with messages
 * - Network errors
 * - Invalid responses
 * 
 * Usage Example:
 * ```tsx
 * const { imageUrl, isLoading, error, generateImage } = useImageGeneration()
 * 
 * useEffect(() => {
 *   generateImage("A beautiful sunset")
 * }, [generateImage])
 * ```
 */

import { useState } from 'react'

/**
 * Hook return value interface
 * Defines the structure of the hook's return object
 */
interface UseImageGenerationReturn {
  imageUrl: string | null      // URL of generated image or null
  isLoading: boolean          // Loading state flag
  error: string | null        // Error message or null
  generateImage: (description: string) => Promise<void>  // Image generation function
}

/**
 * Image generation hook
 * Manages state and API calls for image generation
 * 
 * @returns Object containing state and functions for image generation
 */
export const useImageGeneration = (): UseImageGenerationReturn => {
  // State management using React hooks
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Image generation function
   * Makes API call to generate image from description
   * 
   * @param description - Text description for image generation
   */
  const generateImage = async (description: string) => {
    console.log(`useImageGeneration: generateImage called with description: "${description.substring(0,50)}..."`);
    try {
      // Set loading state
      setIsLoading(true)
      setError(null)

      // Make API request
      console.log('useImageGeneration: Attempting to fetch from /api/image-generation');
      const response = await fetch('/api/image-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      // Handle response
      console.log(`useImageGeneration: Response status from /api/image-generation: ${response.status}`);
      const data = await response.json()
      console.log('useImageGeneration: Response data from /api/image-generation:', data);

      // Validate response
      if (!response.ok) {
        console.error('useImageGeneration: Error from /api/image-generation:', data.error || 'Failed to generate image');
        throw new Error(data.error || 'Failed to generate image')
      }

      // Update state with image URL
      setImageUrl(data.url)
    } catch (err) {
      // Handle errors
      console.error('useImageGeneration: Catch block error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image')
      setImageUrl(null)
    } finally {
      // Reset loading state
      setIsLoading(false)
    }
  }

  // Return hook interface
  return {
    imageUrl,
    isLoading,
    error,
    generateImage,
  }
} 