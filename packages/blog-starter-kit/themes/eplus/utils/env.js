/**
 * Environment utilities
 */

/**
 * Check if we are in development mode
 * @returns {boolean} true if in development mode
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if images should be blurred (controlled by NEXT_PUBLIC_BLUR_IMAGES)
 * @returns {boolean} true if images should be blurred
 */
export const shouldBlurImages = () => {
  return process.env.NEXT_PUBLIC_BLUR_IMAGES === 'true';
};
