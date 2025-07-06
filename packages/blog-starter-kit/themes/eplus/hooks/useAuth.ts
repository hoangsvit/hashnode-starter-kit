import { useCallback, useEffect, useRef, useState } from 'react';

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

	const getStoredToken = useCallback(() => {
		if (typeof window !== 'undefined') {
			try {
				return localStorage.getItem('hashnode_token');
			} catch (error) {
				console.error('Failed to get stored token:', error);
				return null;
			}
		}
		return null;
	}, []);

	const storeUser = useCallback((userData: User) => {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('hashnode_user', JSON.stringify(userData));
			} catch (error) {
				console.error('Failed to store user info:', error);
			}
		}
	}, []);

	const clearStoredUser = useCallback(() => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('hashnode_user');
			localStorage.removeItem('hashnode_token');
		}
	}, []);

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
			// Get token directly to avoid dependency issues
			const token = typeof window !== 'undefined' ? localStorage.getItem('hashnode_token') : null;

			// Only check authentication if token exists
			if (!token) {
				console.log('❌ No token found, clearing user state');
				setUser(null);
				clearStoredUser();
				setIsLoading(false);
				return;
			}

			console.log('🌐 Making auth API call...');
			const response = await fetch('/api/check-auth', {
				method: 'GET',
				credentials: 'include',
			});

			if (response.ok) {
				const result = await response.json();
				if (result.authenticated && result.user) {
					console.log('✅ Auth check successful');
					setUser(result.user);
					storeUser(result.user);
				} else {
					console.log('❌ Auth check failed - invalid response');
					setUser(null);
					clearStoredUser();
				}
			} else {
				console.log('❌ Auth check failed - HTTP error:', response.status);
				setUser(null);
				clearStoredUser();
			}
		} catch (error) {
			console.error('❌ Auth check failed with error:', error);
			setUser(null);
			clearStoredUser();
		} finally {
			setIsLoading(false);
			isCheckingAuth.current = false;
		}
	}, [storeUser, clearStoredUser]);

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

			// Get stored data once
			const storedUser = getStoredUser();
			const storedToken = getStoredToken();

			if (storedUser && storedToken) {
				// Use cached user data immediately for better UX
				setUser(storedUser);
				setIsLoading(false);
				// Only verify with server if enough time has passed
				const now = Date.now();
				if (now - lastCheckTime.current > CHECK_INTERVAL) {
					checkAuth().catch(console.error);
				}
			} else if (storedToken) {
				// Has token but no stored user, check authentication
				await checkAuth();
			} else {
				// No token means no authentication
				setUser(null);
				setIsLoading(false);
			}
		};

		initAuth();

		// Cleanup function
		return () => {
			isInitializedRef.current = false;
		};
	}, [checkAuth, getStoredUser, getStoredToken]); // Include dependencies but they're stable

	return {
		user,
		isAuthenticated: !!user,
		isLoading,
		login,
		logout,
		checkAuth,
	};
};
