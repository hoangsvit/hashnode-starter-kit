import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		// Clear HTTP-only cookie by setting it with expired date
		const isProduction = process.env.NODE_ENV === 'production';
		const clearCookie = `hashnode_token=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT${isProduction ? '; Secure' : ''}`;

		res.setHeader('Set-Cookie', clearCookie);

		return res.status(200).json({
			success: true,
			message: 'Logged out successfully',
		});
	} catch (error) {
		console.error('Logout error:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}
