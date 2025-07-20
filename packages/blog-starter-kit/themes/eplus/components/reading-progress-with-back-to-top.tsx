import React, { useCallback, useEffect, useState } from 'react';

interface ReadingProgressWithBackToTopProps {
  progress: number;
}

const ReadingProgressWithBackToTop: React.FC<ReadingProgressWithBackToTopProps> = ({ progress }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down more than 200px
      setShowButton(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* Progress bar at top */}
      <div className="reading-progress-wrapper fixed top-0 left-0 right-0 z-50">
        <div
          className="reading-progress-bar h-1 transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #0f172a 100%)',
            boxShadow: progress > 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
          }}
        />
      </div>

      {/* Combined Back to Top Button with Progress Circle */}
      {showButton && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Outer Progress Circle */}
          <div 
            className="absolute -inset-1 rounded-full p-1 transition-all duration-300"
            style={{
              background: `conic-gradient(#3b82f6 ${progress * 3.6}deg, rgba(148, 163, 184, 0.2) 0deg)`,
            }}
          >
            {/* Inner white circle to create ring effect */}
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900" />
          </div>
          
          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="relative group rounded-full bg-white/95 backdrop-blur-sm p-3 text-slate-700 shadow-lg border border-slate-200 transition-all duration-200 hover:bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 dark:bg-slate-800/95 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900"
            aria-label="Scroll to top"
          >
            {/* Progress percentage badge */}
            {progress > 5 && (
              <div className="absolute -top-4 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm font-medium min-w-[2rem] text-center">
                {Math.round(progress)}%
              </div>
            )}
            
            {/* Arrow icon */}
            <svg 
              className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default ReadingProgressWithBackToTop;
