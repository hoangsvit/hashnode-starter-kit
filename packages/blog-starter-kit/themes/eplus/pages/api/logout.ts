import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		// Clear all authentication cookies by setting them with expired date
		const isProduction = process.env.NODE_ENV === 'production';
		const expiredDate = 'Thu, 01 Jan 1970 00:00:00 GMT';

		const clearCookies = [
			// Clear HTTP-only token cookie
			`hashnode_token=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/; Expires=${expiredDate}${isProduction ? '; Secure' : ''}`,
			// Clear client-accessible authentication flag
			`is_authenticated=; SameSite=Strict; Max-Age=0; Path=/; Expires=${expiredDate}${isProduction ? '; Secure' : ''}`,
			// Clear last authentication check timestamp
			`last_auth_check=; SameSite=Strict; Max-Age=0; Path=/; Expires=${expiredDate}${isProduction ? '; Secure' : ''}`,
		];

		res.setHeader('Set-Cookie', clearCookies);

		return res.status(200).json({
			success: true,
			message: 'Logged out successfully',
		});
	} catch (error) {
		console.error('Logout error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
