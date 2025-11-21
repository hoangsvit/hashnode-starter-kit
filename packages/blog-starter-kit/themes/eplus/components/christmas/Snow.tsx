import { useEffect, useRef } from 'react';

export const Snow = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
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
			const count = Math.min(100, Math.floor((canvas.width * canvas.height) / 10000));
			for (let i = 0; i < count; i++) {
				snowflakes.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					radius: Math.random() * 3 + 1,
					speed: Math.random() * 1 + 0.5,
					drift: Math.random() * 0.5 - 0.25,
				});
			}
		};

		createSnowflakes();

		// Animation loop
		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
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
			requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener('resize', resizeCanvas);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none fixed inset-0 z-50"
			style={{ mixBlendMode: 'screen' }}
		/>
	);
};
