import React, { useCallback, useEffect, useState } from 'react';

interface ReadingProgressWithBackToTopProps {
  progress: number;
}

const ReadingProgressWithBackToTop: React.FC<ReadingProgressWithBackToTopProps> = ({ progress }) => {
  const [showButton, setShowButton] = useState(false);
  const [snowEnabled, setSnowEnabled] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down more than 200px
      setShowButton(window.scrollY > 200);
    };

    // Initial check for snow preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('snow-enabled');
      if (stored !== null) {
        setSnowEnabled(stored === 'true');
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleSnow = useCallback(() => {
    const newState = !snowEnabled;
    setSnowEnabled(newState);
    localStorage.setItem('snow-enabled', String(newState));
    window.dispatchEvent(new Event('snow-toggle'));
  }, [snowEnabled]);

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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center">
        {/* Snow Toggle Button */}
        {(() => {
          const now = new Date();
          const month = now.getMonth(); // 0-11
          const date = now.getDate();
          // Show from Oct 1 (month 9) to Jan 15 (month 0, date <= 15)
          const isChristmasSeason = (month >= 9) || (month === 0 && date <= 15);

          if (!isChristmasSeason) return null;

          return (
            <button
              onClick={toggleSnow}
              className="group rounded-full bg-white/95 backdrop-blur-sm p-3 text-slate-700 shadow-lg border border-slate-200 transition-all duration-200 hover:bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 dark:bg-slate-800/95 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900"
              aria-label={snowEnabled ? "Disable snow" : "Enable snow"}
              title={snowEnabled ? "Disable snow" : "Enable snow"}
            >
              {snowEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <line x1="2" y1="2" x2="22" y2="22"></line>
                  <path d="M2.5 10l1.83-1.83"></path>
                  <path d="M21.5 14l-1.83 1.83"></path>
                  <path d="M10 2.5l1.83 1.83"></path>
                  <path d="M14 21.5l-1.83-1.83"></path>
                  <path d="M18 6l-1.5 1.5"></path>
                  <path d="M6 18l1.5-1.5"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M10 14l1.5 1.5"></path>
                  <path d="M12.5 11.5l1.5 1.5"></path>
                  <path d="M10 10l4 4"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="M4.93 4.93l1.41 1.41"></path>
                  <path d="M17.66 17.66l1.41 1.41"></path>
                  <path d="M4.93 19.07l1.41-1.41"></path>
                  <path d="M17.66 6.34l1.41-1.41"></path>
                </svg>
              )}
            </button>
          );
        })()}

        {/* Back to Top Button */}
        {showButton && (
          <div className="relative">
            {/* Outer Progress Circle */}
            <div
              className="absolute -inset-2 rounded-full transition-all duration-300"
              style={{
                background: `conic-gradient(#3b82f6 ${progress * 3.6}deg, rgba(148, 163, 184, 0.2) 0deg)`,
              }}
            />

            {/* Inner circle to create ring effect */}
            <div className="absolute -inset-1 rounded-full bg-white dark:bg-slate-900" />

            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="relative group rounded-full bg-white/95 backdrop-blur-sm p-3 text-slate-700 shadow-lg border border-slate-200 transition-all duration-200 hover:bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 dark:bg-slate-800/95 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900"
              aria-label="Scroll to top"
            >
              {/* Progress percentage badge */}
              {progress > 1 && (
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
      </div>
    </>
  );
};

export default ReadingProgressWithBackToTop;
