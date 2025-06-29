import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import request from 'graphql-request';
import { Container } from '../components/container';
import { Layout } from '../components/layout';
import HnButton from '../components/hn-button';
import { AppProvider } from '../components/contexts/appContext';
import {
	PublicationFragment,
	PublicationByHostDocument,
	PublicationByHostQuery,
	PublicationByHostQueryVariables,
} from '../generated/graphql';
import { resizeImage } from '@starter-kit/utils/image';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;

// Utility functions for localStorage
const getStoredUser = () => {
	if (typeof window !== 'undefined') {
		try {
			const storedUser = localStorage.getItem('hashnode_user');
			return storedUser ? JSON.parse(storedUser) : null;
		} catch (error) {
			return null;
		}
	}
	return null;
};

const getStoredToken = () => {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('hashnode_token');
	}
	return null;
};

const clearStoredAuth = () => {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('hashnode_user');
		localStorage.removeItem('hashnode_token');
	}
};

interface IdentityPageProps {
	publication: PublicationFragment;
}

export default function IdentityPage({ publication }: Readonly<IdentityPageProps>) {
	const router = useRouter();
	const [isProcessing, setIsProcessing] = useState(false);
	const [identityStatus, setIdentityStatus] = useState<'idle' | 'success' | 'error'>('idle');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [userInfo, setUserInfo] = useState<any>(null);
	const [tokenInput, setTokenInput] = useState<string>('');
	const [isLoading, setIsLoading] = useState(true);
	const { next } = router.query;

	// Check localStorage when component mounts
	useEffect(() => {
		const checkStoredAuth = () => {
			const storedUser = getStoredUser();
			const storedToken = getStoredToken();

			if (storedUser && storedToken) {
				// User already authenticated
				setUserInfo(storedUser);
				setIdentityStatus('success');
			}
			setIsLoading(false);
		};

		checkStoredAuth();
	}, []);

	const handleLogout = useCallback(() => {
		clearStoredAuth();
		setUserInfo(null);
		setIdentityStatus('idle');
		setTokenInput('');
		setErrorMessage('');
	}, []);

	const handleTokenSubmit = useCallback(async () => {
		if (!tokenInput.trim()) {
			setErrorMessage('Please enter your Hashnode Personal Access Token');
			return;
		}

		// Validate Personal Access Token format
		const token = tokenInput.trim();

		// Basic token validation - Personal Access Token should be at least 30 characters
		if (token.length < 30) {
			setErrorMessage('Token is too short. Personal Access Token from Hashnode is usually at least 30 characters long.');
			return;
		}

		// Check if token contains only valid characters (letters, numbers, hyphens, and underscores)
		// UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
		const tokenPattern = /^[A-Za-z0-9\-_]+$/;
		if (!tokenPattern.test(token)) {
			setErrorMessage('Invalid token format. Personal Access Token should only contain letters, numbers, hyphens and underscores.');
			return;
		}

		// Check if it looks like a UUID format (optional but helpful)
		const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidPattern.test(token)) {
			// Token doesn't have standard UUID format, but will still try to authenticate
		}

		setIsProcessing(true);
		setIdentityStatus('idle');
		setErrorMessage('');

		try {
			const apiUrl = `/api/identity`;

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Important for sending cookies
				body: JSON.stringify({
					token: token,
				}),
			});

			if (response.ok) {
				const result = await response.json();

				// Save user info and token to localStorage
				if (result.user) {
					localStorage.setItem('hashnode_user', JSON.stringify(result.user));
				}
				if (result.token) {
					localStorage.setItem('hashnode_token', result.token);
				}

				// Save user info to state for display
				setUserInfo(result.user);
				setIdentityStatus('success');

				// Redirect after 5 seconds so user can see the info
				setTimeout(() => {
					const redirectUrl = (next as string) || '/';
					router.push(redirectUrl);
				}, 5000);
			} else {
				const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));

				setIdentityStatus('error');
				setErrorMessage(errorData.message ?? `API Error: ${response.status} ${response.statusText}`);
			}
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			setIdentityStatus('error');
			setErrorMessage(`An error occurred during token verification: ${errorMessage}`);
		} finally {
			setIsProcessing(false);
		}
	}, [tokenInput, next, router]);

	const handleRetry = () => {
		handleTokenSubmit();
	};

	return (
		<AppProvider publication={publication}>
			<Layout>
				<Container className="px-4 py-8">
					<div className="max-w-md mx-auto">
						<div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 border border-neutral-200 dark:border-neutral-800">
							{/* Loading state */}
							{isLoading && (
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-neutral-600 dark:text-neutral-400">
						Checking authentication...
					</p>
				</div>
							)}

							{/* Main content when not loading */}
							{!isLoading && (
								<div className="text-center">
								{/* Logo */}
								<div className="mb-6">
									{publication.preferences.logo ? (
										<Image
											src={resizeImage(publication.preferences.logo, { w: 80, h: 80 })}
											alt={publication.title}
											width={80}
											height={80}
											className="mx-auto rounded-full"
										/>
									) : (
										<div className="w-20 h-20 mx-auto bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
											<span className="text-2xl font-bold text-neutral-600 dark:text-neutral-300">
												{publication.title.charAt(0)}
											</span>
										</div>
									)}
								</div>

							{/* Title */}
							<h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
								Identity Verification
							</h1>
							<p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">
								Enter your Hashnode Personal Access Token to verify your identity
							</p>

							{/* Instructions - only show when not authenticated */}
							{identityStatus === 'idle' && (
								<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
									<h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
										💡 How to get your Hashnode Personal Access Token?
									</h3>
									<div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
										<p>1. Log in to your Hashnode account</p>
										<p>2. Go to Settings → Developer → Personal Access Tokens</p>
										<p>3. Click &quot;Generate New Token&quot;</p>
										<p>4. Name your token and select required permissions</p>
										<p>5. Copy the generated token and paste it here</p>
										<p className="text-yellow-700 dark:text-yellow-300 font-medium">⚠️ Note: Token is only shown once!</p>
									</div>
								</div>
							)}

							{/* Token input form */}
							{identityStatus === 'idle' && (
								<div className="mb-6">
									<div className="space-y-4">
										<div>
											<label htmlFor="token" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
												Hashnode Personal Access Token
											</label>
											<input
												id="token"
												type="password"
												value={tokenInput}
												onChange={(e) => setTokenInput(e.target.value)}
												placeholder="Enter your Personal Access Token..."
												className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
												disabled={isProcessing}
											/>
										</div>

										{errorMessage && (
											<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
												<div className="text-red-600 dark:text-red-400 text-sm">
													⚠️ {errorMessage}
												</div>
											</div>
										)}

										<HnButton
											onClick={handleTokenSubmit}
											disabled={isProcessing || !tokenInput.trim()}
											className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-400 text-white px-6 py-2 rounded-lg transition-colors"
										>
											{isProcessing ? 'Verifying...' : 'Verify Identity'}
										</HnButton>
									</div>
								</div>
							)}

							{isProcessing && (
								<div className="mb-6">
									<div className="flex flex-col items-center space-y-4">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
										<p className="text-neutral-600 dark:text-neutral-400">
											Verifying token with Hashnode...
										</p>
									</div>
								</div>
							)}

							{identityStatus === 'success' && (
								<div className="mb-6">
									<div className="text-green-600 text-4xl mb-4">✅</div>
									<h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4">
										Identity Verified Successfully!
									</h2>

									{/* User information display */}
									{userInfo && (
										<div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 mb-4 text-left">
											<div className="flex items-center justify-between mb-4">
												<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
													Account Information
												</h3>
												<HnButton
													onClick={handleLogout}
													variant="transparent"
													className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
												>
													🚪 Logout
												</HnButton>
											</div>

											<div className="space-y-4">
												{/* Avatar and basic info */}
												<div className="flex items-center space-x-4 p-4 bg-white dark:bg-neutral-700 rounded-lg">
													{userInfo.profilePicture ? (
														<Image
															src={userInfo.profilePicture}
															alt={userInfo.name}
															width={60}
															height={60}
															className="rounded-full"
														/>
													) : (
														<div className="w-15 h-15 bg-neutral-200 dark:bg-neutral-600 rounded-full flex items-center justify-center">
															<span className="text-xl font-bold text-neutral-600 dark:text-neutral-300">
																{userInfo.name?.charAt(0) ?? userInfo.username?.charAt(0) ?? '?'}
															</span>
														</div>
													)}
													<div className="flex-1">
														<div className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
															{userInfo.name}
														</div>
														{userInfo.username && (
															<div className="text-sm text-neutral-600 dark:text-neutral-400">
																@{userInfo.username}
															</div>
														)}
														<div className="text-sm text-neutral-600 dark:text-neutral-400">
															{userInfo.email}
														</div>
													</div>
												</div>

												{/* Additional info */}
												<div className="grid grid-cols-1 gap-3">
													{/* Bio */}
													{userInfo.bio && (
														<div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
															<span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Bio:</span>
															<p className="text-neutral-900 dark:text-neutral-100 mt-1">
																{userInfo.bio}
															</p>
														</div>
													)}

													{/* Tagline */}
													{userInfo.tagline && (
														<div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
															<span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Tagline:</span>
															<p className="text-neutral-900 dark:text-neutral-100 mt-1">
																{userInfo.tagline}
															</p>
														</div>
													)}

													{/* Location */}
													{userInfo.location && (
														<div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
															<span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Location:</span>
															<span className="text-neutral-900 dark:text-neutral-100 ml-2">
																{userInfo.location}
															</span>
														</div>
													)}

													{/* Social stats */}
													{(userInfo.followersCount !== undefined || userInfo.followingsCount !== undefined) && (
														<div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
															<span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Social:</span>
															<div className="text-neutral-900 dark:text-neutral-100 mt-1">
																{userInfo.followersCount !== undefined && (
																	<span className="mr-4">
																		{userInfo.followersCount} followers
																	</span>
																)}
																{userInfo.followingsCount !== undefined && (
																	<span>
																		{userInfo.followingsCount} following
																	</span>
																)}
															</div>
														</div>
													)}
												</div>
											</div>
										</div>
									)}

									<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
										<p className="text-green-700 dark:text-green-300 text-sm text-center">
											You will be redirected in 5 seconds...
										</p>
									</div>
								</div>
							)}

							{identityStatus === 'error' && (
								<div className="mb-6">
									<div className="text-red-600 text-4xl mb-4">❌</div>
									<h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
										Identity Verification Failed
									</h2>
									<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
										<p className="text-red-700 dark:text-red-300 text-sm">
											{errorMessage}
										</p>
									</div>
									<HnButton
										onClick={handleRetry}
										disabled={isProcessing}
										className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
									>
										Try Again
									</HnButton>
								</div>
							)}

							{/* Back to home link */}
							<div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
								<HnButton
									onClick={() => router.push('/')}
									variant="transparent"
									className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
								>
									← Back to Home
								</HnButton>
							</div>
						</div>
					)}
				</div>
			</div>
		</Container>
	</Layout>
</AppProvider>
);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	// No need to check guid anymore as user will enter token directly

	try {
		const data = await request<PublicationByHostQuery, PublicationByHostQueryVariables>(
			GQL_ENDPOINT,
			PublicationByHostDocument,
			{
				host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
			},
		);

		const publication = data.publication;
		if (!publication) {
			return {
				notFound: true,
			};
		}

		return {
			props: {
				publication,
			},
		};
	} catch (error) {
		console.error('Error fetching publication:', error);
		return {
			notFound: true,
		};
	}
};
