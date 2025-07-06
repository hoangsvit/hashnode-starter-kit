import { useState } from 'react';
import { useMutation } from 'urql';
import { AddCommentDocument } from '../generated/graphql';

export const useAddComment = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [, addCommentMutation] = useMutation(AddCommentDocument);

	const getAuthToken = () => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('hashnode_token');
		}
		return null;
	};

	const addComment = async (postId: string, content: string) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const token = getAuthToken();

			if (!token) {
				throw new Error('Authentication token not found. Please login first.');
			}

			const result = await addCommentMutation(
				{
					input: {
						postId,
						contentMarkdown: content,
					},
				},
				{
					fetchOptions: {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				},
			);

			if (result.error) {
				setError(result.error.message);
				return { success: false, error: result.error.message };
			}

			return { success: true, comment: result.data?.addComment?.comment };
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		addComment,
		isSubmitting,
		error,
	};
};
