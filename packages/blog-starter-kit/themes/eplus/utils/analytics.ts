/**
 * Google Analytics utilities
 * Wrapper functions để dễ dàng track events và page views
 */

declare global {
	interface Window {
		gtag: (...args: any[]) => void;
		dataLayer: any[];
	}
}

/**
 * Check if Google Analytics is loaded and ready
 */
export const isGAReady = (): boolean => {
	return (
		typeof window !== 'undefined' && 
		typeof window.gtag === 'function' &&
		window.dataLayer && 
		Array.isArray(window.dataLayer)
	);
};

/**
 * Track page view manually (tự động được gọi trong Analytics component)
 */
export const trackPageView = (url?: string, title?: string) => {
	if (!isGAReady()) return;

	window.gtag('event', 'page_view', {
		page_title: title || document.title,
		page_location: url || window.location.href,
		page_path: window.location.pathname,
	});
};

/**
 * Track custom event
 */
export const trackEvent = (
	action: string,
	category: string,
	label?: string,
	value?: number,
	customParams?: Record<string, any>
) => {
	if (!isGAReady()) return;

	window.gtag('event', action, {
		event_category: category,
		event_label: label,
		value: value,
		...customParams,
	});
};

/**
 * Track button click
 */
export const trackButtonClick = (buttonName: string, location?: string) => {
	const label = location ? `${buttonName}_${location}` : buttonName;
	trackEvent('click', 'engagement', label);
};

/**
 * Track link click (external)
 */
export const trackExternalLinkClick = (url: string, linkText?: string) => {
	trackEvent('click', 'outbound_link', linkText || url, undefined, {
		destination_url: url,
	});
};

/**
 * Track file download
 */
export const trackFileDownload = (fileName: string, fileType?: string) => {
	trackEvent('download', 'file', fileName, undefined, {
		file_type: fileType,
	});
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
	trackEvent('search', 'site_search', searchTerm, resultsCount);
};

/**
 * Track scroll depth (call this when user scrolls to certain percentage)
 */
export const trackScrollDepth = (percentage: number) => {
	trackEvent('scroll', 'engagement', `${percentage}%`, percentage);
};

/**
 * Track time on page (call this periodically or on page exit)
 */
export const trackTimeOnPage = (seconds: number) => {
	trackEvent('timing_complete', 'engagement', 'time_on_page', seconds);
};

/**
 * Set user properties (demographics, preferences, etc.)
 */
export const setUserProperties = (properties: Record<string, any>) => {
	if (!isGAReady()) return;

	window.gtag('config', 'GA_MEASUREMENT_ID', {
		user_properties: properties,
	});
};

/**
 * Example usage:
 * 
 * // Track button click
 * trackButtonClick('subscribe', 'header');
 * 
 * // Track external link
 * trackExternalLinkClick('https://example.com', 'Read more');
 * 
 * // Track custom event
 * trackEvent('video_play', 'engagement', 'intro_video', 30);
 * 
 * // Track search
 * trackSearch('react hooks', 15);
 */
