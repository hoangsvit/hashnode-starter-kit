import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useTranslations } from 'next-intl';
import { initUrqlClient } from 'next-urql';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { twJoin, twMerge } from 'tailwind-merge';
import { useQuery } from 'urql';

import { AppProvider } from '../components/contexts/appContext';
import CustomImage from '../components/custom-image';
import { Header } from '../components/header';
import Button from '../components/hn-button';
import CloseSVG from '../components/icons/svgs/CloseSVG';
import RefreshSVG from '../components/icons/svgs/RefreshSVG';
import SearchSVG from '../components/icons/svgs/SearchSvg';
import { Layout } from '../components/layout';
import PublicationFooter from '../components/publication-footer';
import { PublicationByHostDocument, SearchPostsOfPublicationDocument } from '../generated/graphql';
import { useEnvironmentTitle } from '../hooks/useEnvironmentTitle';
import { createHeaders, createSSRExchange, getUrqlClientConfig } from '../lib/api/client';
import { blurImageDimensions } from '../utils/const/images';
import { inputText } from '../utils/const/styles';
import { getBlurHash, resizeImage } from '../utils/image';
import { replaceLegacyPublicationUrl } from '../utils/urls';

dayjs.extend(localizedFormat);

const POSTS_PER_PAGE = 10;


