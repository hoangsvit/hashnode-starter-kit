import { twJoin } from 'tailwind-merge';
import { lightOrDark } from '../utils/commonUtils';
import { useAppContext } from './contexts/appContext';
import { Button } from './custom-button';
import HeaderBlogSearch from './header-blog-search';
import HeaderLeftSidebar from './header-left-sidebar';
import PublicationLogo from './publication-logo';
import PublicationNavLinks from './publication-nav-links';
import PublicationSocialLinks from './publication-social-links';
import { UserAvatar } from './user-avatar';
import { LanguageSwitcher } from './language-switcher';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

type Props = {
	currentMenuId?: string | null;
	isHome: boolean;
};

export const Header = (props: Props) => {
	const { currentMenuId, isHome } = props;
	const { publication } = useAppContext();
	const { user, isAuthenticated, logout } = useAuth();
	const router = useRouter();
	const [isDarkMode, setIsDarkMode] = useState(false);
	// Check initial theme state
	useEffect(() => {
		const initializeTheme = () => {
			// Check saved theme from localStorage first
			const savedTheme = localStorage.getItem('theme');
			const htmlElement = document.documentElement;
			
			if (savedTheme === 'dark') {
				htmlElement.classList.add('dark');
				setIsDarkMode(true);
			} else if (savedTheme === 'light') {
				htmlElement.classList.remove('dark');
				setIsDarkMode(false);
			} else {
				// If no saved theme, check system preference
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				if (prefersDark) {
					htmlElement.classList.add('dark');
					setIsDarkMode(true);
					localStorage.setItem('theme', 'dark');
				} else {
					htmlElement.classList.remove('dark');
					setIsDarkMode(false);
					localStorage.setItem('theme', 'light');
				}
			}
		};
		
		// Initialize theme immediately
		initializeTheme();
	}, []);

	const handleLogin = () => {
		router.push('/identity');
	};

	const toggleDarkMode = () => {
		const html = document.documentElement;
		const isDark = html.classList.contains('dark');

		if (isDark) {
			html.classList.remove('dark');
			localStorage.setItem('theme', 'light');
			setIsDarkMode(false);
		} else {
			html.classList.add('dark');
			localStorage.setItem('theme', 'dark');
			setIsDarkMode(true);
		}
	};

	return (
		<header
			className="blog-header relative z-50 w-full border-b border-black/10 bg-white bg-opacity-70 dark:border-white/10 dark:bg-slate-900 dark:bg-opacity-70"
		>
			<div className="container mx-auto px-2 md:px-4 2xl:px-10">
				<div className="relative z-40 flex flex-row items-center justify-between pb-2 pt-8 md:mb-4">
					<div className="flex flex-row items-center py-1">
						{/* Navigation for mobile view */}
						<div
							className={twJoin(
								'md:hidden','dark:text-white',
							)}
						>
							<HeaderLeftSidebar publication={publication} />
						</div>
						<div className="hidden md:block">
							<PublicationLogo publication={publication} size="lg" withProfileImage />
						</div>
					</div>

					<div
						className={twJoin(
							'flex flex-row items-center','dark:text-white',
						)}
					>
						<HeaderBlogSearch publication={publication} />

						{/* User Avatar - always show */}
						<div className="ml-3">
							<UserAvatar
								user={user}
								publicationId={publication.id}
								size="md"
								showDropdown={true}
								onLogout={logout}
								onLogin={handleLogin}
							/>
						</div>

						{/* Dark mode toggle button */}
						<Button
							type='outline'
							className="ml-2 rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-slate-700"
							onClick={toggleDarkMode}
							aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
							data-tom="dark-mode-toggle"
							label=""
							icon={
								isDarkMode ? (
									// Moon icon for dark mode (show when in dark mode)
									<svg
										className="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
										/>
									</svg>
								) : (
									// Sun icon for light mode (show when in light mode)
									<svg
										className="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"
										/>
									</svg>
								)
							}
						/>

						{/* Language Switcher */}
						<div className="ml-2">
							<LanguageSwitcher />
						</div>
					</div>
				</div>

				{/* Logo for mobile view */}
				<div className="mx-auto my-5 flex w-2/3 flex-row items-center justify-center md:hidden">
					<PublicationLogo publication={publication} size="xl" />
				</div>

				<div className="blog-sub-header" data-testid="blog-sub-header">
					{/* Desktop */}
					<div className="justify-betweem mx-0 mb-2 hidden w-full flex-row items-center md:flex">
						<PublicationSocialLinks
							links={publication.links}
						/>
					</div>
					{/* Mobile view */}
					<div className="mb-2 flex w-full flex-col items-center md:hidden">
						<PublicationSocialLinks
							links={publication.links}
						/>
					</div>
				</div>

				<div
					className="relative mt-8 hidden flex-row items-center justify-center overflow-hidden text-base md:flex"
					data-tom="hidden md:flex relative flex-row items-center justify-center overflow-hidden text-base mt-8"
				>
					<PublicationNavLinks
						isHome={isHome}
						currentActiveMenuItemId={currentMenuId}
						enabledPages={publication.preferences?.enabledPages}
						navbarItems={publication.preferences?.navbarItems || []}
					/>
				</div>
			</div>
		</header>
	);
};
