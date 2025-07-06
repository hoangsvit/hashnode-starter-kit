import { useState } from 'react';
import { useMutation } from 'urql';
import { AddReplyDocument } from '../generated/graphql';

export const useAddReply = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [, addReplyMutation] = useMutation(AddReplyDocument);

	const getAuthToken = () => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('hashnode_token');
		}
		return null;
	};

	const addReply = async (commentId: string, content: string) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const token = getAuthToken();

			if (!token) {
				throw new Error('Authentication token not found. Please login first.');
			}

			const result = await addReplyMutation(
				{
					input: {
						commentId,
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
				throw new Error(result.error.message);
			}

			setIsSubmitting(false);
			return result.data?.addReply.reply;
		} catch (err) {
			setIsSubmitting(false);
			const errorMessage =
				err instanceof Error ? err.message : 'An error occurred while adding reply';
			setError(errorMessage);
			throw err;
		}
	};

	return {
		addReply,
		isSubmitting,
		error,
		setError,
	};
};
