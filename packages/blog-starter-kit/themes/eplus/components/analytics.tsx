import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useAppContext } from './contexts/appContext';
const isProd = process.env.NEXT_PUBLIC_MODE === 'production';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_URL || '';

export const Analytics = () => {
	const { publication, post, series, page } = useAppContext();
	const gaTrackingID = publication.integrations?.gaTrackingID || process.env.NEXT_PUBLIC_GA_TRACKING_ID;

	useEffect(() => {
		if (!isProd) return;

		const _sendPageViewsToGoogleAnalytics = () => {
			if (!gaTrackingID || typeof window === 'undefined') return;
			
			// @ts-ignore
			if (typeof window.gtag !== 'undefined') {
				// @ts-ignore
				window.gtag('config', gaTrackingID, {
					page_title: document.title,
					page_location: window.location.href,
				});
				// @ts-ignore
				window.gtag('event', 'page_view', {
					page_title: document.title,
					page_location: window.location.href,
					page_path: window.location.pathname,
				});
			}
		};

		const _sendViewsToHashnodeInternalAnalytics = async () => {
			// Send to Hashnode's own internal analytics
			const event: Record<string, string | number | object> = {
				event_type: 'pageview',
				time: new Date().getTime(),
				event_properties: {
					hostname: window.location.hostname,
					url: window.location.pathname,
					eventType: 'pageview',
					publicationId: publication.id,
					dateAdded: new Date().getTime(),
					referrer: window.document.referrer,
				},
			};

			let deviceId = Cookies.get('__amplitudeDeviceID');
			if (!deviceId) {
				deviceId = uuidv4();
				Cookies.set('__amplitudeDeviceID', deviceId, {
					expires: 365 * 2,
				}); // expire after two years
			}

			event['device_id'] = deviceId;

			await fetch(`${BASE_PATH}/ping/data-event`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ events: [event] }),
			});
		};

		const _sendViewsToAdvancedAnalyticsDashboard = () => {
			const publicationId = publication.id;
			const postId = post?.id;
			const seriesId = series?.id || post?.series?.id;
			const staticPageId = page?.id;

			const data = {
				publicationId,
				postId,
				seriesId,
				staticPageId,
			};

			if (!publicationId) {
				console.warn('Publication ID is missing; could not send analytics.');
				return;
			}

			const isBrowser = typeof window !== 'undefined';
			if (!isBrowser) {
				return;
			}

			const isLocalhost = window.location.hostname === 'localhost';
			if (isLocalhost) {
				console.warn(
					'Analytics API call is skipped because you are running on localhost; data:',
					data,
				);
				return;
			}

			const event = {
				// timestamp will be added in API
				payload: {
					publicationId,
					postId: postId || null,
					seriesId: seriesId || null,
					pageId: staticPageId || null,
					url: window.location.href,
					referrer: document.referrer || null,
					language: navigator.language || null,
					screen: `${window.screen.width}x${window.screen.height}`,
				},
				type: 'pageview',
			};

			const blob = new Blob(
				[
					JSON.stringify({
						events: [event],
					}),
				],
				{
					type: 'application/json; charset=UTF-8',
				},
			);

			let hasSentBeacon = false;
			try {
				if (navigator.sendBeacon) {
					hasSentBeacon = navigator.sendBeacon(`${BASE_PATH}/api/analytics`, blob);
				}
			} catch (error) {
				console.warn('SendBeacon failed, falling back to fetch:', error);
			}

			if (!hasSentBeacon) {
				fetch(`${BASE_PATH}/api/analytics`, {
					method: 'POST',
					body: blob,
					credentials: 'omit',
					keepalive: true,
				});
			}
		};

		_sendPageViewsToGoogleAnalytics();
		_sendViewsToHashnodeInternalAnalytics();
		_sendViewsToAdvancedAnalyticsDashboard();
	}, [gaTrackingID, publication.id, post?.id, post?.series?.id, series?.id, page?.id]);

	return null;
};
