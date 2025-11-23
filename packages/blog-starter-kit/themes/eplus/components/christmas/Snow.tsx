'use client';
import { useEffect, useRef, useState, startTransition } from 'react';

export function Snow() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        // Initial check for preference
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('snow-enabled');
            if (stored !== null) {
                setIsEnabled(stored === 'true');
            }
        }

        const handleToggle = () => {
            const stored = localStorage.getItem('snow-enabled');
            if (stored !== null) {
                setIsEnabled(stored === 'true');
            }
        };

        window.addEventListener('snow-toggle', handleToggle);

        // Initial check for theme
        startTransition(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    startTransition(() => {
                        setIsDarkMode(document.documentElement.classList.contains('dark'));
                    });
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
            window.removeEventListener('snow-toggle', handleToggle);
        };
    }, []);

    useEffect(() => {
        if (!isEnabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Snowflake configuration
        const snowflakes: Array<{
            x: number;
            y: number;
            radius: number;
            speed: number;
            drift: number;
        }> = [];

        const createSnowflakes = () => {
            const count = Math.min(150, Math.floor((canvas.width * canvas.height) / 8000));
            for (let i = 0; i < count; i++) {
                snowflakes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 4 + 2,
                    speed: Math.random() * 1.5 + 0.8,
                    drift: Math.random() * 0.8 - 0.4,
                });
            }
        };

        createSnowflakes();

        // Animation loop
        let animationFrameId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Adjust color and shadow based on theme
            if (isDarkMode) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';
            } else {
                ctx.fillStyle = 'rgba(220, 230, 240, 0.9)'; // Very light cool gray
                ctx.shadowBlur = 2;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'; // Subtle shadow for depth
            }

            ctx.beginPath();

            snowflakes.forEach((flake) => {
                ctx.moveTo(flake.x, flake.y);
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);

                // Update position
                flake.y += flake.speed;
                flake.x += flake.drift;

                // Reset snowflake if it goes off screen
                if (flake.y > canvas.height) {
                    flake.y = -10;
                    flake.x = Math.random() * canvas.width;
                }
                if (flake.x > canvas.width) {
                    flake.x = 0;
                } else if (flake.x < 0) {
                    flake.x = canvas.width;
                }
            });

            ctx.fill();
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDarkMode, isEnabled]); // Re-run effect when theme changes to update color

    const now = new Date();
    const month = now.getMonth(); // 0-11
    const date = now.getDate();
    // Show from Oct 1 (month 9) to Jan 15 (month 0, date <= 15)
    const isChristmasSeason = (month >= 9) || (month === 0 && date <= 15);

    if (!isEnabled || !isChristmasSeason) return null;

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-50"
            style={{ mixBlendMode: isDarkMode ? 'screen' : 'normal' }}
        />
    );
}
