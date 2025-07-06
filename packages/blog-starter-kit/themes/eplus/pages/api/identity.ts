import { NextApiRequest, NextApiResponse } from 'next';

interface IdentityResponse {
	success: boolean;
	message?: string;
	token?: string;
	user?: {
		id: string;
		email: string;
		name: string;
		username?: string;
		profilePicture?: string | null;
		bio?: string | null;
		location?: string | null;
		tagline?: string | null;
		followersCount?: number;
		followingsCount?: number;
	};
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<IdentityResponse>) {
	if (req.method !== 'POST') {
		return res.status(405).json({ success: false, message: 'Method not allowed' });
	}
	try {
		// Chỉ lấy token từ request body
		const { token } = req.body ?? {};
		const personalAccessToken = token;

		// Kiểm tra token có tồn tại không
		if (!personalAccessToken) {
			return res.status(401).json({
				success: false,
				message: 'Personal Access Token is required in request body',
			});
		}

		// Validate Personal Access Token format (UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
		if (personalAccessToken.length < 30) {
			return res.status(401).json({
				success: false,
				message: 'Invalid Personal Access Token format. Token too short.',
			});
		}

		// Check if token matches UUID format or general alphanumeric format
		const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		const generalTokenPattern = /^[A-Za-z0-9_-]+$/;

		if (!uuidPattern.test(personalAccessToken) && !generalTokenPattern.test(personalAccessToken)) {
			return res.status(401).json({
				success: false,
				message: 'Invalid Personal Access Token format. Please check your token.',
			});
		}

		// Gọi GraphQL Me query để lấy thông tin user từ Hashnode API
		let graphqlUserInfo = null;
		try {
			const graphqlQuery = `
				query Me {
					me {
						id
						name
						username
						email
						profilePicture
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

			console.log('🔄 Calling GraphQL Me query with Personal Access Token');
			console.log(
				'🎯 GraphQL Endpoint:',
				process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT || 'https://gql.hashnode.com',
			);

			const response = await fetch(
				process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT || 'https://gql.hashnode.com',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${personalAccessToken}`,
					},
					body: JSON.stringify({
						query: graphqlQuery,
					}),
				},
			);

			const result = await response.json();

			// Check if HTTP status is not OK
			if (!response.ok) {
				return res.status(401).json({
					success: false,
					message: `GraphQL request failed with status ${response.status}: ${response.statusText}`,
				});
			}

			if (result.errors) {
				// Provide more detailed error message
				const errorDetails = result.errors.map((err: any) => err.message).join(', ');
				return res.status(401).json({
					success: false,
					message: `GraphQL authentication failed: ${errorDetails}`,
				});
			} else if (result.data?.me) {
				const meData = result.data.me;
				graphqlUserInfo = {
					id: meData.id,
					name: meData.name,
					username: meData.username,
					email: meData.email,
					profilePicture: meData.profilePicture,
					bio: meData.bio?.text ?? null,
					location: meData.location,
					tagline: meData.tagline,
					followersCount: meData.followersCount,
					followingsCount: meData.followingsCount,
				};
			} else {
				return res.status(401).json({
					success: false,
					message: 'No user data available from GraphQL API.',
				});
			}
		} catch (error) {
			// Provide more detailed error information
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			return res.status(500).json({
				success: false,
				message: `Failed to fetch user information from GraphQL API: ${errorMessage}`,
			});
		}

		// Sử dụng GraphQL user data trực tiếp
		const user = {
			...graphqlUserInfo,
		};

		// Set HTTP-only cookie with Personal Access Token (2 years expiration)
		// Max-Age: 63072000 seconds = 2 years (365 * 24 * 60 * 60 * 2)
		const isProduction = process.env.NODE_ENV === 'production';
		const maxAge = 63072000;
		const expires = new Date(Date.now() + maxAge * 1000).toUTCString();

		const cookies = [
			// HTTP-only token cookie
			`hashnode_token=${personalAccessToken}; HttpOnly; SameSite=Strict; Max-Age=${maxAge}; Path=/` + (isProduction ? '; Secure' : ''),
			// Client-accessible authentication flag
			`is_authenticated=true; SameSite=Strict; Max-Age=${maxAge}; Path=/` + (isProduction ? '; Secure' : ''),
			// Last authentication check timestamp
			`last_auth_check=${Date.now()}; SameSite=Strict; Max-Age=${maxAge}; Path=/` + (isProduction ? '; Secure' : ''),
		];

		res.setHeader('Set-Cookie', cookies);

		return res.status(200).json({
			success: true,
			message: 'User data fetched successfully',
			user: user,
			// Token is now stored securely in HTTP-only cookies only
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		return res.status(500).json({
			success: false,
			message: `Internal server error: ${errorMessage}`,
		});
	}
}
