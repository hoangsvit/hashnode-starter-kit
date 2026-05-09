import { useCallback, useEffect, useRef, useState } from 'react';
import {
	isAuthenticatedByCookie,
	needsAuthVerification,
	setAuthFlag,
	clearAuthFlags,
	createUserDataHash,
	getCachedUserDataHash,
	setCachedUserDataHash
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

export const useAuth = (): UseAuthReturn => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const isCheckingAuth = useRef(false);
	const lastCheckTime = useRef(0);
	const isInitializedRef = useRef(false);
	const CHECK_INTERVAL = 30000; // 30 seconds minimum between checks
	const VERIFY_INTERVAL = 30 * 60 * 1000; // 30 minutes for server verification

	const getStoredUser = useCallback(() => {
		if (typeof window !== 'undefined') {
			try {
				const storedUser = localStorage.getItem('hashnode_user');
				return storedUser ? JSON.parse(storedUser) : null;
			} catch (error) {
				console.error('Failed to get stored user:', error);
				return null;
			}
		}
		return null;
	}, []);

	const storeUser = useCallback((userData: User) => {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('hashnode_user', JSON.stringify(userData));
				// Set authentication flag and user data hash
				setAuthFlag(true);
				setCachedUserDataHash(createUserDataHash(userData));
			} catch (error) {
				console.error('Failed to store user info:', error);
			}
		}
	}, []);

	const clearStoredUser = useCallback(() => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('hashnode_user');
			localStorage.removeItem('hashnode_token');
			clearAuthFlags();
		}
	}, []);

	/**
	 * Fast authentication check using cookie flags
	 */
	const isQuickAuthenticated = useCallback(() => {
		// Check if user is authenticated according to cookie flags
		if (!isAuthenticatedByCookie()) {
			return false;
		}

		// Check if we have stored user data
		const storedUser = getStoredUser();
		if (!storedUser) {
			return false;
		}

		// Verify user data integrity using hash
		const currentHash = createUserDataHash(storedUser);
		const cachedHash = getCachedUserDataHash();

		if (currentHash !== cachedHash) {
			console.log('🔄 User data hash mismatch, need verification');
			return false;
		}

		return true;
	}, [getStoredUser]);

	const checkAuth = useCallback(async () => {
		// Prevent multiple simultaneous auth checks
		if (isCheckingAuth.current) {
			console.log('🔄 Auth check already in progress, skipping...');
			return;
		}

		// Throttle auth checks to avoid too frequent calls
		const now = Date.now();
		if (now - lastCheckTime.current < CHECK_INTERVAL) {
			console.log('🕒 Auth check throttled, skipping...');
			return;
		}

		console.log('🔍 Starting auth check...');
		isCheckingAuth.current = true;
		lastCheckTime.current = now;

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

			console.log('🌐 Making auth API call for server verification...');
			const response = await fetch('/api/check-auth', {
				method: 'GET',
				credentials: 'include',
			});

			if (response.ok) {
				const result = await response.json();
				if (result.authenticated && result.user) {
					console.log('✅ Server auth check successful');
					setUser(result.user);
					storeUser(result.user);
				} else {
					console.log('❌ Server auth check failed - invalid response');
					setUser(null);
					clearStoredUser();
				}
			} else {
				console.log('❌ Server auth check failed - HTTP error:', response.status);
				setUser(null);
				clearStoredUser();
			}
		} catch (error) {
			console.error('❌ Auth check failed with error:', error);
			// Don't clear user on network errors if we have valid cookie flags
			if (isAuthenticatedByCookie()) {
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
	}, [storeUser, clearStoredUser, getStoredUser, isQuickAuthenticated, VERIFY_INTERVAL]);

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

	const logout = useCallback(async () => {
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

	useEffect(() => {
		// Use a ref to prevent multiple initialization calls
		const initAuth = async () => {
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
	}, [checkAuth, getStoredUser, isQuickAuthenticated, VERIFY_INTERVAL]); // Include dependencies

	return {
		user,
		isAuthenticated: !!user,
		isLoading,
		login,
		logout,
		checkAuth,
	};
};
