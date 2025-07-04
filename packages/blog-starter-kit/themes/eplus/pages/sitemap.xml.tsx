import { GetServerSideProps } from 'next';

// Sitemap chính redirect tới sitemap index trong thư mục /sitemap/
const SitemapRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { res } = ctx;

	// Redirect tới sitemap index mới
	res.writeHead(301, {
		Location: '/sitemap/index.xml',
	});
	res.end();

	return { props: {} };
};

export default SitemapRedirect;
