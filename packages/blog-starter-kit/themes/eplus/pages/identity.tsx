import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import request from 'graphql-request';
import { useTranslations } from 'next-intl';
import { Container } from '../components/container';
import { Layout } from '../components/layout';
import HnButton from '../components/hn-button';
import { AppProvider } from '../components/contexts/appContext';
import { UserAvatar } from '../components/user-avatar';
import { useAuth } from '../hooks/useAuth';
import {
	PublicationFragment,
	PublicationByHostDocument,
	PublicationByHostQuery,
	PublicationByHostQueryVariables,
} from '../generated/graphql';
import { resizeImage } from '@starter-kit/utils/image';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;

interface IdentityPageProps {
	publication: PublicationFragment;
}

export default function IdentityPage({ publication }: Readonly<IdentityPageProps>) {
	const router = useRouter();
	const t = useTranslations('identity');
	const [tokenInput, setTokenInput] = useState<string>('');
	const [isProcessing, setIsProcessing] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const { next } = router.query;
	const { user, isAuthenticated, isLoading, login, logout } = useAuth();

	// Redirect after successful login
	useEffect(() => {
		if (isAuthenticated && user && !isLoading) {
			const timer = setTimeout(() => {
				const redirectUrl = (next as string) || '/';
				router.push(redirectUrl);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, user, isLoading, next, router]);

	const handleTokenSubmit = useCallback(async () => {
		if (!tokenInput.trim()) {
			setErrorMessage(t('enterToken'));
			return;
		}

		// Validate Personal Access Token format
		const token = tokenInput.trim();

		// Basic token validation - Personal Access Token should be at least 30 characters
		if (token.length < 30) {
			setErrorMessage(t('tokenTooShort'));
			return;
		}

		// Check if token contains only valid characters (letters, numbers, hyphens, and underscores)
		const tokenPattern = /^[A-Za-z0-9\-_]+$/;
		if (!tokenPattern.test(token)) {
			setErrorMessage(t('invalidFormat'));
			return;
		}

		setIsProcessing(true);
		setErrorMessage('');

		try {
			const result = await login(token);
			if (!result.success) {
				setErrorMessage(result.error || 'Login failed');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			setErrorMessage(`${t('errorOccurred')}: ${errorMessage}`);
		} finally {
			setIsProcessing(false);
		}
	}, [tokenInput, login, t]);

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
						{t('checkingAuth')}
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
								{t('title')}
							</h1>
							<p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">
								{t('description')}
							</p>

							{/* Instructions - only show when not authenticated */}
							{!isAuthenticated && (
								<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
									<h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
										💡 {t('howToGetToken')}
									</h3>
									<div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
										<p>1. {t('step1')}</p>
										<p>
											2. {t('step2')}{' '}
											<a
												href="https://hashnode.com/settings/developer"
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 underline hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400"
											>
												{t('settingsDeveloper')}
											</a>
										</p>
										<p>3. {t('step3')}</p>
										<p>4. {t('step4')}</p>
										<p>5. {t('step5')}</p>
										<p className="text-yellow-700 dark:text-yellow-300 font-medium">⚠️ {t('tokenWarning')}</p>
									</div>
								</div>
							)}

							{/* Token input form */}
							{!isAuthenticated && (
								<div className="mb-6">
									<div className="space-y-4">
										<div>
											<label htmlFor="token" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
												{t('tokenLabel')}
											</label>
											<input
												id="token"
												type="password"
												value={tokenInput}
												onChange={(e) => setTokenInput(e.target.value)}
												placeholder={t('tokenPlaceholder')}
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
											{isProcessing ? t('verifying') : t('verifyIdentity')}
										</HnButton>
									</div>
								</div>
							)}

							{isProcessing && (
								<div className="mb-6">
									<div className="flex flex-col items-center space-y-4">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
										<p className="text-neutral-600 dark:text-neutral-400">
											{t('verifyingToken')}
										</p>
									</div>
								</div>
							)}

							{isAuthenticated && user && (
								<div className="mb-6">
									<div className="text-green-600 text-4xl mb-4">✅</div>
									<h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4">
										{t('verifiedSuccess')}
									</h2>

									{/* User information display */}
									<div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 mb-4 text-left">
										<div className="flex items-center justify-between mb-4">
											<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
												{t('accountInfo')}
											</h3>
											<HnButton
												onClick={logout}
												variant="transparent"
												className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
											>
												🚪 {t('logout')}
											</HnButton>
										</div>

										<div className="space-y-4">
											{/* Avatar and basic info */}
											<div className="flex items-center space-x-4 p-4 bg-white dark:bg-neutral-700 rounded-lg">
												<UserAvatar user={user} size="lg" />
												<div className="flex-1">
													<div className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
														{user.name}
													</div>
													{user.username && (
														<div className="text-sm text-neutral-600 dark:text-neutral-400">
															@{user.username}
														</div>
													)}
													<div className="text-sm text-neutral-600 dark:text-neutral-400">
														{user.email}
													</div>
												</div>
											</div>

											{/* Additional info */}
											<div className="grid grid-cols-1 gap-3">
												{/* Bio */}
												{user.bio && (
													<div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
														<span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{t('bio')}:</span>
														<p className="text-neutral-900 dark:text-neutral-100 mt-1">
															{user.bio}
														</p>
													</div>
												)}

												{/* Tagline */}
												{user.tagline && (
													<div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
														<span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{t('tagline')}:</span>
														<p className="text-neutral-900 dark:text-neutral-100 mt-1">
															{user.tagline}
														</p>
													</div>
												)}

												{/* Location */}
												{user.location && (
													<div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
														<span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{t('location')}:</span>
														<span className="text-neutral-900 dark:text-neutral-100 ml-2">
															{user.location}
														</span>
													</div>
												)}

												{/* Social stats */}
												{(user.followersCount !== undefined || user.followingsCount !== undefined) && (
													<div className="p-3 bg-white dark:bg-neutral-700 rounded-lg">
														<span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{t('social')}:</span>
														<div className="text-neutral-900 dark:text-neutral-100 mt-1">
															{user.followersCount !== undefined && (
																<span className="mr-4">
																	{user.followersCount} {t('followers')}
																</span>
															)}
															{user.followingsCount !== undefined && (
																<span>
																	{user.followingsCount} {t('following')}
																</span>
															)}
														</div>
													</div>
												)}
											</div>
										</div>
									</div>

									<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
										<p className="text-green-700 dark:text-green-300 text-sm text-center">
											{t('redirecting')}
										</p>
									</div>
								</div>
							)}

							{/* Error state */}
							{errorMessage && !isAuthenticated && (
								<div className="mb-6">
									<div className="text-red-600 text-4xl mb-4">❌</div>
									<h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
										{t('verificationFailed')}
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
										{t('tryAgain')}
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
									← {t('backToHome')}
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
	const { locale = 'en' } = context;

	// Load messages for the current locale
	const messages = (await import(`../messages/${locale}.json`)).default;

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
				messages,
			},
		};
	} catch (error) {
		console.error('Error fetching publication:', error);
		return {
			notFound: true,
		};
	}
};
