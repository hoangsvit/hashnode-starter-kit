import { useEffect, useRef } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'lottie-player': any;
        }
    }
}

export const Santa = () => {
    const playerRef = useRef<any>(null);

    useEffect(() => {
        // Ensure lottie-player is loaded
        if (typeof window !== 'undefined' && !customElements.get('lottie-player')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    return (
        <div className="pointer-events-none fixed bottom-4 left-4 z-40 opacity-80 transition-opacity hover:opacity-100">
            <lottie-player
                ref={playerRef}
                src="/animations/santa-sleigh.json"
                background="transparent"
                speed="1"
                style={{ width: '200px', height: '200px' }}
                loop
                autoplay
            />
        </div>
    );
};
