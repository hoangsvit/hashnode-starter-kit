import { useEffect, useState } from 'react';

interface UseLightboxProps {
	contentRef: React.RefObject<HTMLDivElement>;
}

export const useLightbox = ({ contentRef }: UseLightboxProps) => {
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const [lightboxImage, setLightboxImage] = useState({
		src: '',
		alt: '',
	});

	// Initialize lightbox functionality
	useEffect(() => {
		if (!contentRef.current) return;

		// Save a reference to the current DOM node
		const currentContentRef = contentRef.current;

		// Function to handle image click events
		const handleImageClick = (e: Event) => {
			const target = e.target as HTMLElement;

			// Check if the clicked element is an image
			if (target.tagName === 'IMG') {
				e.preventDefault();

				const imgElement = target as HTMLImageElement;
				// Get the original high-resolution image if available
				const originalSrc = imgElement.dataset.originalSrc || imgElement.src;

				setLightboxImage({
					src: originalSrc,
					alt: imgElement.alt || 'Image',
				});
				setIsLightboxOpen(true);
			}
		};

		// Add lightbox capability to images in the content
		const addLightboxToImages = () => {
			const images = currentContentRef?.querySelectorAll('img') || [];
			images.forEach((img) => {
				// Skip images that already have event listeners or are inside figures
				if (img.classList.contains('lightbox-enabled')) return;

				// Add cursor pointer and hover effect
				img.style.cursor = 'pointer';

				// Store original src as data attribute if not already present
				if (!img.dataset.originalSrc && img.src) {
					// Get full resolution image URL if it's using srcset
					const fullResSrc = img.currentSrc || img.src;
					img.dataset.originalSrc = fullResSrc;
				}

				// Add title attribute for better UX - different for mobile and desktop
				if (!img.title) {
					const isMobile = window.innerWidth <= 768;
					img.title = isMobile ? 'Tap to view in fullscreen' : 'Click to view in lightbox';
				}

				// Remove transform effect on mobile (often causes issues with tap detection)
				if (window.innerWidth <= 768) {
					// Use a smaller transform scale on mobile to avoid UI issues
					img.addEventListener('touchstart', () => {
						img.style.transform = 'scale(1.005)';
					});
					img.addEventListener('touchend', () => {
						img.style.transform = '';
					});
				}

				// Add class to mark as processed
				img.classList.add('lightbox-enabled');

				// Add click event listener
				img.addEventListener('click', handleImageClick);
			});
		};

		// Initial setup
		addLightboxToImages();

		// Set up a MutationObserver to handle dynamically added content
		const observer = new MutationObserver(() => {
			addLightboxToImages();
		});

		observer.observe(currentContentRef, {
			childList: true,
			subtree: true,
		});

		// Cleanup
		return () => {
			const images = currentContentRef.querySelectorAll('img.lightbox-enabled');
			images.forEach((img) => {
				img.removeEventListener('click', handleImageClick);
			});
			observer.disconnect();
		};
	}, [contentRef]);

	return {
		isLightboxOpen,
		lightboxImage,
		closeLightbox: () => setIsLightboxOpen(false),
	};
};
