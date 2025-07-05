export interface SitemapConfig {
	maxPostsPerSitemap: number;
	maxUrlsPerSitemap: number;
	domain: string;
	cacheControl: string;
}

export const DEFAULT_SITEMAP_CONFIG: SitemapConfig = {
	maxPostsPerSitemap: 10000, // Tăng lên gần giới hạn Google (50k URLs)
	maxUrlsPerSitemap: 50000, // Giới hạn Google
	domain: '',
	cacheControl: 's-maxage=3600, stale-while-revalidate=86400',
};

export const generateSitemapIndex = (sitemaps: string[], domain: string): string => {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>';
	xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	sitemaps.forEach((sitemap) => {
		xml += '<sitemap>';
		xml += `<loc>${domain}/${sitemap}</loc>`;
		xml += `<lastmod>${new Date().toISOString()}</lastmod>`;
		xml += '</sitemap>';
	});

	xml += '</sitemapindex>';
	return xml;
};

export const generatePostsSitemap = (posts: any[], domain: string, page?: number): string => {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>';
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	posts.forEach((post) => {
		xml += '<url>';
		xml += `<loc>${domain}/${post.slug}</loc>`;
		xml += '<changefreq>daily</changefreq>';
		xml += '<priority>0.8</priority>';
		if (post.updatedAt) {
			xml += `<lastmod>${post.updatedAt}</lastmod>`;
		}
		xml += '</url>';
	});

	xml += '</urlset>';
	return xml;
};

export const generateStaticPagesSitemap = (staticPages: any[], domain: string): string => {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>';
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	// Homepage
	xml += '<url>';
	xml += `<loc>${domain}</loc>`;
	xml += '<changefreq>always</changefreq>';
	xml += '<priority>1</priority>';
	xml += `<lastmod>${new Date().toISOString()}</lastmod>`;
	xml += '</url>';

	// Static pages
	staticPages.forEach((page) => {
		xml += '<url>';
		xml += `<loc>${domain}/${page.slug}</loc>`;
		xml += '<changefreq>weekly</changefreq>';
		xml += '<priority>0.9</priority>';
		xml += `<lastmod>${new Date().toISOString()}</lastmod>`;
		xml += '</url>';
	});

	xml += '</urlset>';
	return xml;
};

export const generateTagsSitemap = (posts: any[], domain: string): string => {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>';
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
		xml += `<loc>${domain}/tag/${tag}</loc>`;
		xml += '<changefreq>weekly</changefreq>';
		xml += '<priority>0.7</priority>';
		xml += `<lastmod>${new Date().toISOString()}</lastmod>`;
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
