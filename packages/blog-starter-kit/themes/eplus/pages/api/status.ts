// Simple status endpoint for Next.js API routes
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
