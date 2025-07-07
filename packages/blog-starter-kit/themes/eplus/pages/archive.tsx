import { InferGetServerSidePropsType, GetServerSidePropsContext } from 'next';
import { WithUrqlProps, initUrqlClient } from 'next-urql';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { NextIntlClientProvider, useTranslations } from 'next-intl';

import { AppProvider } from '../components/contexts/appContext';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import BlogPostPreview from '../components/magazine-blog-post-preview';
import PublicationFooter from '../components/publication-footer';
import Button from '../components/hn-button';
import { ChevronLeftSVG, ChevronRightSVG_16x16 as ChevronRightSVG } from '../components/icons/svgs';
import {
	PostsByPublicationDocument,
	PostsByPublicationQueryVariables,
} from '../generated/graphql';
import { createHeaders, createSSRExchange, getUrqlClientConfig } from '../lib/api/client';
import { getTimezoneFromLocale } from '../utils/timezone';

const POSTS_PER_PAGE = 12;

export default function Archive(
	props: InferGetServerSidePropsType<typeof getServerSideProps> & Required<WithUrqlProps>,
) {
	const { publication, posts, page, totalPages } = props;
	const router = useRouter();
	const t = useTranslations();
	const [currentPage, setCurrentPage] = useState(page);

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
		router.push(`/archive?page=${newPage}`);
	};

	const generatePaginationItems = () => {
		const items = [];
		const maxVisiblePages = 5;
		const halfVisible = Math.floor(maxVisiblePages / 2);
		let startPage = Math.max(1, currentPage - halfVisible);
		let endPage = Math.min(totalPages, currentPage + halfVisible);
		if (endPage - startPage < maxVisiblePages - 1) {
			if (startPage === 1) {
				endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
			} else {
				startPage = Math.max(1, endPage - maxVisiblePages + 1);
			}
		}
		for (let i = startPage; i <= endPage; i++) {
			items.push(i);
		}
		return items;
	};

	return (
		<NextIntlClientProvider
			locale={router.locale}
			messages={props.messages}
			timeZone={getTimezoneFromLocale(router.locale ?? 'en')}
		>
			<AppProvider publication={publication}>
				<Layout>
					<Head>
						<title>{`${t('archive.title')} - ${publication.displayTitle || publication.title || 'Hashnode Blog'}`}</title>
						<meta
							name="description"
							content={t('archive.description', {
								publicationTitle: publication.displayTitle || publication.title || 'this blog',
							})}
						/>
						<meta property="og:title" content={`${t('archive.title')} - ${publication.displayTitle || publication.title}`} />
						<meta
							property="og:description"
							content={t('archive.description', {
								publicationTitle: publication.displayTitle || publication.title || 'this blog',
							})}
						/>
						<meta property="twitter:title" content={`${t('archive.title')} - ${publication.displayTitle || publication.title}`} />
						<meta
							property="twitter:description"
							content={t('archive.description', {
								publicationTitle: publication.displayTitle || publication.title || 'this blog',
							})}
						/>
					</Head>
					<Header isHome={false} currentMenuId="archive" />
					<div className="container mx-auto px-4 py-8">
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
								{t('archive.allPosts')}
							</h1>
							<p className="text-gray-600 dark:text-gray-400">
								{t('archive.browsePosts', {
									totalPosts: posts?.totalDocuments || 0,
									publicationTitle: publication.displayTitle || publication.title,
								})}
							</p>
						</div>
						{!posts?.edges.length ? (
							<div className="text-center py-12">
								<p className="text-gray-500 dark:text-gray-400 text-lg">
									{t('archive.noPostsFound')}
								</p>
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
									{posts.edges.map((edge) => (
										<BlogPostPreview
											key={edge.node.id}
											post={{
												...edge.node,
												__typename: 'Post' as const,
												readTimeInMinutes: 5,
												views: 0,
												subtitle: edge.node.brief,
												cuid: edge.node.id,
												author: {
													...edge.node.author,
													__typename: 'User' as const,
													id: edge.node.author.username,
													followersCount: 0,
												},
												coverImage: edge.node.coverImage ? {
													...edge.node.coverImage,
													__typename: 'PostCoverImage' as const,
													isPortrait: false,
													isAttributionHidden: false,
												} : null,
											}}
											publication={publication}
										/>
									))}
								</div>
								{/* Pagination */}
								{totalPages > 1 && (
									<div className="flex items-center justify-center space-x-2 mt-8">
										<Button
											variant="transparent"
											disabled={currentPage === 1}
											onClick={() => handlePageChange(currentPage - 1)}
											className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<ChevronLeftSVG className="w-4 h-4" />
											<span>{t('archive.previous')}</span>
										</Button>
										{generatePaginationItems().map((pageNum) => (
											<Button
												key={pageNum}
												variant={currentPage === pageNum ? 'primary' : 'transparent'}
												onClick={() => handlePageChange(pageNum)}
												className={`px-4 py-2 text-sm font-medium rounded-lg ${
													currentPage === pageNum
														? 'text-white bg-blue-600 hover:bg-blue-700'
														: 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
												}`}
											>
												{pageNum}
											</Button>
										))}
										<Button
											variant="transparent"
											disabled={currentPage === totalPages}
											onClick={() => handlePageChange(currentPage + 1)}
											className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<span>{t('archive.next')}</span>
											<ChevronRightSVG className="w-4 h-4" />
										</Button>
									</div>
								)}
							</>
						)}
					</div>
					{publication && (
						<PublicationFooter
							authorName={publication.author.name}
							title={publication.title}
							imprint={publication.imprint}
							disableFooterBranding={publication.preferences.disableFooterBranding}
							isTeam={publication.isTeam}
							logo={publication.preferences.logo}
						/>
					)}
				</Layout>
			</AppProvider>
		</NextIntlClientProvider>
	);
}

