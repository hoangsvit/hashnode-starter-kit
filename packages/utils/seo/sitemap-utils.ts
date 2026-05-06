export interface SitemapConfig {
	maxPostsPerSitemap: number;
	maxUrlsPerSitemap: number;
	domain: string;
	cacheControl: string;
}

export const DEFAULT_SITEMAP_CONFIG: SitemapConfig = {
	maxPostsPerSitemap: 50000, // Sitemap protocol hard limit per file
	maxUrlsPerSitemap: 50000,  // Sitemap protocol hard limit per file
	domain: '',
	cacheControl: 's-maxage=3600, stale-while-revalidate=86400',
};

const XSL_PI = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

/**
 * Entity-escape special XML characters in a URL before placing it in <loc>.
 * Per sitemap protocol: all data values must be entity-escaped.
 */
const escapeXml = (str: string): string =>
	str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

/**
 * Format a date string to W3C Datetime (YYYY-MM-DD) as recommended by the protocol.
 * Full ISO-8601 is also valid but YYYY-MM-DD is cleaner and widely accepted.
 */
const toW3CDate = (dateStr: string): string => dateStr.slice(0, 10);

export const generateSitemapIndex = (sitemaps: string[], domain: string): string => {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>';
	xml += XSL_PI;
	xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	sitemaps.forEach((sitemap) => {
		xml += '<sitemap>';
		xml += `<loc>${escapeXml(`${domain}/${sitemap}`)}</loc>`;
		// lastmod here refers to when the sitemap file was last modified — using
		// current time is correct for the index (it's regenerated on each request).
		xml += `<lastmod>${toW3CDate(new Date().toISOString())}</lastmod>`;
		xml += '</sitemap>';
	});

	xml += '</sitemapindex>';
	return xml;
};

export const generatePostsSitemap = (posts: any[], domain: string, page?: number): string => {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>';
	xml += XSL_PI;
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
	const normalizedDomain = domain.replace(/\/+$/, '');
	const absoluteUrlRegex = /^https?:\/\//i;

	posts.forEach((post) => {
		let postUrl: string;
		if (typeof post.url === 'string' && post.url.length > 0) {
			if (absoluteUrlRegex.test(post.url)) {
				postUrl = post.url;
			} else if (post.url.startsWith('/')) {
				postUrl = `${normalizedDomain}${post.url}`;
			} else {
				postUrl = `${normalizedDomain}/${post.url}`;
			}
		} else {
			const urlPattern = post.publication?.urlPattern || post.urlPattern;
			const shouldUseSlugOnly = urlPattern === 'SIMPLE' || !post.cuid;
			const path = shouldUseSlugOnly ? `/${post.slug}` : `/${post.slug}-${post.cuid}`;
			postUrl = `${normalizedDomain}${path}`;
		}

		// Determine how stale the post is to assign appropriate changefreq.
		// Protocol: "always" = changes every access; "never" = archived.
		// Blog posts are mostly stable — weekly for recent, monthly for older.
		const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null;
		const ageInDays = publishedAt ? (Date.now() - publishedAt.getTime()) / 86400000 : Infinity;
		const changefreq = ageInDays < 30 ? 'weekly' : 'monthly';

		// Use updatedAt if available, otherwise fall back to publishedAt.
		// Protocol: "must be set to the date the page was last modified, not when
		// the sitemap is generated."
		const lastmod = post.updatedAt ?? post.publishedAt;

		xml += '<url>';
		xml += `<loc>${escapeXml(postUrl)}</loc>`;
		xml += `<lastmod>${toW3CDate(lastmod)}</lastmod>`;
		xml += `<changefreq>${changefreq}</changefreq>`;
		xml += '<priority>0.8</priority>';
		xml += '</url>';
	});

	xml += '</urlset>';
	return xml;
};

export const generateStaticPagesSitemap = (staticPages: any[], domain: string): string => {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>';
	xml += XSL_PI;
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	// Homepage — changes daily as new posts are published.
	// "always" is reserved for pages that change on every single access.
	xml += '<url>';
	xml += `<loc>${escapeXml(domain)}</loc>`;
	xml += '<changefreq>daily</changefreq>';
	xml += '<priority>1.0</priority>';
	xml += '</url>';

	// Static pages — content is set by the author; we have no modification date
	// from the API, so omit lastmod rather than lying with new Date().
	staticPages.forEach((page) => {
		xml += '<url>';
		xml += `<loc>${escapeXml(`${domain}/${page.slug}`)}</loc>`;
		xml += '<changefreq>monthly</changefreq>';
		xml += '<priority>0.9</priority>';
		xml += '</url>';
	});

	xml += '</urlset>';
	return xml;
};

export const generateTagsSitemap = (posts: any[], domain: string): string => {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>';
	xml += XSL_PI;
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	const uniqueTags = new Set<string>();
	for (const post of posts) {
		if (Array.isArray(post.tags)) {
			for (const tag of post.tags) {
				uniqueTags.add(tag.slug);
			}
		}
	}

	uniqueTags.forEach((tag) => {
		xml += '<url>';
		xml += `<loc>${escapeXml(`${domain}/tag/${tag}`)}</loc>`;
		// Tag listing pages update whenever a new post with that tag is published.
		xml += '<changefreq>weekly</changefreq>';
		xml += '<priority>0.6</priority>';
		xml += '</url>';
	});

	xml += '</urlset>';
	return xml;
};

export const chunkArray = <T>(array: T[], size: number): T[][] => {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
};

export const setSitemapHeaders = (res: any, cacheControl?: string) => {
	res.setHeader('Cache-Control', cacheControl || DEFAULT_SITEMAP_CONFIG.cacheControl);
	res.setHeader('Content-Type', 'application/xml; charset=utf-8');
};
