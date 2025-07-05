import { useCallback, useEffect, useState } from 'react';

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
		try {
			const token = getStoredToken();

			// Only check authentication if token exists
			if (!token) {
				setUser(null);
				clearStoredUser();
				setIsLoading(false);
				return;
			}

			const response = await fetch('/api/check-auth', {
				method: 'GET',
				credentials: 'include',
			});

			if (response.ok) {
				const result = await response.json();
				if (result.authenticated && result.user) {
					setUser(result.user);
					storeUser(result.user);
				} else {
					setUser(null);
					clearStoredUser();
				}
			} else {
				setUser(null);
				clearStoredUser();
			}
		} catch (error) {
			console.error('Auth check failed:', error);
			setUser(null);
			clearStoredUser();
		} finally {
			setIsLoading(false);
		}
	}, [storeUser, clearStoredUser, getStoredToken]);

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
		// First check localStorage for immediate UI update
		const storedUser = getStoredUser();
		const storedToken = getStoredToken();

		if (storedUser && storedToken) {
			setUser(storedUser);
			setIsLoading(false);
			// Still verify with server in background
			checkAuth();
		} else if (storedToken) {
			// Has token but no stored user, check authentication
			checkAuth();
		} else {
			// No token means no authentication, don't call checkAuth
			setUser(null);
			setIsLoading(false);
		}
	}, [getStoredUser, getStoredToken, checkAuth]);

	return {
		user,
		isAuthenticated: !!user,
		isLoading,
		login,
		logout,
		checkAuth,
	};
};
