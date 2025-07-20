import React from 'react';

interface ReadingProgressProps {
  progress: number;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({ progress }) => {
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

      {/* Circular progress indicator */}
      {progress > 5 && (
        <div
          className="reading-progress-circle fixed bottom-8 right-8 z-40 h-12 w-12 rounded-full border-2 border-slate-300 bg-white/90 backdrop-blur-sm shadow-lg dark:border-slate-600 dark:bg-slate-800/90"
          style={{
            background: `conic-gradient(#3b82f6 ${progress * 3.6}deg, #e2e8f0 0deg)`,
          }}
        >
          <div className="absolute inset-1 flex items-center justify-center rounded-full bg-white dark:bg-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default ReadingProgress;
