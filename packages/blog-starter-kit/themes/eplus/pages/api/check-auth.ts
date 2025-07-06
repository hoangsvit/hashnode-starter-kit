import { NextApiRequest, NextApiResponse } from 'next';

const HASHNODE_API_URL = 'https://gql.hashnode.com/';

const ME_QUERY = `
  query Me {
    me {
      id
      name
      username
      profilePicture
      email
      bio {
        text
      }
      location
      tagline
      dateJoined
      followersCount
      followingsCount
      socialMediaLinks {
        twitter
        linkedin
        github
        website
      }
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		// Get token from HTTP-only cookie
		const token = req.cookies.hashnode_token;

		if (!token) {
			return res.status(401).json({ error: 'Not authenticated' });
		}

		// Validate token with Hashnode API
		const response = await fetch(HASHNODE_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				query: ME_QUERY,
			}),
		});

		const data = await response.json();

		if (data.errors || !data.data?.me) {
			return res.status(401).json({ error: 'Invalid or expired token' });
		}

		// Return user info with enhanced data (don't send token back to client)
		const userData = data.data.me;

		// Update last authentication check timestamp
		const isProduction = process.env.NODE_ENV === 'production';
		const maxAge = 63072000; // 2 years
		const updateCookie =
			`last_auth_check=${Date.now()}; SameSite=Strict; Max-Age=${maxAge}; Path=/` +
			(isProduction ? '; Secure' : '');

		res.setHeader('Set-Cookie', updateCookie);

		return res.status(200).json({
			user: {
				id: userData.id,
				name: userData.name,
				username: userData.username,
				profilePicture: userData.profilePicture,
				email: userData.email,
				bio: userData.bio?.text ?? null,
				location: userData.location,
				tagline: userData.tagline,
				dateJoined: userData.dateJoined,
				followersCount: userData.followersCount,
				followingsCount: userData.followingsCount,
				socialMediaLinks: userData.socialMediaLinks,
			},
			authenticated: true,
		});
	} catch (error) {
		console.error('Auth check error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
