import { NextApiRequest, NextApiResponse } from 'next';

interface IdentityResponse {
	success: boolean;
	message?: string;
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
	if (req.method !== 'GET') {
		return res.status(405).json({ success: false, message: 'Method not allowed' });
	}

	try {
		// Extract cookies from request headers
		const cookies = parseCookies(req.headers.cookie || '');
		const jwtToken = cookies.jwt;

		// Log cookies for debugging
		console.log('Received cookies:', {
			hasJWT: !!jwtToken,
		});

		// Sử dụng JWT token có sẵn để gọi GraphQL Me query
		if (!jwtToken) {
			return res.status(401).json({
				success: false,
				message: 'JWT token is required',
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

			console.log('🔄 Calling GraphQL Me query with provided JWT token');

			const response = await fetch(
				process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT || 'https://gql.hashnode.com',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${jwtToken}`,
					},
					body: JSON.stringify({
						query: graphqlQuery,
					}),
				},
			);

			const result = await response.json();
			console.log('📊 GraphQL Response status:', response.status);
			console.log('📊 GraphQL Response:', JSON.stringify(result, null, 2));

			if (result.errors) {
				console.error('❌ GraphQL Authentication failed:', result.errors);
				return res.status(401).json({
					success: false,
					message: 'GraphQL authentication failed. Invalid token.',
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
				console.log('✅ GraphQL Me query successful:', {
					userId: graphqlUserInfo.id,
					username: graphqlUserInfo.username,
					email: graphqlUserInfo.email,
				});
			} else {
				console.error('❌ No user data returned from GraphQL');
				return res.status(401).json({
					success: false,
					message: 'No user data available from GraphQL API.',
				});
			}
		} catch (error) {
			console.error('❌ GraphQL Me query failed:', error);
			return res.status(500).json({
				success: false,
				message: 'Failed to fetch user information from GraphQL API.',
			});
		}

		// Sử dụng GraphQL user data trực tiếp
		const user = {
			...graphqlUserInfo,
		};

		// Tạo tokens cho user
		const authToken = generateAuthToken(user);
		const refreshToken = generateRefreshToken(user);
		const identityToken = generateIdentityToken(user);

		// Set HTTP-only cookies với thông tin bảo mật (sử dụng JWT token gốc)
		res.setHeader('Set-Cookie', [
			`auth-token=${authToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=63072000; Path=/`,
			`refresh-token=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=63072000; Path=/`,
			`identity-token=${identityToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=63072000; Path=/`,
			`jwt=${jwtToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=63072000; Path=/`,
			`jwt=${jwtToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=63072000; Path=/; Domain=.hashnode.dev`,
		]);

		console.log('✅ User data fetched and cookies set:', {
			userId: user.id,
			email: user.email,
			username: user.username,
			cookiesSet: ['auth-token', 'refresh-token', 'identity-token', 'jwt'],
		});

		return res.status(200).json({
			success: true,
			message: 'User data fetched successfully',
			user: user,
		});
	} catch (error) {
		console.error('API error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
}

// Utility function to parse cookies from header string
function parseCookies(cookieHeader: string): Record<string, string> {
	const cookies: Record<string, string> = {};

	if (!cookieHeader) {
		return cookies;
	}

	cookieHeader.split(';').forEach((cookie) => {
		const [name, ...rest] = cookie.trim().split('=');
		if (name && rest.length > 0) {
			cookies[name] = rest.join('=');
		}
	});

	return cookies;
}

// Utility functions for generating tokens
function generateAuthToken(user: any): string {
	return `auth_${user.id}_${Date.now()}`;
}

function generateRefreshToken(user: any): string {
	return `refresh_${user.id}_${Date.now()}`;
}

function generateIdentityToken(user: any): string {
	return `identity_${user.id}_${Date.now()}`;
}
