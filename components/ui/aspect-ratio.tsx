/**
 * Aspect Ratio Component
 * 
 * A simple yet powerful component built with Radix UI that maintains a consistent width-to-height ratio.
 * This component follows SOLID principles despite its minimal implementation:
 * 
 * Single Responsibility (S):
 * - Focuses solely on maintaining aspect ratio of its children
 * - Delegates core functionality to Radix UI primitive
 * 
 * Open/Closed (O):
 * - Extensible through Radix UI's prop system
 * - Can be styled without modifying core logic
 * 
 * Liskov Substitution (L):
 * - Maintains all behavior of Radix UI's AspectRatio primitive
 * - Can be used anywhere the original primitive is expected
 * 
 * Interface Segregation (I):
 * - Exposes only necessary props from Radix UI
 * - Clean interface focused on aspect ratio control
 * 
 * Dependency Inversion (D):
 * - Depends on Radix UI's abstraction
 * - Implementation details handled by primitive
 * 
 * DRY Principles:
 * - Direct re-export prevents duplication
 * - Leverages existing Radix UI functionality
 * 
 * Features:
 * - Maintains consistent aspect ratio
 * - Responsive design support
 * - Handles various content types (images, videos, etc.)
 * - Preserves child element positioning
 * 
 * Usage Example:
 * ```tsx
 * <AspectRatio ratio={16/9}>
 *   <img src="..." alt="..." />
 * </AspectRatio>
 * ```
 */

"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

/**
 * Root Component
 * 
 * @component
 * @param {number} [ratio] - The desired aspect ratio (width/height)
 * 
 * Features:
 * - Maintains specified aspect ratio
 * - Handles window resizing
 * - Supports nested content
 */
const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }
