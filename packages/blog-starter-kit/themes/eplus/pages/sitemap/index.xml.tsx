import { generateSitemapIndex, setSitemapHeaders, chunkArray, DEFAULT_SITEMAP_CONFIG } from '@starter-kit/utils/seo/sitemap-utils';
import request from 'graphql-request';
import { GetServerSideProps } from 'next';
import {
	MoreSitemapPostsDocument,
	MoreSitemapPostsQuery,
	MoreSitemapPostsQueryVariables,
	SitemapDocument,
	SitemapQuery,
	SitemapQueryVariables,
} from '../../generated/graphql';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;
const MAX_POSTS_PER_SITEMAP = DEFAULT_SITEMAP_CONFIG.maxPostsPerSitemap;
const SitemapIndex = () => null;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { res } = ctx;

	try {
		const initialData = await request<SitemapQuery, SitemapQueryVariables>(
			GQL_ENDPOINT,
			SitemapDocument,
			{
				host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
				postsCount: 50,
				staticPagesCount: 50, // Tăng lên tối đa để đếm đúng
			},
		);

		const publication = initialData.publication;
		if (!publication) {
			return {
				notFound: true,
			};
		}

		const domain = publication.url;
		const sitemaps: string[] = [];

		// Luôn có sitemap cho static pages
		sitemaps.push('sitemap/static.xml');

		// Kiểm tra số lượng posts để quyết định cấu trúc sitemap
		if (publication.posts.edges.length > 0) {
			// Lấy tất cả posts để đếm
			const allPosts = publication.posts.edges.map((edge) => edge.node);
			
			// Fetch thêm posts nếu có
			const initialPageInfo = publication.posts.pageInfo;
			const fetchPosts = async (after: string | null | undefined) => {
				const variables = {
					host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
					postsCount: 50,
					postsAfter: after,
				};

				const data = await request<MoreSitemapPostsQuery, MoreSitemapPostsQueryVariables>(
					GQL_ENDPOINT,
					MoreSitemapPostsDocument,
					variables,
				);
				const publication = data.publication;
				if (!publication) {
					return;
				}
				const pageInfo = publication.posts.pageInfo;

				allPosts.push(...publication.posts.edges.map((edge) => edge.node));

				if (pageInfo.hasNextPage) {
					await fetchPosts(pageInfo.endCursor);
				}
			};

			if (initialPageInfo.hasNextPage) {
				await fetchPosts(initialPageInfo.endCursor);
			}

			// Nếu có ít hơn MAX_POSTS_PER_SITEMAP thì dùng sitemap đơn
			if (allPosts.length <= MAX_POSTS_PER_SITEMAP) {
				sitemaps.push('sitemap/posts.xml');
			} else {
				// Nếu có nhiều posts thì tạo sitemap phân trang
				const postsChunks = chunkArray(allPosts, MAX_POSTS_PER_SITEMAP);
				for (let i = 0; i < postsChunks.length; i++) {
					sitemaps.push(`sitemap/posts-${i + 1}.xml`);
				}
			}

			// Chỉ thêm sitemap tags nếu có bài viết với tags
			const hasTags = allPosts.some(post => 
				post.tags && post.tags.length > 0
			);
			if (hasTags) {
				sitemaps.push('sitemap/tags.xml');
			}
		}

		const xml = generateSitemapIndex(sitemaps, domain);

		setSitemapHeaders(res);
		res.write(xml);
		res.end();

		return { props: {} };
	} catch (error) {
		console.error('Sitemap index generation error:', error);
		return {
			notFound: true,
		};
	}
};

export default SitemapIndex;
