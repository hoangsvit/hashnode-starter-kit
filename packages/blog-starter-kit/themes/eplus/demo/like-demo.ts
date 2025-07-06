// Demo: How the like functionality works
// This is a simplified example showing the like toggle behavior

const demoLikeToggle = (commentId: string, currentlyLiked: boolean, currentLikeCount: number) => {
	// When user clicks like/unlike button:

	// 1. Calculate new like count
	const newLikeCount = currentlyLiked ? currentLikeCount - 1 : currentLikeCount + 1;

	// 2. Determine if user is liking or unliking
	const isLiking = !currentlyLiked;

	console.log(`Comment ${commentId}:`);
	console.log(
		`  Current state: ${currentlyLiked ? 'liked' : 'not liked'} (${currentLikeCount} likes)`,
	);
	console.log(`  Action: ${isLiking ? 'LIKE' : 'UNLIKE'}`);
	console.log(`  New state: ${isLiking ? 'liked' : 'not liked'} (${newLikeCount} likes)`);

	return {
		success: true,
		newLikeCount,
		isLiked: isLiking,
	};
};

// Example usage:
console.log('=== Demo: Like functionality ===');
console.log('');

// User likes a comment with 5 likes
console.log('1. User likes a comment:');
demoLikeToggle('comment-1', false, 5);
console.log('');

// User unlikes the same comment (now has 6 likes)
console.log('2. User unlikes the same comment:');
demoLikeToggle('comment-1', true, 6);
console.log('');

// User likes a comment with 0 likes
console.log('3. User likes a comment with 0 likes:');
demoLikeToggle('comment-2', false, 0);
console.log('');

// User unlikes a comment with 1 like
console.log('4. User unlikes a comment with 1 like:');
demoLikeToggle('comment-2', true, 1);

export default demoLikeToggle;
