import { useEffect } from 'react';

/**
 * Hook to apply image blur mode for privacy
 * This hook will add 'blur-images-mode' class to document.body
 * when NEXT_PUBLIC_BLUR_IMAGES is set to 'true'
 */
export const useImageBlurMode = () => {
  useEffect(() => {
    // Check if image blur is enabled via environment variable
    const shouldBlurImages = process.env.NEXT_PUBLIC_BLUR_IMAGES === 'true';
    
    if (shouldBlurImages) {
      // Add blur-images-mode class to body
      document.body.classList.add('blur-images-mode');
      
      // Also add a visual indicator
      console.log('� Privacy mode: Images are blurred');
    }
    
    // Cleanup
    return () => {
      if (shouldBlurImages) {
        document.body.classList.remove('blur-images-mode');
      }
    };
  }, []);
};
