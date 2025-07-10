import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

interface UsePostActionsProps {
	onSuccess?: (action: string, postId: string) => void;
	onError?: (error: string, action: string) => void;
}

export const usePostActions = ({ onSuccess, onError }: UsePostActionsProps = {}) => {
	const router = useRouter();
	const { isAuthenticated } = useAuthContext();

	const pinPost = useCallback(
		async (postId: string, publicationId: string) => {
			if (!isAuthenticated) {
				onError?.('Authentication required', 'pin');
				return;
			}

			try {
				const response = await fetch('/api/post-pin', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						postId,
						publicationId,
						action: 'pin',
					}),
				});

				const data = await response.json();

				if (response.ok && data.success) {
					onSuccess?.('pin', postId);
					return { success: true, message: data.message };
				} else {
					throw new Error(data.error || 'Failed to pin post');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to pin post';
				onError?.(errorMessage, 'pin');
				return { success: false, error: errorMessage };
			}
		},
		[isAuthenticated, onSuccess, onError],
	);

	const unpinPost = useCallback(
		async (postId: string, publicationId: string) => {
			if (!isAuthenticated) {
				onError?.('Authentication required', 'unpin');
				return;
			}

			try {
				const response = await fetch('/api/post-pin', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						postId,
						publicationId,
						action: 'unpin',
					}),
				});

				const data = await response.json();

				if (response.ok && data.success) {
					onSuccess?.('unpin', postId);
					return { success: true, message: data.message };
				} else {
					throw new Error(data.error || 'Failed to unpin post');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to unpin post';
				onError?.(errorMessage, 'unpin');
				return { success: false, error: errorMessage };
			}
		},
		[isAuthenticated, onSuccess, onError],
	);

	const editPost = useCallback(
		(postId: string, slug: string) => {
			// Redirect to Hashnode's edit page
			const editUrl = `https://hashnode.com/draft/${postId}`;
			window.open(editUrl, '_blank', 'noopener,noreferrer');
			onSuccess?.('edit', postId);
		},
		[onSuccess],
	);

	const deletePost = useCallback(
		async (postId: string) => {
			if (!isAuthenticated) {
				onError?.('Authentication required', 'delete');
				return;
			}

			// Show confirmation dialog
			const confirmed = window.confirm(
				'Are you sure you want to delete this post? This action cannot be undone.',
			);

			if (!confirmed) {
				return { success: false, cancelled: true };
			}

			try {
				const response = await fetch('/api/post-delete', {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						postId,
					}),
				});

				const data = await response.json();

				if (response.ok && data.success) {
					onSuccess?.('delete', postId);
					// Redirect to home page after successful deletion
					router.push('/');
					return { success: true, message: data.message };
				} else {
					throw new Error(data.error || 'Failed to delete post');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
				onError?.(errorMessage, 'delete');
				return { success: false, error: errorMessage };
			}
		},
		[isAuthenticated, onSuccess, onError, router],
	);

	return {
		pinPost,
		unpinPost,
		editPost,
		deletePost,
	};
};
