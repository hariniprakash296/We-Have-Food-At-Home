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

import { useState, useCallback } from 'react'

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
 * Custom hook for handling image generation
 * Manages state and API calls for generating images from text descriptions
 */
export function useImageGeneration(): UseImageGenerationReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Generate image from description
   * Makes API call to our image generation endpoint
   */
  const generateImage = useCallback(async (description: string) => {
    console.log('useImageGeneration: Starting image generation for description:', description);
    setIsLoading(true)
    setError(null)

    try {
      console.log('useImageGeneration: Making API request to /api/image-generation');
      const response = await fetch('/api/image-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      console.log('useImageGeneration: Received response:', response.status);

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      const data = await response.json()
      console.log('useImageGeneration: Successfully received image URL:', data.url);
      setImageUrl(data.url)
    } catch (err) {
      console.error('useImageGeneration: Error generating image:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate image')
      setImageUrl(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Return hook interface
  return {
    imageUrl,
    isLoading,
    error,
    generateImage,
  }
} 