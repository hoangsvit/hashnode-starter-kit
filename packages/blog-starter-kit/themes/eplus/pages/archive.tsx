import { InferGetServerSidePropsType, GetServerSidePropsContext } from 'next';
import { WithUrqlProps, initUrqlClient } from 'next-urql';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { useEnvironmentTitle } from '../hooks/useEnvironmentTitle';

import { AppProvider } from '../components/contexts/appContext';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import BlogPostPreview from '../components/magazine-blog-post-preview';
import PublicationFooter from '../components/publication-footer';
import Button from '../components/hn-button';
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
	const { publication, posts: initialPosts } = props;
	const router = useRouter();
	const t = useTranslations();
	const [isLoading, setIsLoading] = useState(false);
	const [posts, setPosts] = useState(initialPosts);
	const [endCursor, setEndCursor] = useState(initialPosts?.pageInfo?.endCursor);
	const [hasNextPage, setHasNextPage] = useState(initialPosts?.pageInfo?.hasNextPage || false);


	const archiveTitle = useEnvironmentTitle(`${t('archive.title')} - ${publication.displayTitle || publication.title || 'Hashnode Blog'}`);

	const handleLoadMore = async () => {
		if (isLoading || !hasNextPage || !endCursor) return;

		setIsLoading(true);
		try {
			const ssrCache = createSSRExchange();
			const urqlClient = initUrqlClient(getUrqlClientConfig(ssrCache), false);
			const res = await urqlClient.query(
				PostsByPublicationDocument,
				{ host: props.host, first: POSTS_PER_PAGE, after: endCursor },
				{
					fetchOptions: { headers: createHeaders({ byPassCache: false }) },
					requestPolicy: 'network-only',
				}
			).toPromise();

			if (res.data?.publication?.posts) {
				setPosts(prev => ({
					...prev,
					edges: [...prev.edges, ...res.data.publication.posts.edges],
					pageInfo: res.data.publication.posts.pageInfo
				}));
				setEndCursor(res.data.publication.posts.pageInfo.endCursor);
				setHasNextPage(res.data.publication.posts.pageInfo.hasNextPage);
			}
		} catch (error) {
			console.error('Error loading more posts:', error);
		} finally {
			setIsLoading(false);
		}
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
						<title>{archiveTitle}</title>
						<meta name="robots" content="index, follow" />
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
								{/* Load More Button */}
								{hasNextPage && (
									<div className="flex items-center justify-center mt-8">
										<Button
											variant="transparent"
											disabled={isLoading}
											onClick={handleLoadMore}
											className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isLoading ? (
												<>
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
													<span>{t('common.loading')}</span>
												</>
											) : (
												<>
													<span>{t('archive.loadMorePosts')}</span>
												</>
											)}
										</Button>
									</div>
								)}
								{isLoading && (
									<div className="flex items-center justify-center py-4 mt-4">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
	const { locale = 'en' } = context;
	const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;

	// Load messages for the current locale
	const messages = (await import(`../messages/${locale}.json`)).default;

	const ssrCache = createSSRExchange();
	const urqlClient = initUrqlClient(getUrqlClientConfig(ssrCache), false);

	// Get first page of posts
	const archiveRes = await urqlClient.query(
		PostsByPublicationDocument,
		{ host, first: POSTS_PER_PAGE },
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
			host,
			urqlState: ssrCache.extractData(),
		},
	};
};
