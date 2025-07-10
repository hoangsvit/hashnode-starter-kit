import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { twJoin } from 'tailwind-merge';
import { MoreVerticalSVG, EditSVG, DeleteSVG, PinSVG } from './icons/svgs';
import { useAuthContext } from '../contexts/AuthContext';
import { usePostActions } from '../hooks/usePostActions';
import { useAppContext } from './contexts/appContext';
import { PostFullFragment } from '../generated/graphql';

interface PostMoreActionsProps {
	post: PostFullFragment;
	isCompact?: boolean; // For floating bar usage
}

export const PostMoreActions = ({ post, isCompact = false }: PostMoreActionsProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const t = useTranslations();
	const { user, isAuthenticated } = useAuthContext();
	const { publication } = useAppContext();

	// Determine if the current post is pinned by comparing with publication.pinnedPost
	const isPinned = publication.pinnedPost?.id === post.id;

	// Post actions hook with success/error handlers
	const { pinPost, unpinPost, editPost, deletePost } = usePostActions({
		onSuccess: (action, postId) => {
			setIsLoading(false);
			console.log(`${action} successful for post ${postId}`);
			// You could show a toast notification here
		},
		onError: (error, action) => {
			setIsLoading(false);
			console.error(`${action} failed:`, error);
			// You could show an error toast notification here
			alert(`Failed to ${action} post: ${error}`);
		},
	});

	// Check if current user is the post author
	const isPostOwner = isAuthenticated && user && user.id === post.author.id;

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Close dropdown on escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			return () => {
				document.removeEventListener('keydown', handleEscape);
			};
		}
	}, [isOpen]);

	// Don't render if user is not authenticated or not the post owner
	if (!isPostOwner) {
		return null;
	}

	const handlePin = async () => {
		setIsOpen(false);
		setIsLoading(true);
		
		// Use the post ID directly with UpdatePost mutation
		const result = await pinPost(post.id);
		
		// State update is handled in the onSuccess callback
		if (result && !result.success) {
			// If pin failed, reset loading state (error handling is in onError callback)
			setIsLoading(false);
		}
	};

	const handleUnpin = async () => {
		setIsOpen(false);
		setIsLoading(true);
		
		// Use the post ID directly with UpdatePost mutation  
		const result = await unpinPost(post.id);
		
		// State update is handled in the onSuccess callback
		if (result && !result.success) {
			// If unpin failed, reset loading state (error handling is in onError callback)
			setIsLoading(false);
		}
	};

	const handleEdit = () => {
		setIsOpen(false);
		editPost(post.id, post.slug);
	};

	const handleDelete = async () => {
		setIsOpen(false);
		setIsLoading(true);
		await deletePost(post.id);
	};

	return (
		<div className="relative">
			<button
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				disabled={isLoading}
				className={twJoin(
					isCompact 
						? 'flex h-8 w-8 items-center justify-center rounded-full p-2 transition-colors duration-200'
						: 'flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200',
					'hover:bg-slate-100 dark:hover:bg-slate-800',
					'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
					'disabled:opacity-50 disabled:cursor-not-allowed',
					isOpen && 'bg-slate-100 dark:bg-slate-800'
				)}
				aria-label={t('common.moreActions') || 'More actions'}
				aria-expanded={isOpen}
				aria-haspopup="true"
			>
				<MoreVerticalSVG 
					className={twJoin(
						isCompact 
							? 'h-4 w-4 text-slate-600 dark:text-slate-400'
							: 'h-5 w-5 text-slate-600 dark:text-slate-400'
					)}
					aria-hidden="true"
				/>
			</button>

			{isOpen && (
				<div
					ref={dropdownRef}
					className={twJoin(
						'absolute z-50 w-48 rounded-lg border bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800',
						'animate-in fade-in-0 zoom-in-95 duration-200',
						isCompact 
							? 'right-0 bottom-12 slide-in-from-bottom-2' // For floating bar - show above
							: 'right-0 top-12 slide-in-from-top-2' // For normal usage - show below
					)}
					role="menu"
					aria-orientation="vertical"
				>
                    <div className="py-1">
                        
                        <button
							onClick={handleEdit}
							disabled={isLoading}
							className={twJoin(
								'flex w-full items-center px-4 py-2 text-left text-sm transition-colors duration-150',
								'hover:bg-slate-50 dark:hover:bg-slate-700',
								'text-slate-700 dark:text-slate-300',
								'disabled:opacity-50 disabled:cursor-not-allowed'
							)}
							role="menuitem"
						>
							<EditSVG 
								className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" 
								aria-hidden="true"
							/>
							{t('post.actions.edit') || 'Edit post'}
                        </button>
                        
						{/* Show either Pin or Unpin based on current status */}
						{isPinned ? (
								<button
									onClick={handleUnpin}
									disabled={isLoading}
									className={twJoin(
										'flex w-full items-center px-4 py-2 text-left text-sm transition-colors duration-150',
										'hover:bg-slate-50 dark:hover:bg-slate-700',
										'text-slate-700 dark:text-slate-300',
										'disabled:opacity-50 disabled:cursor-not-allowed'
									)}
									role="menuitem"
								>
									<PinSVG 
										className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" 
										aria-hidden="true"
									/>
									{t('post.actions.unpin') || 'Unpin post'}
								</button>
							) : (
								<button
									onClick={handlePin}
									disabled={isLoading}
									className={twJoin(
										'flex w-full items-center px-4 py-2 text-left text-sm transition-colors duration-150',
										'hover:bg-slate-50 dark:hover:bg-slate-700',
										'text-slate-700 dark:text-slate-300',
										'disabled:opacity-50 disabled:cursor-not-allowed'
									)}
									role="menuitem"
								>
									<PinSVG 
										className="mr-3 h-4 w-4 text-blue-500 dark:text-blue-400" 
										aria-hidden="true"
									/>
									{t('post.actions.pin') || 'Pin post'}
								</button>
							)}

						<div className="my-1 border-t border-slate-200 dark:border-slate-600" />

						<button
							onClick={handleDelete}
							disabled={isLoading}
							className={twJoin(
								'flex w-full items-center px-4 py-2 text-left text-sm transition-colors duration-150',
								'hover:bg-red-50 dark:hover:bg-red-900/20',
								'text-red-600 dark:text-red-400',
								'disabled:opacity-50 disabled:cursor-not-allowed'
							)}
							role="menuitem"
						>
							<DeleteSVG 
								className="mr-3 h-4 w-4 text-red-500 dark:text-red-400" 
								aria-hidden="true"
							/>
							{t('post.actions.delete') || 'Delete post'}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
