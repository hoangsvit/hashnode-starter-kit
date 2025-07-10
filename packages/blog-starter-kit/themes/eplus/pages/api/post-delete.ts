import { NextApiRequest, NextApiResponse } from 'next';

const HASHNODE_GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;

const DELETE_POST_MUTATION = `
  mutation RemovePost($input: RemovePostInput!) {
    removePost(input: $input) {
      post {
        id
        title
      }
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'DELETE') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { postId } = req.body;

		if (!postId) {
			return res.status(400).json({ error: 'Missing required field: postId' });
		}

		// Get the authorization token from cookies
		const token = req.cookies.hashnode_token;
		if (!token) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const variables = {
			input: {
				id: postId,
			},
		};

		const response = await fetch(HASHNODE_GQL_ENDPOINT!, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: token,
			},
			body: JSON.stringify({
				query: DELETE_POST_MUTATION,
				variables,
			}),
		});

		const data = await response.json();

		if (data.errors) {
			console.error('GraphQL errors:', data.errors);
			return res.status(400).json({
				error: 'Failed to delete post',
				details: data.errors,
			});
		}

		const result = data.data.removePost;
		if (result?.post) {
			return res.status(200).json({
				success: true,
				message: 'Post deleted successfully',
				post: result.post,
			});
		} else {
			return res.status(400).json({ error: 'Failed to delete post' });
		}
	} catch (error) {
		console.error('Delete post error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
