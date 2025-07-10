import { NextApiRequest, NextApiResponse } from 'next';

const HASHNODE_GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;

const UPDATE_POST_MUTATION = `
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      post {
        id
        title
      }
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { postId, action } = req.body;

		if (!postId || !action) {
			return res.status(400).json({ error: 'Missing required fields: postId, action' });
		}

		if (!['pin', 'unpin'].includes(action)) {
			return res.status(400).json({ error: 'Invalid action. Must be "pin" or "unpin"' });
		}

		// Get the authorization token from cookies
		const token = req.cookies.hashnode_token;
		if (!token) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		// Use UpdatePost mutation with pinToBlog setting
		const variables = {
			input: {
				id: postId,
				settings: {
					pinToBlog: action === 'pin',
				},
			},
		};

		const response = await fetch(HASHNODE_GQL_ENDPOINT!, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: token,
			},
			body: JSON.stringify({
				query: UPDATE_POST_MUTATION,
				variables,
			}),
		});

		const data = await response.json();

		if (data.errors) {
			console.error('GraphQL errors:', data.errors);
			return res.status(400).json({
				error: 'Failed to ' + action + ' post',
				details: data.errors,
			});
		}

		const result = data.data.updatePost;

		if (result?.post) {
			return res.status(200).json({
				success: true,
				message: `Post ${action}ned successfully`,
				post: result.post,
			});
		} else {
			return res.status(400).json({ error: 'Failed to ' + action + ' post' });
		}
	} catch (error) {
		console.error('Pin/Unpin post error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
