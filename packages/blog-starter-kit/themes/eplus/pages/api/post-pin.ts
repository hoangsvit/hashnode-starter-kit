import { NextApiRequest, NextApiResponse } from 'next';

const HASHNODE_GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;

const PIN_POST_MUTATION = `
  mutation PinPost($input: PinPostInput!) {
    pinPost(input: $input) {
      post {
        id
        title
      }
    }
  }
`;

const UNPIN_POST_MUTATION = `
  mutation UnpinPost($input: UnpinPostInput!) {
    unpinPost(input: $input) {
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
		const { postId, action, publicationId } = req.body;

		if (!postId || !action || !publicationId) {
			return res
				.status(400)
				.json({ error: 'Missing required fields: postId, action, publicationId' });
		}

		if (!['pin', 'unpin'].includes(action)) {
			return res.status(400).json({ error: 'Invalid action. Must be "pin" or "unpin"' });
		}

		// Get the authorization token from cookies
		const token = req.cookies.hashnode_token;
		if (!token) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const mutation = action === 'pin' ? PIN_POST_MUTATION : UNPIN_POST_MUTATION;
		const variables = {
			input: {
				postId,
				publicationId,
			},
		};

		const response = await fetch(HASHNODE_GQL_ENDPOINT!, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: token,
			},
			body: JSON.stringify({
				query: mutation,
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

		const result = data.data[action === 'pin' ? 'pinPost' : 'unpinPost'];
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
