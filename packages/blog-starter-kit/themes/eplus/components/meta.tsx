import parse from 'html-react-parser';
import Head from 'next/head';

import { useAppContext } from './contexts/appContext';

export const Meta = () => {
	const { publication } = useAppContext();
	const { metaTags, favicon } = publication;
	const isDevelopment = process.env.NEXT_PUBLIC_MODE === 'development';

	// Favicon URLs
	const faviconUrl =
		'https://cdn.jsdelivr.net/gh/ePlus-DEV/cdn.eplus.dev@main/img/brand/logo-opaciry.png';

	const defaultFavicons = (
		<>
			<link rel="icon" type="image/svg+xml" href={faviconUrl} />
			<link rel="apple-touch-icon" href={faviconUrl} />
			<meta name="msapplication-TileColor" content="#000000" />
			<meta name="theme-color" content="#000" />
		</>
	);

	return (
		<Head>
			{/* Global CSS để làm mờ favicon trong development */}
			{isDevelopment && (
				<style>{`
					html[data-env="development"] {
						filter: none;
					}
					/* Thêm visual indicator cho development mode */
					body::before {
						content: "DEV MODE";
						position: fixed;
						top: 0;
						right: 0;
						background: #ff4444;
						color: white;
						padding: 2px 8px;
						font-size: 10px;
						font-weight: bold;
						z-index: 9999;
						border-radius: 0 0 0 4px;
						opacity: 0.8;
					}
				`}</style>
			)}

			{isDevelopment ? (
				<link rel="icon" type="image/svg+xml" href={faviconUrl} />
			) : favicon ? (
				<link rel="icon" type="image/svg+xml" href={favicon} />
			) : (
				defaultFavicons
			)}

			<meta name="msapplication-config" content="/favicon/browserconfig.xml" />
			<link rel="alternate" type="application/rss+xml" href="/feed.xml" />
			{metaTags && parse(metaTags)}
		</Head>
	);
};