export default function SearchPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { publication, initialQuery = '' } = props;
	const router = useRouter();
	const t = useTranslations();
	const [searchKey, setSearchKey] = useState(initialQuery);
	const [inputValue, setInputValue] = useState(initialQuery);
	const [after, setAfter] = useState<string | null>(null);
	const debounceRef = useRef<number | null>(null);

	const normalizedSearchKey = searchKey.trim();
	const publicationTitle = publication.displayTitle || publication.title || 'Hashnode Blog';
	const normalizedPublicationUrl = replaceLegacyPublicationUrl(publication.url || '').replace(
		/\/$/,
		'',
	);
	const searchPageUrl = `${normalizedPublicationUrl}/search`;

	const searchTitle = useEnvironmentTitle(
		normalizedSearchKey.length > 0
			? `${t('search.results')}: ${normalizedSearchKey} - ${publicationTitle}`
			: `${t('search.results')} - ${publicationTitle}`,
	);

	const searchDescription =
		normalizedSearchKey.length > 0
			? `${t('search.results')} for "${normalizedSearchKey}" on ${publicationTitle}`
			: t('search.placeholder');

	useEffect(() => {
		if (!router.isReady) return;
		const q = router.query.q;
		const value = Array.isArray(q) ? q[0] : q || '';
		// When the query param changes (e.g. navigation/back/forward),
		// reset the pagination cursor so we don't continue from an
		// old `after` value and accidentally skip initial results.
		setAfter(null);
		setSearchKey(value);
		setInputValue(value);
		// clear any pending debounced update when navigation occurs
		if (debounceRef.current) {
			window.clearTimeout(debounceRef.current);
			debounceRef.current = null;
		}
	}, [router.isReady, router.query.q]);

	const [{ data, fetching }] = useQuery({
		query: SearchPostsOfPublicationDocument,
		variables: {
			first: normalizedSearchKey.length > 0 ? POSTS_PER_PAGE : 0,
			after,
			filter: {
				publicationId: publication.id,
				query: searchKey,
			},
		},
		pause: normalizedSearchKey.length === 0,
	});

	const results = data?.searchPostsOfPublication;

	const applySearch = (value: string) => {
		setAfter(null);
		setSearchKey(value);

		const nextQuery = value.trim();
		router.replace(
			{
				pathname: '/search',
				query: nextQuery ? { q: nextQuery } : {},
			},
			undefined,
			{ shallow: true },
		);
	};

	const handleKeywordChange = (value: string) => {
		setInputValue(value);
		if (debounceRef.current) {
			window.clearTimeout(debounceRef.current);
		}
		// debounce applying the search to avoid frequent router.replace and queries
		// (300ms matches `publication-search` behavior)
		// store numeric id returned by setTimeout
		debounceRef.current = window.setTimeout(() => {
			applySearch(value);
			debounceRef.current = null;
		}, 300);
	};

	useEffect(() => {
		return () => {
			if (debounceRef.current) window.clearTimeout(debounceRef.current);
		};
	}, []);

	const clearResults = () => {
		setAfter(null);
		setSearchKey('');
		setInputValue('');
		if (debounceRef.current) {
			window.clearTimeout(debounceRef.current);
			debounceRef.current = null;
		}
		router.replace('/search', undefined, { shallow: true });
	};

	const isInputEmpty = normalizedSearchKey.length === 0;
	const hasResults = !!results?.edges?.length;
	const isResultEmpty = !isInputEmpty && !hasResults && !fetching;

	const loadMore = () => {
		if (!results?.pageInfo?.hasNextPage || !results?.pageInfo?.endCursor) return;
		setAfter(results.pageInfo.endCursor);
	};

	const renderedResults = useMemo(() => {
		if (!results?.edges) return [];
		return results.edges;
	}, [results?.edges]);

	return (
		<AppProvider publication={publication}>
			<Layout>
				<Head>
					<title>{searchTitle}</title>
					<meta name="description" content={searchDescription} />
					<meta name="robots" content="noindex,follow" />
					<link rel="canonical" href={searchPageUrl} />
					<meta property="og:title" content={searchTitle} />
					<meta property="og:description" content={searchDescription} />
					<meta property="og:url" content={searchPageUrl} />
					<meta property="og:type" content="website" />
					<meta property="twitter:title" content={searchTitle} />
					<meta property="twitter:description" content={searchDescription} />
				</Head>
				<Header isHome={false} />
				<main className="container mx-auto max-w-5xl px-4 py-8">
					<h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
						{t('search.results')}
					</h1>
					<div className="relative mb-8 w-full">
						<input
							value={inputValue}
							onChange={(e) => handleKeywordChange(e.target.value)}
							type="text"
							className={twMerge(inputText, 'rounded-full px-6 py-3')}
							placeholder={
								fetching
									? t('search.placeholder').replace('...', t('loading'))
									: t('search.placeholder')
							}
						/>
						{fetching ? (
							<RefreshSVG className="animate-hn-spin absolute bottom-0 right-0 top-0 my-auto mr-16 h-5 w-5 fill-current text-slate-500 dark:text-slate-200" />
						) : null}
						{!isInputEmpty ? (
							<button
								aria-label={t('search.clearResults')}
								type="button"
								className="absolute bottom-1/2 right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-slate-100 focus:bg-slate-100 focus:outline-none dark:hover:bg-slate-800 dark:focus:bg-slate-800"
								onClick={clearResults}
							>
								<CloseSVG className="h-5 w-5 fill-current text-slate-500 dark:text-slate-200" />
							</button>
						) : null}
					</div>

					{isInputEmpty && (
						<div className="my-6 flex items-center justify-center text-slate-500 dark:text-slate-300">
							<SearchSVG className="mr-2.5 h-5 w-5 stroke-current" />
							<p>{t('search.placeholder')}</p>
						</div>
					)}

					{isResultEmpty && (
						<div className="my-6 flex items-center justify-center text-slate-500 dark:text-slate-300">
							<SearchSVG className="mr-2.5 h-5 w-5 stroke-current" />
							<p>{t('search.noResults')}</p>
						</div>
					)}

					<div className="space-y-4">
						{renderedResults.map((item) => {
							const post = item.node;
							const postURL = replaceLegacyPublicationUrl(post.url) || post.url || '#';
							const pubOrigin = replaceLegacyPublicationUrl(post.publication?.url || '')
								.replace('https://', '')
								.replace('http://', '');

							return (
								<a
									key={post.id}
									href={postURL}
									className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/70"
								>
									<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
										<div className="md:mr-4">
											<h2 className="mb-2 text-2xl font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100">
												{post.title}
											</h2>
											<div className="mb-3 flex flex-row flex-wrap items-center font-medium text-slate-500 dark:text-slate-400">
												<p className="inline-block">{post?.author?.name || 'Anonymous'}</p>
												<span className="mx-2 inline-block font-bold opacity-50">&middot;</span>
												<p className="inline-block">{pubOrigin}</p>
											</div>
											<div className="flex flex-row items-center text-slate-500 dark:text-slate-400">
												<p className="inline-block">{dayjs(post.publishedAt).format('LL')}</p>
												{post.reactionCount > 0 && (
													<>
														<span className="mx-2 inline-block font-bold opacity-50">&middot;</span>
														<p className="inline-block">
															{post.reactionCount} {post.reactionCount === 1 ? t('views').slice(0, -1) : t('views')}
														</p>
													</>
												)}
											</div>
										</div>

										<div
											className={twJoin(
												'w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 md:w-56 dark:bg-slate-900',
												post.coverImage && post.coverImage.url.includes('cdn.hashnode.com')
													? 'border dark:border-slate-800'
													: '',
											)}
										>
											{post.coverImage && post.coverImage.url.includes('cdn.hashnode.com') ? (
												<CustomImage
													originalSrc={post.coverImage.url}
													src={resizeImage(post.coverImage.url, { w: 1600, h: 840, c: 'thumb' })}
													width={800}
													height={420}
													layout="responsive"
													objectFit="contain"
													blurDataURL={getBlurHash(
														resizeImage(post.coverImage.url, {
															...blurImageDimensions,
															c: 'thumb',
														}),
													)}
													alt={post.title}
												/>
											) : null}
										</div>
									</div>
								</a>
							);
						})}
					</div>

					{!fetching && results?.pageInfo?.hasNextPage ? (
						<div className="mt-8 flex justify-center">
							<Button variant="primary" onClick={loadMore}>
								{t('archive.loadMorePosts')}
							</Button>
						</div>
					) : null}
				</main>
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
	);
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
	const { locale = 'en' } = context;
	// Extract `q` from the incoming request so the page can render
	// correctly on the server with the initial search query.
	const q = context.query.q;
	const initialQuery = Array.isArray(q) ? q[0] : q || '';
	const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;
	const messages = (await import(`../messages/${locale}.json`)).default;

	const ssrCache = createSSRExchange();
	const urqlClient = initUrqlClient(getUrqlClientConfig(ssrCache), false);

	const publicationRes = await urqlClient
		.query(
			PublicationByHostDocument,
			{ host },
			{
				fetchOptions: { headers: createHeaders({ byPassCache: false }) },
				requestPolicy: 'network-only',
			},
		)
		.toPromise();
	if (publicationRes.error) {
		console.error('Error while fetching publication', {
			variables: { host },
			error: publicationRes.error,
		});
		throw publicationRes.error;
	}
	if (!publicationRes.data?.publication) {
		console.error('Publication not found fetching publication; returning 404', {
			variables: { host },
		});
		return { notFound: true };
	}

	return {
		props: {
			messages,
			publication: publicationRes.data.publication,
			initialQuery,
		},
	};
};
