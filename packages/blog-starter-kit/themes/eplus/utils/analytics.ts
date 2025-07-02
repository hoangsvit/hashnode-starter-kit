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

// Environment checks
const isProd = process.env.NEXT_PUBLIC_MODE === 'production';
const isDevAnalyticsEnabled = process.env.NEXT_PUBLIC_GA_DEV_MODE === 'true';

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
 * Log analytics events in development mode
 */
const logDevEvent = (eventName: string, eventData: any) => {
	if (!isProd && isDevAnalyticsEnabled) {
		console.log(`🔍 GA Dev Mode - ${eventName}:`, eventData);
	}
};

/**
 * Track page view manually (tự động được gọi trong Analytics component)
 */
export const trackPageView = (url?: string, title?: string) => {
	const eventData = {
		page_title: title || document.title,
		page_location: url || window.location.href,
		page_path: window.location.pathname,
	};

	logDevEvent('Page View', eventData);

	if (!isGAReady()) return;

	window.gtag('event', 'page_view', eventData);
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
	const eventData = {
		event_category: category,
		event_label: label,
		value: value,
		...customParams,
	};

	logDevEvent(`Event: ${action}`, eventData);

	if (!isGAReady()) return;

	window.gtag('event', action, eventData);
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
