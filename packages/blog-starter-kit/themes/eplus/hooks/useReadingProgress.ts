import { useEffect, useState } from 'react';

export const useReadingProgress = () => {
	const [completion, setCompletion] = useState(0);

	useEffect(() => {
		const updateScrollCompletion = () => {
			// Find the post content element
			const postContentParent = document.getElementById('post-content-parent');

			if (!postContentParent) {
				setCompletion(0);
				return;
			}

			// Get the current scroll position
			const currentProgress = window.scrollY;

			// Get the post content position and height
			const rect = postContentParent.getBoundingClientRect();
			const postContentTop = rect.top + window.scrollY;
			const postContentHeight = rect.height;

			// Calculate reading progress based on post content area
			const viewportHeight = window.innerHeight;

			// Calculate progress: 0% when post starts appearing, 100% when post completely read
			let progress = 0;

			if (currentProgress + viewportHeight >= postContentTop) {
				const visibleHeight = Math.min(
					currentProgress + viewportHeight - postContentTop,
					postContentHeight,
				);
				progress = (visibleHeight / postContentHeight) * 100;
				progress = Math.min(Math.max(progress, 0), 100);
			}

			setCompletion(progress);
		};

		// Add scroll event listener
		window.addEventListener('scroll', updateScrollCompletion);

		// Update on mount and when DOM changes
		updateScrollCompletion();

		// Also update after a short delay to ensure DOM is fully loaded
		const timeoutId = setTimeout(updateScrollCompletion, 100);

		// Cleanup
		return () => {
			window.removeEventListener('scroll', updateScrollCompletion);
			clearTimeout(timeoutId);
		};
	}, []);

	return completion;
};
