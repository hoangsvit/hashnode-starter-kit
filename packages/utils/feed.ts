import RSS from 'rss';

const NON_ASCII_REGEX = /[\u{0080}-\u{FFFF}]/gu;
const STRIP_HTML_REGEX = /<[^>]*>/g;

export const constructRSSFeedFromPosts = (
	publication: any,
	posts: any[],
	currentCursor: string | null,
	nextCursor: string | null,
) => {
	const baseUrl = publication.url;
	const feedUrl = `${baseUrl}/rss.xml${currentCursor ? `?after=${currentCursor}` : ''}`;

	const customElements = [
		{
			'atom:link': {
				_attr: {
					rel: 'self',
					href: feedUrl,
					type: 'application/rss+xml',
				},
			},
		},
		{
			'atom:link': {
				_attr: {
					rel: 'first',
					href: `${baseUrl}/rss.xml`,
				},
			},
		},
	];
	if (nextCursor) {
		customElements.push({
			'atom:link': {
				_attr: {
					rel: 'next',
					href: `${baseUrl}/rss.xml?after=${nextCursor}`,
				},
			},
		});
	}

	const feedConfig = {
		title: `${publication.title || `${publication.author!.name}'s blog`}`,
		description: publication.about?.html?.replace(STRIP_HTML_REGEX, ''),
		feed_url: feedUrl,
		site_url: baseUrl,
		image_url: publication.preferences!.logo,
		language: 'en',
		ttl: 60,
		custom_elements: customElements,
	};

	const feed = new RSS(feedConfig);

	posts.forEach((post) => {
		feed.item({
			title: post.title,
			description: post.content!.html!.replace(NON_ASCII_REGEX, '').replace(STRIP_HTML_REGEX, ''),
			url: `${baseUrl}/${post.slug}`,
			categories: post.tags!.map((tag: any) => tag.name),
			author: post.author!.name,
			date: post.publishedAt,
			...(post.coverImage && { custom_elements: [{ cover_image: post.coverImage }] }),
		});
	});

	const xml = feed.xml();
	return xml;
};
