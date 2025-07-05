import { useEffect, useState } from 'react';

export const useDarkMode = () => {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

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
			setIsLoading(false);
		};

		// Initialize theme immediately
		initializeTheme();

		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleSystemThemeChange = (e: MediaQueryListEvent) => {
			// Only apply system theme if no saved preference
			if (!localStorage.getItem('theme')) {
				const htmlElement = document.documentElement;
				if (e.matches) {
					htmlElement.classList.add('dark');
					setIsDarkMode(true);
				} else {
					htmlElement.classList.remove('dark');
					setIsDarkMode(false);
				}
			}
		};

		mediaQuery.addEventListener('change', handleSystemThemeChange);

		return () => {
			mediaQuery.removeEventListener('change', handleSystemThemeChange);
		};
	}, []);

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

	const setTheme = (theme: 'light' | 'dark' | 'system') => {
		const html = document.documentElement;

		if (theme === 'system') {
			localStorage.removeItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			if (prefersDark) {
				html.classList.add('dark');
				setIsDarkMode(true);
			} else {
				html.classList.remove('dark');
				setIsDarkMode(false);
			}
		} else {
			localStorage.setItem('theme', theme);
			if (theme === 'dark') {
				html.classList.add('dark');
				setIsDarkMode(true);
			} else {
				html.classList.remove('dark');
				setIsDarkMode(false);
			}
		}
	};

	return {
		isDarkMode,
		isLoading,
		toggleDarkMode,
		setTheme,
	};
};
