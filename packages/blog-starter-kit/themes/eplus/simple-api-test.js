/**
 * Simple API test - Kiểm tra API identity có hoạt động không
 * Chạy: node simple-api-test.js
 */

const testAPI = async () => {
	const guid = '8684d122-e8df-4ca6-af80-ea35bcf2a748';
	const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
	const url = `${baseUrl}/api/identity?guid=${encodeURIComponent(guid)}`;

	console.log('🧪 Testing API endpoint...');
	console.log('🔗 URL:', url);

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'User-Agent': 'test-script'
			}
		});

		console.log('📊 Status:', response.status);
		console.log('📋 Status Text:', response.statusText);
		console.log('🌐 Headers:', Object.fromEntries(response.headers.entries()));

		if (response.ok) {
			const data = await response.json();
			console.log('✅ Response Data:', JSON.stringify(data, null, 2));
		} else {
			console.log('❌ Error Response');
			const text = await response.text();
			console.log('📄 Error Body:', text);
		}

	} catch (error) {
		console.error('💥 Fetch Error:', error.message);
		console.error('🔍 Error Details:', error);
	}
};

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
	console.log('⚠️  This script requires Node.js 18+ or a fetch polyfill');
	console.log('💡 Try: npm install node-fetch');
	process.exit(1);
}

testAPI().catch(console.error);
