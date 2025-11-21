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
    <div className="pointer-events-none fixed top-4 right-4 z-50 w-48 sm:w-64 md:w-80 opacity-95">
      <lottie-player
        src="/animations/santa-sleigh.json"
        background="transparent"
        speed="1"
        style={{ width: '100%', height: '100%' }}
        loop
        autoplay
      />
    </div>
  );
};

export default SantaSleigh;
