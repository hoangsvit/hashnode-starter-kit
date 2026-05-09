import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': any;
    }
  }
}

const SantaSleigh: React.FC = () => {
  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-50 opacity-100"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}
      suppressHydrationWarning
    >
      <lottie-player
        src="/animations/santa-sleigh.json"
        background="transparent"
        speed={1}
        style={{ width: '350px', height: '350px' }}
        loop={true}
        autoplay={true}
        suppressHydrationWarning
      />
    </div>
  );
};

export default SantaSleigh;
