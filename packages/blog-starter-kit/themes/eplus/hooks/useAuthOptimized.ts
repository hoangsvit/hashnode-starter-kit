import { useCallback, useEffect, useRef, useState } from 'react';
import {
	clearAuthFlags,
	createUserDataHash,
	getCachedUserDataHash,
	isAuthenticatedByCookie,
	needsAuthVerification,
	setAuthFlag,
	setCachedUserDataHash,
} from '../utils/auth-cookies';

interface User {
	id: string;
	name: string;
	username?: string;
	profilePicture?: string | null;
	email?: string;
	bio?: string | null;
	location?: string | null;
	tagline?: string | null;
	dateJoined?: string;
	followersCount?: number;
	followingsCount?: number;
	socialMediaLinks?: {
		twitter?: string;
		linkedin?: string;
		github?: string;
		website?: string;
	};
}

interface UseAuthReturn {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (token: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
}

// Constants
const CHECK_INTERVAL = 30000; // 30 seconds minimum between checks
const VERIFY_INTERVAL = 30 * 60 * 1000; // 30 minutes for server verification

/**
 * Optimized authentication hook with cookie-based fast checks
 */
export const useAuthOptimized = (): UseAuthReturn => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const isCheckingAuth = useRef(false);
	const lastCheckTime = useRef(0);
	const isInitializedRef = useRef(false);

	// Helper functions
	const getStoredUser = useCallback((): User | null => {
		if (typeof window === 'undefined') return null;

		try {
			const storedUser = localStorage.getItem('hashnode_user');
			return storedUser ? JSON.parse(storedUser) : null;
		} catch (error) {
			console.error('Failed to get stored user:', error);
			return null;
		}
	}, []);

