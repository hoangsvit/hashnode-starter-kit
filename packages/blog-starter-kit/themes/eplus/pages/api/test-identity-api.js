/**
 * Test script để demonstate API identity với cookies
 * Run: node test-identity-api.js
 */

const testIdentityAPI = async () => {
	const guid = '8684d122-e8df-4ca6-af80-ea35bcf2a748';
	const API_URL = `http://localhost:3000/api/identity?guid=${encodeURIComponent(guid)}`;

	// Cookies từ request của bạn
	const cookies = 'cdnonwld=1; jwt=eyJhbGciOiJIUzI1NiJ9.eyJ0eXAiOiJKV1QiLCJkYXRhIjp7Imlzc3VlZEF0IjoxNzQ1MzA0OTQ3OTgxLCJ1c2VySWQiOiI1ZjgwMmRmOWJiYWJmMTBlYzg0ZDlmZTgifSwiaWF0IjoxNzQ1MzA0OTQ3LCJleHAiOjMyODQ5MzA0OTQ3fQ.6YiRLi74ooDWSQlr84_k0HgVJnmZHKaeFI6do1LcwYs; __amplitudeDeviceID=99c5cebd-c7a1-4be6-bd61-62660d7903fb';

	try {
		console.log('🚀 Testing Identity API with cookies...');
		console.log('📝 GUID:', guid);
		console.log('🍪 Cookies:', cookies);
		console.log('🔗 URL:', API_URL);

		const response = await fetch(API_URL, {
			method: 'GET',
			headers: {
				'Cookie': cookies
			}
		});

		const result = await response.json();

		console.log('📊 Response status:', response.status);
		console.log('📋 Response data:', JSON.stringify(result, null, 2));

		if (response.ok) {
			console.log('✅ Identity verification successful!');

			// Check response cookies
			const setCookieHeaders = response.headers.get('Set-Cookie');
			if (setCookieHeaders) {
				console.log('🍪 Set-Cookie headers:', setCookieHeaders);
			}
		} else {
			console.log('❌ Identity verification failed');
		}

	} catch (error) {
		console.error('💥 Error testing API:', error);
	}
};

// Decode JWT payload để xem thông tin
const decodeJWT = (token) => {
	try {
		const [header, payload, signature] = token.split('.');
		const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
		return JSON.parse(decodedPayload);
	} catch (error) {
		console.error('Error decoding JWT:', error);
		return null;
	}
};

// Main execution
const main = async () => {
	console.log('🔍 JWT Token Analysis:');
	const jwtToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ0eXAiOiJKV1QiLCJkYXRhIjp7Imlzc3VlZEF0IjoxNzQ1MzA0OTQ3OTgxLCJ1c2VySWQiOiI1ZjgwMmRmOWJiYWJmMTBlYzg0ZDlmZTgifSwiaWF0IjoxNzQ1MzA0OTQ3LCJleHAiOjMyODQ5MzA0OTQ3fQ.6YiRLi74ooDWSQlr84_k0HgVJnmZHKaeFI6do1LcwYs';

	const decoded = decodeJWT(jwtToken);
	if (decoded) {
		console.log('📋 Decoded JWT:', JSON.stringify(decoded, null, 2));
		console.log('👤 User ID:', decoded.data?.userId);
		console.log('📅 Issued At:', new Date(decoded.data?.issuedAt).toISOString());
		console.log('⏰ Expires At:', new Date(decoded.exp * 1000).toISOString());
	}

	console.log('\n' + '='.repeat(50) + '\n');

	// Test API
	await testIdentityAPI();
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { testIdentityAPI, decodeJWT };
}

// Run if called directly
if (typeof window === 'undefined' && require.main === module) {
	main();
}
