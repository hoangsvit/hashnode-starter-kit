import { generatePostsSitemap, setSitemapHeaders, chunkArray, DEFAULT_SITEMAP_CONFIG } from '@starter-kit/utils/seo/sitemap-utils';
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
import { replaceLegacyPublicationUrl } from '../../utils/urls';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;
const MAX_POSTS_PER_SITEMAP = DEFAULT_SITEMAP_CONFIG.maxPostsPerSitemap;
const SitemapPostsPaginated = () => null;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { res, query } = ctx;
	const page = parseInt(query.page as string) || 1;

	try {
		const initialData = await request<SitemapQuery, SitemapQueryVariables>(
			GQL_ENDPOINT,
			SitemapDocument,
			{
				host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
				postsCount: 50,
				staticPagesCount: 1,
			},
		);

		const publication = initialData.publication;
		if (!publication) {
			return {
				notFound: true,
			};
		}

		const domain = replaceLegacyPublicationUrl(publication.url) || publication.url;
		const allPosts = publication.posts.edges.map((edge) => edge.node);

		// Get all posts by pagination
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

		// Chunk posts into pages
		const postsChunks = chunkArray(allPosts, MAX_POSTS_PER_SITEMAP);
		const requestedChunk = postsChunks[page - 1];

		if (!requestedChunk) {
			return {
				notFound: true,
			};
		}

		const xml = generatePostsSitemap(requestedChunk, domain, page);

		setSitemapHeaders(res);
		res.write(xml);
		res.end();

		return { props: {} };
	} catch (error) {
		console.error('Paginated posts sitemap generation error:', error);
		return {
			notFound: true,
		};
	}
};

export default SitemapPostsPaginated;