	const storeUser = useCallback((userData: User): void => {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem('hashnode_user', JSON.stringify(userData));
			// Store token after successful login
			setAuthFlag(true);
			setCachedUserDataHash(createUserDataHash(userData));
		} catch (error) {
			console.error('Failed to store user info:', error);
		}
	}, []);

	const clearStoredUser = useCallback((): void => {
		if (typeof window === 'undefined') return;

		localStorage.removeItem('hashnode_user');
		localStorage.removeItem('hashnode_token');
		clearAuthFlags();
	}, []);

	/**
	 * Fast authentication check using cookie flags
	 */
	const isQuickAuthenticated = useCallback((): boolean => {
		if (!isAuthenticatedByCookie()) return false;

		const storedUser = getStoredUser();
		if (!storedUser) return false;

		// Verify user data integrity using hash
		const currentHash = createUserDataHash(storedUser);
		const cachedHash = getCachedUserDataHash();

		if (currentHash !== cachedHash) {
			console.log('🔄 User data hash mismatch, need verification');
			return false;
		}

		return true;
	}, [getStoredUser]);

	/**
	 * Check if auth verification should be throttled
	 */
	const shouldSkipAuthCheck = useCallback((): boolean => {
		if (isCheckingAuth.current) {
			console.log('🔄 Auth check already in progress, skipping...');
			return true;
		}

		const now = Date.now();
		if (now - lastCheckTime.current < CHECK_INTERVAL) {
			console.log('🕒 Auth check throttled, skipping...');
			return true;
		}

		return false;
	}, []);

	/**
	 * Perform server-side authentication verification
	 */
	const verifyWithServer = useCallback(async (): Promise<{ success: boolean; user?: User }> => {
		console.log('🌐 Making auth API call for server verification...');

		try {
			const response = await fetch('/api/check-auth', {
				method: 'GET',
				credentials: 'include',
			});

			if (response.ok) {
				const result = await response.json();
				if (result.authenticated && result.user) {
					console.log('✅ Server auth check successful');
					return { success: true, user: result.user };
				}
			}

			console.log('❌ Server auth check failed - HTTP error:', response.status);
			return { success: false };
		} catch (error) {
			console.error('❌ Server auth check failed with error:', error);
			return { success: false };
		}
	}, []);

	/**
	 * Handle authentication check with optimized flow
	 */
	const checkAuth = useCallback(async (): Promise<void> => {
		if (shouldSkipAuthCheck()) return;

		console.log('🔍 Starting auth check...');
		isCheckingAuth.current = true;
		lastCheckTime.current = Date.now();

		try {
			// First, check cookie flags for quick validation
			if (!isAuthenticatedByCookie()) {
				console.log('❌ No auth cookie flag found, clearing user state');
				setUser(null);
				clearStoredUser();
				setIsLoading(false);
				return;
			}

			// Check if server verification is needed
			if (!needsAuthVerification(VERIFY_INTERVAL)) {
				console.log('✅ Cookie-based auth check passed, skipping server verification');
				const storedUser = getStoredUser();
				if (storedUser && isQuickAuthenticated()) {
					setUser(storedUser);
					setIsLoading(false);
					return;
				}
			}

			// Perform server verification
			const verificationResult = await verifyWithServer();

			if (verificationResult.success && verificationResult.user) {
				setUser(verificationResult.user);
				storeUser(verificationResult.user);
			} else if (isAuthenticatedByCookie()) {
				// Handle verification failure - keep cached user if cookie exists
				console.log('🔄 Network error but auth cookie exists, keeping stored user');
				const storedUser = getStoredUser();
				if (storedUser) {
					setUser(storedUser);
				}
			} else {
				setUser(null);
				clearStoredUser();
			}
		} finally {
			setIsLoading(false);
			isCheckingAuth.current = false;
		}
	}, [
		shouldSkipAuthCheck,
		isQuickAuthenticated,
		verifyWithServer,
		getStoredUser,
		storeUser,
		clearStoredUser,
	]);

	/**
	 * Login function
	 */
	const login = useCallback(
		async (token: string): Promise<{ success: boolean; error?: string }> => {
			try {
				const response = await fetch('/api/identity', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({ token }),
				});

				if (response.ok) {
					const result = await response.json();
					if (result.success && result.user) {
						setUser(result.user);
						storeUser(result.user);
						// Store token after successful login
						if (typeof window !== 'undefined') {
							localStorage.setItem('hashnode_token', token);
						}
						return { success: true };
					}
				}

				const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
				return { success: false, error: errorData.message ?? 'Login failed' };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				return { success: false, error: errorMessage };
			}
		},
		[storeUser],
	);

	/**
	 * Logout function
	 */
	const logout = useCallback(async (): Promise<void> => {
		try {
			await fetch('/api/logout', {
				method: 'POST',
				credentials: 'include',
			});
		} catch (error) {
			console.error('Logout API error:', error);
		} finally {
			setUser(null);
			clearStoredUser();
		}
	}, [clearStoredUser]);

	/**
	 * Initialize authentication on mount
	 */
	useEffect(() => {
		const initAuth = async (): Promise<void> => {
			if (isInitializedRef.current) return;
			isInitializedRef.current = true;

			// Quick authentication check using cookie flags
			if (isQuickAuthenticated()) {
				console.log('✅ Quick auth check passed, using cached user data');
				const storedUser = getStoredUser();
				if (storedUser) {
					setUser(storedUser);
					setIsLoading(false);

					// Only do server verification if needed
					if (needsAuthVerification(VERIFY_INTERVAL)) {
						console.log('🔄 Server verification needed, checking...');
						checkAuth().catch(console.error);
					}
					return;
				}
			}

			// Fallback to full authentication check
			await checkAuth();
		};

		initAuth();

		// Cleanup function
		return () => {
			isInitializedRef.current = false;
		};
	}, [checkAuth, getStoredUser, isQuickAuthenticated]);

	return {
		user,
		isAuthenticated: !!user,
		isLoading,
		login,
		logout,
		checkAuth,
	};
};

// Export as default for backward compatibility
export const useAuth = useAuthOptimized;
