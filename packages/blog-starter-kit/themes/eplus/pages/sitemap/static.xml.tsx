import { generateStaticPagesSitemap, setSitemapHeaders } from '@starter-kit/utils/seo/sitemap-utils';
import request from 'graphql-request';
import { GetServerSideProps } from 'next';
import {
	SitemapDocument,
	SitemapQuery,
	SitemapQueryVariables,
} from '../../generated/graphql';
import { replaceLegacyPublicationUrl } from '../../utils/urls';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;
const SitemapStatic = () => null;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { res } = ctx;

	try {
		const initialData = await request<SitemapQuery, SitemapQueryVariables>(
			GQL_ENDPOINT,
			SitemapDocument,
			{
				host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
				postsCount: 1, // Chỉ cần 1 post để lấy lastmod
				staticPagesCount: 50, // Giới hạn tối đa của GraphQL API
			},
		);

		const publication = initialData.publication;
		if (!publication) {
			return {
				notFound: true,
			};
		}

		const domain = replaceLegacyPublicationUrl(publication.url) || publication.url;
		const staticPages = publication.staticPages.edges.map((edge: any) => edge.node);

		// TODO: Thêm pagination logic nếu cần thiết
		// Hiện tại GraphQL API chỉ hỗ trợ tối đa 50 static pages
		// Nếu bạn có nhiều hơn 50 static pages, cần implement pagination tương tự posts

		const xml = generateStaticPagesSitemap(staticPages, domain);

		setSitemapHeaders(res);
		res.write(xml);
		res.end();

		return { props: {} };
	} catch (error) {
		console.error('Static sitemap generation error:', error);
		return {
			notFound: true,
		};
	}
};

export default SitemapStatic;
