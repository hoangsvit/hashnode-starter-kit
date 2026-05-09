import request from 'graphql-request';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useMemo, useState } from 'react';

import { AppProvider } from '../components/contexts/appContext';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import PublicationFooter from '../components/publication-footer';
import {
	MorePostsByPublicationDocument,
	MorePostsByPublicationQuery,
	MorePostsByPublicationQueryVariables,
	PostsByPublicationDocument,
	PostsByPublicationQuery,
	PostsByPublicationQueryVariables,
} from '../generated/graphql';
import { getTimezoneFromLocale } from '../utils/timezone';
import { replaceLegacyPublicationUrl } from '../utils/urls';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;
const HASHNODE_PUBLICATION_HOST = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;
const SITEMAP_POSTS_LIMIT = 50;

type SitemapPost = {
	id: string;
	title: string;
	slug: string;
	url: string;
	publishedAt: string;
};

type SitemapPageInfo = {
	endCursor?: string | null;
	hasNextPage?: boolean | null;
};

type PostsByYear = Record<string, SitemapPost[]>;

function groupByYear(posts: SitemapPost[]): PostsByYear {
	const grouped: PostsByYear = {};
	for (const post of posts) {
		const year = new Date(post.publishedAt).getFullYear().toString();
		if (!grouped[year]) grouped[year] = [];
		grouped[year].push(post);
	}
	return grouped;
}

function mapPostToSitemapPost(post: {
	id: string;
	title: string;
	slug: string;
	url: string;
	publishedAt: string;
}): SitemapPost {
	return {
		id: post.id,
		title: post.title,
		slug: post.slug,
		url: replaceLegacyPublicationUrl(post.url) || post.url,
		publishedAt: post.publishedAt,
	};
}