// Helper to get endCursor for a specific page
async function getCursorForPage(urqlClient, host, page, pageSize) {
	let endCursor = undefined;
	if (page > 1) {
		let cursor = undefined;
		for (let i = 1; i < page; i++) {
			const res = await urqlClient.query(
				PostsByPublicationDocument,
				{ host, first: pageSize, after: cursor },
				{
					fetchOptions: { headers: createHeaders({ byPassCache: false }) },
					requestPolicy: 'network-only',
				}
			).toPromise();
			cursor = res.data?.publication?.posts?.pageInfo?.endCursor;
			if (!cursor) break;
		}
		endCursor = cursor;
	}
	return endCursor;
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
	const { locale = 'en', query } = context;
	const page = parseInt(query.page as string) || 1;

	// Load messages for the current locale
	const messages = (await import(`../messages/${locale}.json`)).default;

	const ssrCache = createSSRExchange();
	const urqlClient = initUrqlClient(getUrqlClientConfig(ssrCache), false);
	const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;

	// Get total posts for pagination
	const countRes = await urqlClient.query(
		PostsByPublicationDocument,
		{ host, first: 1 },
		{
			fetchOptions: { headers: createHeaders({ byPassCache: false }) },
			requestPolicy: 'network-only',
		}
	).toPromise();
	const totalPosts = countRes.data?.publication?.posts?.totalDocuments || 0;
	const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

	if (page > totalPages && totalPages > 0) {
		return {
			redirect: {
				destination: `/archive?page=${totalPages}`,
				permanent: false,
			},
		};
	}

	// Get correct cursor for this page
	const endCursor = await getCursorForPage(urqlClient, host, page, POSTS_PER_PAGE);

	const archiveRes = await urqlClient.query(
		PostsByPublicationDocument,
		{ host, first: POSTS_PER_PAGE, after: endCursor },
		{
			fetchOptions: { headers: createHeaders({ byPassCache: false }) },
			requestPolicy: 'network-only',
		}
	).toPromise();

	if (!archiveRes.data?.publication) {
		return { notFound: true };
	}

	return {
		props: {
			messages,
			publication: archiveRes.data.publication,
			posts: archiveRes.data.publication.posts,
			page,
			totalPages,
			urqlState: ssrCache.extractData(),
			host,
		},
	};
};
