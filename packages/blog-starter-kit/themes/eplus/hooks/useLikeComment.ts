import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';

interface LikeCommentInput {
	commentId: string;
	likesCount: number; // The new total count (current + 1)
	currentLikeCount?: number; // Pass current count for mock response
}

interface LikeCommentResponse {
	comment: {
		id: string;
		totalReactions: number;
		myTotalReactions: number;
	};
}

export const useLikeComment = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuth();

	// Set like limit per user
	const LIKE_LIMIT = 10; // Maximum likes per user per comment

	const likeComment = useCallback(
		async (input: LikeCommentInput): Promise<LikeCommentResponse | null> => {
			if (!user) {
				setError('User must be authenticated to like comments');
				return null;
			}

			setIsLoading(true);
			setError(null);

			try {
				// GraphQL mutation
				const mutation = `
        mutation LikeComment($input: LikeCommentInput!) {
          likeComment(input: $input) {
            comment {
              id
              totalReactions
              myTotalReactions
            }
          }
        }
      `;

				const variables = {
					input: {
						commentId: input.commentId,
						// likesCount: input.likesCount, // Temporarily disabled
					},
				};

				// Get the stored token for authentication
				const token = typeof window !== 'undefined' ? localStorage.getItem('hashnode_token') : null;

				// Make the GraphQL request to the configured endpoint
				const response = await fetch(process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT || '', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'hn-trace-app': 'blogs',
						// Add authentication headers if needed
						...(token && { Authorization: `Bearer ${token}` }),
					},
					body: JSON.stringify({
						query: mutation,
						variables,
					}),
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const result = await response.json();

				if (result.errors) {
					throw new Error(result.errors[0]?.message || 'GraphQL error');
				}

				return result.data?.likeComment || null;
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Failed to like comment';
				setError(errorMessage);
				console.error('Like comment error:', err);

				// For now, return a mock response to keep the UI working
				// Once the likeComment mutation is available in the GraphQL schema, remove this fallback
				return {
					comment: {
						id: input.commentId,
						totalReactions: (input.currentLikeCount || 0) + input.likesCount, // Increment by likesCount
						myTotalReactions: 0, // Keep button enabled for more likes
					},
				};
			} finally {
				setIsLoading(false);
			}
		},
		[user],
	);

	const toggleLike = useCallback(
		async (
			commentId: string,
			currentlyLiked: boolean,
			currentLikeCount: number,
			userLikeCount: number = 0,
		) => {
			// Check if user has reached the like limit
			const LIKE_LIMIT = 10; // Maximum likes per user per comment
			if (userLikeCount >= LIKE_LIMIT) {
				return {
					success: false,
					newLikeCount: currentLikeCount,
					isLiked: true, // Lock the button
					reachedLimit: true,
				};
			}

			// Allow liking multiple times, just show loading state
			// Send the new total count (current + 1)
			const result = await likeComment({
				commentId,
				likesCount: currentLikeCount + 1, // Total count + 1
				currentLikeCount, // Pass current count for mock response
			});

			if (result) {
				const newUserLikeCount = userLikeCount + 1;
				return {
					success: true,
					newLikeCount: result.comment.totalReactions, // Use actual count from response
					isLiked: newUserLikeCount >= LIKE_LIMIT, // Lock if reached limit
					reachedLimit: newUserLikeCount >= LIKE_LIMIT,
				};
			}

			return {
				success: false,
				newLikeCount: currentLikeCount, // Keep the original count
				isLiked: currentlyLiked, // Keep the original state
			};
		},
		[likeComment],
	);

	return {
		likeComment,
		toggleLike,
		isLoading,
		error,
		setError,
	};
};
