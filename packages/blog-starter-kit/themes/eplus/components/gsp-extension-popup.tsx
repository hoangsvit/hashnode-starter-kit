import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import Button from './hn-button';
import { CloseSVG } from './icons/svgs';
import { PostFullFragment } from '../generated/graphql';
import Image from 'next/image';

// Custom animation styles (these will be added at build time via Tailwind's JIT compiler)
// If you need to add these manually to your CSS, you can do so
const animationStyles = {
  fadeIn: `@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 0.5; }
  }
  .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }`,
  
  scaleIn: `@keyframes scaleIn {
    from { transform: translate(-50%, -50%) scale(0.95); opacity: 0; }
    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }
  .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }`
};

type GSPExtensionPopupProps = {
  post: PostFullFragment;
};

/**
 * Check if the post is related to Google Skills Program (GSP)
 */
const isGSPRelatedPost = (post: PostFullFragment): boolean => {
  // Check if the post title includes GSP-related keywords
  const gspKeywords = ['gsp', 'google skills program', 'google cloud', 'gcp', 'cloud skills', 'qwiklabs'];
  const postTitle = post.title.toLowerCase();
  const postContent = post.content?.html?.toLowerCase() || '';
  
  return (
    // Check title
    gspKeywords.some(keyword => postTitle.includes(keyword.toLowerCase())) ||
    // Also check post content for more broad detection
    gspKeywords.some(keyword => postContent.includes(keyword.toLowerCase()))
  );
};

export const GSPExtensionPopup: React.FC<GSPExtensionPopupProps> = ({ post }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [dismissedPermanently, setDismissedPermanently] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Check for stored state and set browser environment on mount
  useEffect(() => {
    setIsBrowser(true);
    
    // Safe localStorage access only on client side
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('gsp-extension-dismissed');
      if (dismissed === 'true') {
        setDismissedPermanently(true);
      } else {
        // Auto show popup after 5 seconds if not dismissed
        const timer = setTimeout(() => {
          const lastShownTime = sessionStorage.getItem('gsp-extension-last-shown');
          const now = new Date().getTime();
          
          if (lastShownTime) {
            const timeSinceLastShown = now - parseInt(lastShownTime);
            // Only show once per hour (3600000 ms) per session
            if (timeSinceLastShown < 3600000) {
              return;
            }
          }
          
          setShowPopup(true);
          sessionStorage.setItem('gsp-extension-last-shown', now.toString());
        }, 5000); // 5 seconds delay
        
        return () => clearTimeout(timer); // Clean up on unmount
      }
    }
  }, []);
  
  // Don't render anything if this post is not GSP-related or popup dismissed
  if (!isGSPRelatedPost(post) || dismissedPermanently) {
    return null;
  }
  
  const closePopup = () => {
    setShowPopup(false);
  };
  
  const closePopupPermanently = () => {
    setShowPopup(false);
    setDismissedPermanently(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gsp-extension-dismissed', 'true');
    }
  };
  
  return (
    <>
      {/* Add animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles.fadeIn + animationStyles.scaleIn }} />
      
      <DialogPrimitive.Root open={showPopup} onOpenChange={closePopup}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 bg-slate-900 opacity-50 transition-opacity duration-300 ease-out dark:bg-slate-600 animate-fadeIn"
            onClick={closePopup}
          />
          <DialogPrimitive.Content
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md flex-col items-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-700 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 md:max-w-xl lg:max-w-2xl animate-scaleIn"
            onEscapeKeyDown={closePopup}
          >
            <div className="relative p-6">
              <DialogPrimitive.Close className="absolute right-3 top-3 text-slate-900 dark:text-slate-50" asChild>
                <Button
                  className="p-1 focus:outline-none focus-visible:ring focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800"
                  onClick={closePopup}
                  aria-label="Close extension popup"
                  variant="transparent"
                >
                  <CloseSVG className="h-5 w-5 fill-current" />
                </Button>
              </DialogPrimitive.Close>
              
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 flex-shrink-0 relative bg-blue-50 dark:bg-blue-900/30 rounded-full p-1">
                  <Image 
                    src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Google_Cloud.max-500x500.png" 
                    alt="Google Cloud Logo" 
                    className="rounded-full object-contain"
                    width={48}
                    height={48}
                  />
                </div>
                <h2 className="text-xl font-semibold">Google Cloud Skills Boost - Helper</h2>
              </div>
              
              <p className="mb-4 text-sm">
                Looking to complete Google Cloud Skills Boost labs more efficiently? This Chrome extension helps you track lab progress, provides quick references, and offers helpful shortcuts while working on Google Cloud hands-on labs.
              </p>
              
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold mb-1 text-blue-700 dark:text-blue-300">📘 Disclaimer</h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  <strong>For Educational Use Only:</strong> This repository and the included script are provided strictly for learning purposes. 
                  They are meant to help you explore and understand Google Cloud&apos;s monitoring services more effectively and build your cloud skills.
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>📝 Read Before Use:</strong> Please review the script carefully before running it to ensure you understand how the services involved work.
                </p>
              </div>
              
              <div className="relative w-full mb-5 rounded-lg overflow-hidden aspect-video">
                <iframe 
                  src="https://www.youtube.com/embed/lcQywccAT4A" 
                  title="Google Cloud Skills Boost Extension"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0"
                ></iframe>
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row mt-5 justify-center">
                <a 
                  href="https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block rounded-md bg-blue-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  Install Extension
                </a>
                <Button 
                  onClick={closePopupPermanently}
                  variant="transparent" 
                  className="text-sm"
                >
                  Don&apos;t show again
                </Button>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
};

export default GSPExtensionPopup;
