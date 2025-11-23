'use client';
import { useEffect, useRef, useState, startTransition } from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'lottie-player': any;
        }
    }
}

export function Santa() {
    const playerRef = useRef<any>(null);
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        // Check initial state
        const savedState = localStorage.getItem('snow-enabled');
        if (savedState !== null) {
            startTransition(() => {
                setIsEnabled(JSON.parse(savedState));
            });
        }

        // Listen for toggle events
        const handleToggle = (e: CustomEvent) => {
            startTransition(() => {
                setIsEnabled(e.detail.enabled);
            });
        };

        window.addEventListener('snow-toggle', handleToggle as EventListener);
        return () => window.removeEventListener('snow-toggle', handleToggle as EventListener);
    }, []);

    useEffect(() => {
        if (!isEnabled) return;

        // Import lottie-player only if not already defined
        if (typeof window !== 'undefined' && !customElements.get('lottie-player')) {
            import('@lottiefiles/lottie-player');
        }

        // Add global styles for animation
        const styleId = 'santa-flying-animation';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
				@keyframes fly-across {
					0% {
						transform: translateX(-500px);
					}
					100% {
						transform: translateX(calc(100vw + 500px));
					}
				}

				.santa-flying {
					animation: fly-across 20s linear infinite;
					z-index: 9999 !important;
                    pointer-events: none;
                    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
                    width: 500px;
                    height: 250px;
				}
			`;
            document.head.appendChild(style);
        }
    }, [isEnabled]);

    const now = new Date();
    const month = now.getMonth(); // 0-11
    const date = now.getDate();
    // Show from Oct 1 (month 9) to Jan 15 (month 0, date <= 15)
    const isChristmasSeason = (month >= 9) || (month === 0 && date <= 15);

    if (!isEnabled || !isChristmasSeason) return null;

    return (
        <div
            className="pointer-events-none fixed bottom-20 left-0 santa-flying"
            style={{ zIndex: 9999 }}
            suppressHydrationWarning
        >
            <lottie-player
                ref={playerRef}
                src="/animations/santa-sleigh.json"
                background="transparent"
                speed={1}
                style={{ width: '100%', height: '100%' }}
                loop={true}
                autoplay={true}
                suppressHydrationWarning
            />
        </div>
    );
}
