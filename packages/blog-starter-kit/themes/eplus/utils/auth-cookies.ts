/**
 * Utility functions for managing authentication cookies
 */

// Cookie names
export const AUTH_COOKIES = {
	TOKEN: 'hashnode_token',
	IS_AUTHENTICATED: 'is_authenticated',
	USER_DATA: 'user_data_hash',
	LAST_CHECK: 'last_auth_check',
} as const;

// Cookie options
export const COOKIE_OPTIONS = {
	MAX_AGE: 63072000, // 2 years in seconds
	PATH: '/',
	SAME_SITE: 'Strict',
	HTTP_ONLY: true,
} as const;

/**
 * Check if user is authenticated based on cookie flags
 */
export const isAuthenticatedByCookie = (): boolean => {
	if (typeof window === 'undefined') return false;

	try {
		// Check if authentication flag exists
		const authFlag = document.cookie
			.split('; ')
			.find((row) => row.startsWith(`${AUTH_COOKIES.IS_AUTHENTICATED}=`));

		if (!authFlag) return false;

		const value = authFlag.split('=')[1];
		return value === 'true';
	} catch (error) {
		console.error('Error checking auth cookie:', error);
		return false;
	}
};

/**
 * Get last authentication check timestamp from cookie
 */
export const getLastAuthCheck = (): number => {
	if (typeof window === 'undefined') return 0;

	try {
		const checkCookie = document.cookie
			.split('; ')
			.find((row) => row.startsWith(`${AUTH_COOKIES.LAST_CHECK}=`));

		if (!checkCookie) return 0;

		const value = checkCookie.split('=')[1];
		return parseInt(value, 10) || 0;
	} catch (error) {
		console.error('Error getting last auth check:', error);
		return 0;
	}
};

/**
 * Check if authentication verification is needed
 * @param maxAge Maximum age in milliseconds before reverification is needed
 */
export const needsAuthVerification = (maxAge: number = 30 * 60 * 1000): boolean => {
	const lastCheck = getLastAuthCheck();
	const now = Date.now();

	return now - lastCheck > maxAge;
};

/**
 * Set client-side authentication flag
 * Note: This is used for quick checks, but the actual token is HTTP-only
 */
export const setAuthFlag = (isAuthenticated: boolean): void => {
	if (typeof window === 'undefined') return;

	try {
		const expires = new Date();
		expires.setFullYear(expires.getFullYear() + 2);

		document.cookie = `${AUTH_COOKIES.IS_AUTHENTICATED}=${isAuthenticated}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;

		// Also set last check timestamp
		document.cookie = `${AUTH_COOKIES.LAST_CHECK}=${Date.now()}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
	} catch (error) {
		console.error('Error setting auth flag:', error);
	}
};

/**
 * Clear all authentication cookies (client-side flags only)
 */
export const clearAuthFlags = (): void => {
	if (typeof window === 'undefined') return;

	try {
		// Clear authentication flag
		document.cookie = `${AUTH_COOKIES.IS_AUTHENTICATED}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

		// Clear last check timestamp
		document.cookie = `${AUTH_COOKIES.LAST_CHECK}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
	} catch (error) {
		console.error('Error clearing auth flags:', error);
	}
};

/**
 * Create a simple hash of user data for cache validation
 */
export const createUserDataHash = (user: any): string => {
	if (!user) return '';

	const dataString = JSON.stringify({
		id: user.id,
		name: user.name,
		username: user.username,
		email: user.email,
	});

	// Simple hash function
	let hash = 0;
	for (let i = 0; i < dataString.length; i++) {
		const char = dataString.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	return hash.toString();
};

/**
 * Get cached user data hash
 */
export const getCachedUserDataHash = (): string => {
	if (typeof window === 'undefined') return '';

	try {
		const hashCookie = document.cookie
			.split('; ')
			.find((row) => row.startsWith(`${AUTH_COOKIES.USER_DATA}=`));

		if (!hashCookie) return '';

		return hashCookie.split('=')[1] || '';
	} catch (error) {
		console.error('Error getting cached user data hash:', error);
		return '';
	}
};

/**
 * Set cached user data hash
 */
export const setCachedUserDataHash = (hash: string): void => {
	if (typeof window === 'undefined') return;

	try {
		const expires = new Date();
		expires.setFullYear(expires.getFullYear() + 2);

		document.cookie = `${AUTH_COOKIES.USER_DATA}=${hash}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
	} catch (error) {
		console.error('Error setting cached user data hash:', error);
	}
};
