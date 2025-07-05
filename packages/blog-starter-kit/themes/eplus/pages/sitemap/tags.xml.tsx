import { generateTagsSitemap, setSitemapHeaders } from '@starter-kit/utils/seo/sitemap-utils';
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
const MAX_POSTS = 2000;
const SitemapTags = () => null;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { res } = ctx;

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

		const domain = publication.url;
		const posts = publication.posts.edges.map((edge) => edge.node);

		// Get more posts by pagination if exists to collect all tags
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

			posts.push(...publication.posts.edges.map((edge) => edge.node));

			if (pageInfo.hasNextPage && posts.length < MAX_POSTS) {
				await fetchPosts(pageInfo.endCursor);
			}
		};

		if (initialPageInfo.hasNextPage) {
			await fetchPosts(initialPageInfo.endCursor);
		}

		const xml = generateTagsSitemap(posts, domain);

		setSitemapHeaders(res);
		res.write(xml);
		res.end();

		return { props: {} };
	} catch (error) {
		console.error('Tags sitemap generation error:', error);
		return {
			notFound: true,
		};
	}
};

export default SitemapTags;
