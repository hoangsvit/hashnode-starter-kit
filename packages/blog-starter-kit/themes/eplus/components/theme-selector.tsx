import { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { Button } from './custom-button';

interface ThemeSelectorProps {
	className?: string;
	showDropdown?: boolean;
}

export const ThemeSelector = ({ className = '', showDropdown = false }: ThemeSelectorProps) => {
	const { isDarkMode, setTheme } = useDarkMode();
	const [isOpen, setIsOpen] = useState(false);

	const themes = [
		{ key: 'light', name: 'Light', icon: '☀️' },
		{ key: 'dark', name: 'Dark', icon: '🌙' },
		{ key: 'system', name: 'System', icon: '💻' },
	];

	const currentTheme = localStorage.getItem('theme') || 'system';

	const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
		setTheme(theme);
		setIsOpen(false);
	};

	if (!showDropdown) {
		return null;
	}

	return (
		<div className={`relative ${className}`}>
			<Button
				type="outline"
				className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Select theme"
				label=""
				icon={
					<div className="flex items-center gap-2">
						<span>{themes.find(t => t.key === currentTheme)?.icon}</span>
						<span className="hidden sm:inline">
							{themes.find(t => t.key === currentTheme)?.name}
						</span>
						<svg
							className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>
				}
			/>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-800 dark:ring-white dark:ring-opacity-10 z-50">
					{themes.map((theme) => (
						<button
							key={theme.key}
							onClick={() => handleThemeChange(theme.key as 'light' | 'dark' | 'system')}
							className={`flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${
								currentTheme === theme.key
									? 'bg-gray-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
									: 'text-gray-700 dark:text-gray-300'
							}`}
						>
							<span className="text-lg">{theme.icon}</span>
							<span>{theme.name}</span>
							{currentTheme === theme.key && (
								<svg
									className="ml-auto h-4 w-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							)}
						</button>
					))}
				</div>
			)}

			{/* Backdrop to close dropdown */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</div>
	);
};
