'use client';
import { useEffect, useRef } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'lottie-player': any;
        }
    }
}

export function Santa() {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Ensure lottie-player is loaded
        if (typeof window !== 'undefined' && !customElements.get('lottie-player')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
            script.async = true;
            document.head.appendChild(script);
        }

        // Add global styles for animation
        const styleId = 'santa-flying-animation';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
				@keyframes fly-across {
					0% {
						transform: translateX(-450px);
					}
					100% {
						transform: translateX(calc(100vw + 450px));
					}
				}

				.santa-flying {
					animation: fly-across 15s linear infinite;
					filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
					z-index: 9999 !important;
				}
			`;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className="pointer-events-none fixed bottom-20 left-0 santa-flying"
            style={{ zIndex: 9999 }}
            suppressHydrationWarning
        >
            <lottie-player
                ref={playerRef}
                src="/animations/santa-sleigh.json"
                background="transparent"
                speed={1}
                style={{ width: '400px', height: '400px' }}
                loop={true}
                autoplay={true}
                suppressHydrationWarning
            />
        </div>
    );
}
