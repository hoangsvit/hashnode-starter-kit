import RSS from 'rss';

const NON_ASCII_REGEX = /[\u{0080}-\u{FFFF}]/gu;
const STRIP_HTML_REGEX = /<[^>]*>/g;
const ABSOLUTE_HTTP_URL_REGEX = /^https?:\/\//i;

const createPostItemUrl = (baseUrl: string, publication: any, post: any) => {
	const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

	if (typeof post.url === 'string' && post.url.length > 0) {
		if (ABSOLUTE_HTTP_URL_REGEX.test(post.url)) {
			return post.url;
		}

		if (post.url.startsWith('/')) {
			return `${normalizedBaseUrl}${post.url}`;
		}

		return `${normalizedBaseUrl}/${post.url}`;
	}

	const slug = post.slug;
	if (!slug) {
		return normalizedBaseUrl;
	}

	const urlPattern = post.publication?.urlPattern || post.urlPattern || publication?.urlPattern;
	const shouldUseSlugOnly = urlPattern === 'SIMPLE';
	const pathname = shouldUseSlugOnly || !post.cuid ? `/${slug}` : `/${slug}-${post.cuid}`;

	return `${normalizedBaseUrl}${pathname}`;
};

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
			url: createPostItemUrl(baseUrl, publication, post),
			categories: post.tags!.map((tag: any) => tag.name),
			author: post.author!.name,
			date: post.publishedAt,
			...(post.coverImage && { custom_elements: [{ cover_image: post.coverImage }] }),
		});
	});

	const xml = feed.xml();
	return xml;
};
