import Image from 'next/image';
import { useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { useTranslation } from 'next-i18next';

interface UserAvatarProps {
	user?: {
		id: string;
		name: string;
		username?: string;
		profilePicture?: string | null;
		email?: string;
	} | null;
	publicationId?: string;
	size?: 'sm' | 'md' | 'lg';
	showDropdown?: boolean;
	onLogout?: () => void;
	onLogin?: () => void;
}

export const UserAvatar = ({ user, publicationId, size = 'md', showDropdown = false, onLogout, onLogin }: UserAvatarProps) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const { t } = useTranslation('common');

	const sizeClasses = {
		sm: 'w-8 h-8',
		md: 'w-10 h-10',
		lg: 'w-12 h-12',
	};

	const textSizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base',
	};

	const getInitials = (name: string): string => {
		return name
			.split(' ')
			.map(word => word.charAt(0))
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const toggleDropdown = () => {
		if (showDropdown) {
			if (user) {
				setIsDropdownOpen(!isDropdownOpen);
			} else {
				// If not logged in, trigger login
				onLogin?.();
			}
		}
	};

	const isLoggedIn = !!user;

	return (
		<div className="relative">
			<div
				className={twJoin(
					'flex items-center justify-center rounded-full border-2 overflow-hidden',
					sizeClasses[size],
					showDropdown && 'cursor-pointer transition-colors',
					isLoggedIn
						? 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
						: 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
				)}
				onClick={toggleDropdown}
				title={isLoggedIn ? `${user.name} ${user.username ? `(@${user.username})` : ''}` : t('userMenu.clickToLogin')}
			>
				{isLoggedIn && user.profilePicture ? (
					<Image
						src={user.profilePicture}
						alt={`${user.name} avatar`}
						width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
						height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
						className="rounded-full object-cover"
					/>
				) : (
					<div
						className={twJoin(
							'flex items-center justify-center w-full h-full font-semibold',
							textSizeClasses[size],
							isLoggedIn
								? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
								: 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
						)}
					>
						{isLoggedIn ? getInitials(user.name) : (
							<svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
							</svg>
						)}
					</div>
				)}
			</div>

			{/* Dropdown Menu - Only for logged in users */}
			{showDropdown && isDropdownOpen && isLoggedIn && (
				<div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-50">
					<div className="py-2">
						<div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
							<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
								{user.name}
							</p>
							{user.username && (
								<p className="text-xs text-gray-500 dark:text-gray-400">
									@{user.username}
								</p>
							)}
						</div>

						<a
							href={`https://hashnode.com/create/story${publicationId ? `?publicationId=${publicationId}` : ''}`}
							target="_blank"
							rel="noopener noreferrer"
							onClick={() => setIsDropdownOpen(false)}
							className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
						>
							<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
							{t('userMenu.writeNewPost')}
						</a>

						{publicationId && (
							<a
								href={`https://hashnode.com/${publicationId}/dashboard`}
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => setIsDropdownOpen(false)}
								className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
							>
								<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
								{t('userMenu.dashboard')}
							</a>
						)}

						<button
							onClick={() => {
								setIsDropdownOpen(false);
								onLogout?.();
							}}
							className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
						>
							<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							{t('userMenu.logout')}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
