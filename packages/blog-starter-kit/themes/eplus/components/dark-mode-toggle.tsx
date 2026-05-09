import { Button } from './custom-button';
import { useDarkMode } from '../hooks/useDarkMode';

interface DarkModeToggleProps {
	className?: string;
	showLabel?: boolean;
}

export const DarkModeToggle = ({ className = '', showLabel = false }: DarkModeToggleProps) => {
	const { isDarkMode, isLoading, toggleDarkMode } = useDarkMode();

	// Don't render until theme is initialized to prevent flash
	if (isLoading) {
		return (
			<div className={className}>
				<div className="rounded-full p-2 w-9 h-9 bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
			</div>
		);
	}

	let buttonLabel = "";
	if (showLabel) {
		buttonLabel = isDarkMode ? "Light Mode" : "Dark Mode";
	}

	return (
		<div className={`${className}`}>
			<Button
				type="outline"
				className="group relative rounded-full p-2 transition-all duration-300 ease-in-out hover:bg-gray-100 hover:shadow-md dark:hover:bg-slate-700 hover:scale-105 active:scale-95"
				onClick={toggleDarkMode}
				aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
				data-tom="dark-mode-toggle"
				label={buttonLabel}
				icon={
					<div className="relative w-5 h-5 overflow-hidden">
						{/* Sun icon */}
						<svg
							className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-in-out ${
								isDarkMode
									? 'rotate-180 scale-0 opacity-0'
									: 'rotate-0 scale-100 opacity-100'
							}`}
							fill="#f6af41"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fillRule="evenodd"
								d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
								clipRule="evenodd"
							/>
						</svg>

						{/* Moon icon */}
						<svg
							className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-in-out ${
								isDarkMode
									? 'rotate-0 scale-100 opacity-100'
									: '-rotate-180 scale-0 opacity-0'
							}`}
							fill="#f6af41"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
							/>
						</svg>
					</div>
				}
			/>
		</div>
	);
};