function sortPostsNewestFirst(posts: SitemapPost[]): SitemapPost[] {
	return [...posts].sort(
		(a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
	);
}

function SitemapPostsSkeleton() {
	return (
		<div className="space-y-3" aria-hidden="true">
			{Array.from({ length: 5 }).map((_, index) => (
				<div key={index} className="flex animate-pulse items-center gap-3 rounded-lg px-3 py-2.5">
					<div className="h-3 w-16 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800" />
					<div className="h-4 flex-1 rounded-full bg-slate-200 dark:bg-slate-800" />
				</div>
			))}
		</div>
	);
}

function SitemapPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const router = useRouter();
	const { publication, posts, totalPosts, initialPageInfo } = props;
	const [sitemapPosts, setSitemapPosts] = useState(posts);
	const [pageInfo, setPageInfo] = useState<SitemapPageInfo>(initialPageInfo);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
	const [sitemapSearchQuery, setSitemapSearchQuery] = useState('');
	const hasMorePosts = Boolean(pageInfo.hasNextPage);
	const publicationUrl = replaceLegacyPublicationUrl(publication.url) || publication.url;
	const pubTitle = publication.displayTitle || publication.title;

	const postsByYear = useMemo(() => groupByYear(sitemapPosts), [sitemapPosts]);
	const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

	const submitSitemapSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const query = sitemapSearchQuery.trim();
		router.push({
			pathname: '/search',
			query: query ? { q: query } : {},
		});
	};

	const loadMorePosts = async () => {
		if (!hasMorePosts || isLoadingMore) return;

		setIsLoadingMore(true);
		setLoadMoreError(null);

		try {
			const data = await request<MorePostsByPublicationQuery, MorePostsByPublicationQueryVariables>(
				GQL_ENDPOINT,
				MorePostsByPublicationDocument,
				{
					host: HASHNODE_PUBLICATION_HOST,
					first: SITEMAP_POSTS_LIMIT,
					after: pageInfo.endCursor,
				},
			);

			const nextPosts =
				data.publication?.posts.edges.map((edge) => mapPostToSitemapPost(edge.node)) || [];
			setSitemapPosts((currentPosts) => sortPostsNewestFirst([...currentPosts, ...nextPosts]));
			setPageInfo(data.publication?.posts.pageInfo || { endCursor: null, hasNextPage: false });
		} catch (error) {
			console.error('Error while loading more sitemap posts', error);
			setLoadMoreError('Could not load more posts. Please try again.');
		} finally {
			setIsLoadingMore(false);
		}
	};

	return (
		<AppProvider publication={publication}>
			<Layout>
				<Head>
					<title>{`Sitemap — ${pubTitle}`}</title>
					<meta name="robots" content="index, follow" />
					<link rel="canonical" href={`${publicationUrl}/sitemap`} />
					<meta
						name="description"
						content={`Browse ${sitemapPosts.length} of ${totalPosts} articles published on ${pubTitle}.`}
					/>
				</Head>

				<Header isHome={false} />

				<main className="container mx-auto max-w-5xl px-4 py-12 md:px-6">
					{/* Page header */}
					<div className="mb-10 border-b pb-8 dark:border-slate-800">
						<h1 className="font-heading mb-3 text-3xl font-extrabold text-slate-900 md:text-4xl dark:text-white">
							Sitemap
						</h1>
						<p className="text-slate-500 dark:text-slate-400">
							Showing {sitemapPosts.length} of {totalPosts} articles published on{' '}
							<Link
								href="/"
								className="font-medium text-blue-600 hover:underline dark:text-blue-400"
							>
								{pubTitle}
							</Link>
						</p>
						<form
							onSubmit={submitSitemapSearch}
							className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row dark:border-slate-800 dark:bg-slate-900/60"
						>
							<label className="sr-only" htmlFor="sitemap-search">
								Search posts
							</label>
							<input
								id="sitemap-search"
								type="search"
								value={sitemapSearchQuery}
								onChange={(event) => setSitemapSearchQuery(event.target.value)}
								placeholder="Search all posts..."
								className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950"
							/>
							<button
								type="submit"
								className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-800"
							>
								Search
							</button>
						</form>

						<div className="mt-4 flex flex-wrap gap-3 text-sm">
							<a
								href="/sitemap/index.xml"
								className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400"
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg
									className="h-3.5 w-3.5"
									fill="currentColor"
									viewBox="0 0 20 20"
									aria-hidden="true"
								>
									<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
									<path
										fillRule="evenodd"
										d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
										clipRule="evenodd"
									/>
								</svg>
								XML Sitemap Index
							</a>
							<a
								href="/sitemap/posts.xml"
								className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400"
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg
									className="h-3.5 w-3.5"
									fill="currentColor"
									viewBox="0 0 20 20"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
										clipRule="evenodd"
									/>
									<path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
								</svg>
								Posts XML
							</a>
							<a
								href="/sitemap/tags.xml"
								className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400"
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg
									className="h-3.5 w-3.5"
									fill="currentColor"
									viewBox="0 0 20 20"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
										clipRule="evenodd"
									/>
								</svg>
								Tags XML
							</a>
						</div>
					</div>
					{/* Quick year nav */}
					{years.length > 1 && (
						<nav className="mb-8 flex flex-wrap gap-2" aria-label="Jump to year">
							{years.map((year) => (
								<a
									key={year}
									href={`#year-${year}`}
									className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-950 dark:hover:text-blue-300"
								>
									{year}{' '}
									<span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">
										({postsByYear[year].length})
									</span>
								</a>
							))}
						</nav>
					)}

					{/* Posts by year */}
					<div className="space-y-12">
						{years.map((year) => (
							<section key={year} id={`year-${year}`}>
								<div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-4 bg-white/90 px-4 py-2 backdrop-blur dark:bg-slate-900/90">
									<h2 className="font-heading text-2xl font-bold text-slate-800 dark:text-slate-100">
										{year}
									</h2>
									<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
										{postsByYear[year].length}{' '}
										{postsByYear[year].length === 1 ? 'article' : 'articles'}
									</span>
									<div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
								</div>
								<ul className="space-y-1">
									{postsByYear[year].map((post) => {
										const date = new Date(post.publishedAt);
										const month = date.toLocaleString('en', { month: 'short' });
										const day = String(date.getDate()).padStart(2, '0');
										return (
											<li key={post.id}>
												<Link
													href={`/${post.slug}`}
													className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
												>
													<time
														dateTime={post.publishedAt}
														className="mt-0.5 w-16 shrink-0 text-xs font-medium tabular-nums text-slate-400 dark:text-slate-500"
													>
														{month} {day}
													</time>
													<span className="leading-snug text-slate-700 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400">
														{post.title}
													</span>
												</Link>
											</li>
										);
									})}
								</ul>
							</section>
						))}
					</div>

					{isLoadingMore && <SitemapPostsSkeleton />}

					{loadMoreError && (
						<p className="mt-6 text-center text-sm text-red-600 dark:text-red-400">
							{loadMoreError}
						</p>
					)}

					{hasMorePosts && (
						<div className="mt-10 flex justify-center">
							<button
								type="button"
								onClick={loadMorePosts}
								disabled={isLoadingMore}
								className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
							>
								{isLoadingMore ? 'Loading posts...' : 'Load more posts'}
							</button>
						</div>
					)}

					{sitemapPosts.length === 0 && (
						<p className="py-16 text-center text-slate-500 dark:text-slate-400">
							No articles found.
						</p>
					)}
				</main>

				<PublicationFooter
					authorName={publication.author.name}
					title={publication.title}
					imprint={publication.imprint}
					disableFooterBranding={publication.preferences.disableFooterBranding}
					isTeam={publication.isTeam}
					logo={publication.preferences.logo}
				/>
			</Layout>
		</AppProvider>
	);
}

export default function SitemapPageWrapper(
	props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
	const router = useRouter();
	return (
		<NextIntlClientProvider
			locale={router.locale}
			messages={props.messages}
			timeZone={getTimezoneFromLocale(router.locale ?? 'en')}
		>
			<SitemapPage {...props} />
		</NextIntlClientProvider>
	);
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
	const { res, locale = 'en' } = ctx;
	res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

	const messages = (await import(`../messages/${locale}.json`)).default;

	const initialData = await request<PostsByPublicationQuery, PostsByPublicationQueryVariables>(
		GQL_ENDPOINT,
		PostsByPublicationDocument,
		{
			host: HASHNODE_PUBLICATION_HOST,
			first: SITEMAP_POSTS_LIMIT,
		},
	);

	const publication = initialData.publication;
	if (!publication) {
		return { notFound: true };
	}

	// Load only the first page of posts so the HTML sitemap can render quickly.
	const posts = sortPostsNewestFirst(
		publication.posts.edges.map((edge) => mapPostToSitemapPost(edge.node)),
	);

	return {
		props: {
			messages,
			publication,
			posts,
			totalPosts: publication.posts.totalDocuments || posts.length,
			initialPageInfo: publication.posts.pageInfo,
		},
	};
};
