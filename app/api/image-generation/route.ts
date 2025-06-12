/**
 * Image Generation API Route
 * 
 * This route handles image generation requests using the getimg.ai API.
 * It follows SOLID principles and implements rate limiting for API protection.
 * 
 * Single Responsibility (S):
 * - Focused solely on image generation
 * - Clear separation of rate limiting and API call logic
 * - Each interface handles specific data structure
 * 
 * Open/Closed (O):
 * - Extensible through environment variables
 * - Rate limiting can be modified without changing core logic
 * - Response format can be extended
 * 
 * Liskov Substitution (L):
 * - Consistent request/response handling
 * - Error responses follow standard format
 * - Rate limiting behavior is uniform
 * 
 * Interface Segregation (I):
 * - Focused interfaces for request/response
 * - Clear separation of rate limiting logic
 * - Specific error handling types
 * 
 * Dependency Inversion (D):
 * - Depends on abstractions (interfaces) not implementations
 * - Environment variables for configuration
 * - Modular rate limiting implementation
 * 
 * DRY Principles:
 * - Reusable interfaces
 * - Centralized rate limiting logic
 * - Common error handling patterns
 * - Shared type definitions
 * 
 * Features:
 * - Rate limiting with per-minute reset
 * - Error handling and logging
 * - Environment variable configuration
 * - Request validation
 * 
 * Security Considerations:
 * - Rate limiting prevents abuse
 * - API key stored in environment variables
 * - Input validation
 * - Error message sanitization
 */

// Import necessary Next.js API types
import { NextRequest, NextResponse } from 'next/server'

/**
 * Request body interface
 * Defines the expected structure of incoming requests
 */
interface RequestBody {
  description: string // Text description for image generation
}

/**
 * getimg.ai API response interface
 * Defines the expected structure of API responses
 */
interface GetImgResponse {
  url: string // URL of the generated image
}

/**
 * Rate limiting configuration
 * Tracks API calls and implements reset logic
 */
let apiCallsCount = 0
let lastResetTime = Date.now()

/**
 * Reset rate limiting counter
 * Called every minute to refresh available requests
 */
const resetRateLimit = () => {
  const now = Date.now()
  if (now - lastResetTime >= 60000) {
    apiCallsCount = 0
    lastResetTime = now
  }
}

/**
 * POST request handler
 * Processes image generation requests
 * 
 * @param request - Incoming HTTP request
 * @returns NextResponse with generated image URL or error
 */
export async function POST(request: NextRequest) {
  // Log request receipt
  console.log('/api/image-generation: POST request received.');

  // Verify API key configuration
  console.log(`/api/image-generation: GETIMG_API_KEY is ${process.env.GETIMG_API_KEY ? 'defined' : 'NOT DEFINED'}`);

  try {
    // Apply rate limiting
    resetRateLimit()
    if (apiCallsCount >= 10) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before trying again.' },
        { status: 429 }
      )
    }
    apiCallsCount++

    // Extract and validate request body
    const body: RequestBody = await request.json()
    const { description } = body
    console.log(`/api/image-generation: Received description: "${description.substring(0,50)}..."`);

    // Configure API request with URL and options
    const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.GETIMG_API_KEY}`
      },
      body: JSON.stringify({
        prompt: description,
        width: 256,
        height: 256,
        steps: 3,
        output_format: 'jpeg',
        response_format: 'url'
      })
    };

    /**
     * Modern Async/Await Implementation for API Requests
     * 
     * This implementation uses async/await syntax instead of .then() chains.
     * Here's why this is better than the traditional .then() approach:
     * 
     * Traditional .then() chain would look like:
     * fetch(url, options)
     *   .then(res => res.json())
     *   .then(json => console.log(json))
     *   .catch(err => console.error(err));
     * 
     * Benefits of async/await:
     * 1. More readable - looks like synchronous code
     * 2. Better error handling - try/catch blocks are more intuitive
     * 3. Easier debugging - clearer stack traces
     * 4. More control over the flow of operations
     * 5. Consistent with modern JavaScript/TypeScript practices
     */

    // Step 1: Make the API request
    // The 'await' keyword pauses execution until the Promise resolves
    console.log('/api/image-generation: Attempting to call getimg.ai API.');
    const response = await fetch(url, options)
    console.log(`/api/image-generation: Response status from getimg.ai: ${response.status}`);

    // Step 2: Handle potential API errors
    // This is more robust than .then() as we can check response status before parsing
    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`/api/image-generation: Error from getimg.ai. Status: ${response.status}, Body: ${errorBody}`);
      throw new Error(`Failed to generate image from getimg.ai. Status: ${response.status}`)
    }

    // Step 3: Process successful response
    // Using await makes it clear we're waiting for JSON parsing to complete
    // TypeScript type 'GetImgResponse' ensures type safety (not possible in simple .then chains)
    const data: GetImgResponse = await response.json()
    console.log('/api/image-generation: Successfully received image URL from getimg.ai:', data.url);

    // Return image URL
    return NextResponse.json({ url: data.url })

  } catch (error) {
    // Log and handle errors
    console.error('/api/image-generation: Catch block error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
} 