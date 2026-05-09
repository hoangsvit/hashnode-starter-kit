import Head from 'next/head';
import { useTranslations, NextIntlClientProvider } from 'next-intl';
import { twJoin } from 'tailwind-merge';
import { useState } from 'react';
import { useQuery } from 'urql';
import { initUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { useEnvironmentTitle } from '../../hooks/useEnvironmentTitle';

import { AppProvider } from '../../components/contexts/appContext';
import { Header } from '../../components/header';
import { Layout } from '../../components/layout';
import {
	PublicationFragment,
	TagInitialDocument,
	TagInitialQuery,
} from '../../generated/graphql';
import ExternalLinkSVG from '../../components/icons/svgs/ExternalLinkSVG';
import { createHeaders, createSSRExchange, getUrqlClientConfig } from '../../lib/api/client';
import PublicationPosts from '../../components/publication-posts';
import PublicationFooter from '../../components/publication-footer';
import { getTimezoneFromLocale } from '../../utils/timezone';
import { replaceLegacyPublicationUrl } from '../../utils/urls';

const INITIAL_LIMIT = 6;

type Props = {
	posts:  NonNullable<TagInitialQuery['publication']>['posts'];
	publication: PublicationFragment;
	tag: NonNullable<TagInitialQuery['tag']>;
	slug: string;
	currentMenuId: string;
	messages: Record<string, any>;
};

export default function Post({ publication, posts, tag, slug, currentMenuId, messages }: Props) {
	const t = useTranslations();
	const router = useRouter();
	const title = useEnvironmentTitle(`#${tag.name} - ${publication.title}`);
	const publicationUrl = replaceLegacyPublicationUrl(publication.url) || publication.url;
	const tagUrl = `${publicationUrl}/tag/${tag.slug}`;
	const [after, setAfter] = useState<string | null>(null);
	const [{ data, fetching }] = useQuery({
		query: TagInitialDocument,
		variables: { host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST, slug, first: INITIAL_LIMIT, after },
		requestPolicy: 'cache-first',
	});
	const postData = data?.publication?.posts || posts;
	const fetchedOnce = postData.edges.length > INITIAL_LIMIT;

	const fetchMore = () => {
		if (postData.pageInfo.hasNextPage) {
		setAfter(postData.edges[postData.edges.length - 1].cursor);
		}
	};
	return (
		<NextIntlClientProvider
			locale={router.locale}
			messages={messages}
			timeZone={getTimezoneFromLocale(router.locale ?? 'en')}
		>
			<AppProvider publication={publication}>
			<Layout>
				<Head>
					<title>{title}</title>
					<link rel="canonical" href={tagUrl} />
					<meta name="description" content={`${t('tags.postsTagged')} #${tag.name} ${t('common.on')} ${publication.title}. ${t('common.discover')} ${tag.postsCount ?? t('common.various')} ${t('common.posts')} ${t('common.about')} ${tag.name}.`} />

					{/* Basic SEO meta tags */}
					<meta name="keywords" content={`${tag.name}, ${tag.slug}, ${publication.title}, blog, articles`} />
					<meta name="author" content={publication.author.name} />
					<meta name="robots" content="index, follow" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
					<meta name="language" content="en" />

					{/* Open Graph meta tags */}
					<meta property="og:type" content="website" />
					<meta property="og:title" content={title} />
					<meta property="og:description" content={`${t('tags.postsTagged')} #${tag.name} ${t('common.on')} ${publication.title}. ${t('common.discover')} ${tag.postsCount ?? t('common.various')} ${t('common.posts')} ${t('common.about')} ${tag.name}.`} />
					<meta property="og:url" content={tagUrl} />
					<meta property="og:site_name" content={publication.title} />
					<meta property="og:locale" content="en_US" />

					{/* Twitter Card meta tags */}
					<meta property="twitter:card" content="summary" />
					<meta property="twitter:title" content={title} />
					<meta property="twitter:description" content={`${t('tags.postsTagged')} #${tag.name} ${t('common.on')} ${publication.title}. ${t('common.discover')} ${tag.postsCount ?? t('common.various')} ${t('common.posts')} ${t('common.about')} ${tag.name}.`} />

					{/* Additional meta tags */}
					<meta name="theme-color" content="#ffffff" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta name="apple-mobile-web-app-status-bar-style" content="default" />
					<meta name="format-detection" content="telephone=no" />

					{/* Schema.org structured data for tag page */}
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								"@context": "https://schema.org",
								"@type": "WebPage",
								"name": title,
								"description": `${t('common.discover')} ${t('common.posts')} ${t('tags.postsTagged')} #${tag.name} ${t('common.on')} ${publication.title}. ${t('common.discover')} ${tag.postsCount ?? t('common.various')} ${t('common.posts')} ${t('common.aboutTopic')} ${tag.name}.`,
								"url": tagUrl,
								"mainEntity": {
									"@type": "Blog",
									"name": publication.title,
									"description": publication.descriptionSEO || publication.title,
									"url": publicationUrl,
									"author": {
										"@type": publication.isTeam ? "Organization" : "Person",
										"name": publication.author.name
									}
								},
								"breadcrumb": {
									"@type": "BreadcrumbList",
									"itemListElement": [
										{
											"@type": "ListItem",
											"position": 1,
											"name": t('common.home'),
											"item": publicationUrl
										},
										{
											"@type": "ListItem",
											"position": 2,
											"name": `${t('tags.title')}: ${tag.name}`,
											"item": tagUrl
										}
									]
								}
							})
						}}
					/>
				</Head>
				<Header currentMenuId={currentMenuId} isHome={false} />
				<div className={twJoin('blog-content-area feed-width', 'mx-auto md:w-2/3', !!publication.about?.html && 'mt-12')}>
					<div
						className={twJoin(
						'blog-series-card mt-12 mb-16',
						publication.preferences.layout === 'grid' ? 'px-4 lg:px-8' : 'px-4 lg:px-16',
						)}
					>
						<div className="flex w-full min-w-0 flex-col flex-wrap items-center md:flex-row xl:flex-nowrap">
						<div className="mb-5 w-full min-w-0 xl:mb-0 xl:flex-1 xl:pr-8">
							<span className="blog-series-label mb-2 font-semibold uppercase tracking-tight text-slate-600 dark:text-slate-400">
							{t('tags.title')}
							</span>
							<div className="truncate ">
							<h1 className="blog-series-title mb-2 pb-px font-heading text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
								{tag.name}
							</h1>
							<p className="text-lg text-slate-600 dark:text-slate-400">#{tag.slug}</p>
							{Boolean(tag.followersCount || tag.postsCount) && (
								<div className="mt-2 flex gap-4 text-sm text-slate-500 dark:text-slate-400">
									{Boolean(tag.postsCount) && (
										<span>{tag.postsCount} {t('common.posts')}</span>
									)}
									{Boolean(tag.followersCount) && (
										<span>{tag.followersCount} {t('common.followers')}</span>
									)}
								</div>
							)}
							</div>
						</div>
						{tag && (
						<div className="flex w-full flex-col items-start xl:w-auto xl:items-end xl:text-right">
							<a
								className="mb-2 flex flex-row items-center whitespace-nowrap rounded-lg border bg-white px-4 py-2 font-medium text-blue-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
								href={`https://hashnode.com/n/${tag.slug}`}
								aria-label={t('common.seeMoreContent')}
								target="_Blank"
								rel="noopener"
							>
								<span>{t('common.moreContent')}</span>
								<ExternalLinkSVG className="ml-1 h-4 w-4 fill-current" />
							</a>
							<p className="text-sm text-slate-700 dark:text-slate-400">{t('common.readMoreOnHashnode')}</p>
						</div>
						)}
						</div>
					</div>
					{posts.edges.length > 0 ? (
						<>
							<div className="my-10 flex flex-col items-center justify-center">
								<hr className="w-full border-t dark:border-slate-800" />
								<p className="-mt-5 bg-white p-2 font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-400">
									{t('common.articlesWithTag')}
								</p>
							</div>
							<PublicationPosts
								publication={publication}
								posts={postData}
								fetchMore={fetchMore}
								fetchedOnce={fetchedOnce}
								fetching={fetching}
							/>
						</>
					) : (
						<div className="my-10 flex flex-col items-center justify-center text-center">
							<div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-8 max-w-md">
								<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
									{t('common.noArticlesYet')}
								</h3>
								<p className="text-slate-600 dark:text-slate-400 mb-4">
									{t('common.noArticlesWithTag', { tagName: tag.name })}
								</p>
								<a
									href={`https://hashnode.com/n/${tag.slug}`}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
								>
									<span>{t('common.exploreMoreOnHashnode')}</span>
									<ExternalLinkSVG className="w-4 h-4" />
								</a>
							</div>
						</div>
					)}
				</div>
				<PublicationFooter
					authorName={publication.author.name}
					title={publication.title}
					imprint={publication.imprint}
					disableFooterBranding={publication.preferences.disableFooterBranding}
					isTeam={publication.isTeam}
					logo={publication.preferences.logo}
				/>				</Layout>
			</AppProvider>
		</NextIntlClientProvider>
	);
}

export const getServerSideProps: any = async (ctx: any) => { // TODO: type needs to be fixed
  const { req, res, query, locale = 'en' } = ctx;
  const { resolvedUrl } = ctx;
  const [resolvedPath] = resolvedUrl.split('?');
  const { 'x-host': queryHost } = query;
  const ssrCache = createSSRExchange();
  const urqlClient = initUrqlClient(getUrqlClientConfig(ssrCache), false);
  let currentMenu = '';

  // Load messages for the current locale
  const messages = (await import(`../../messages/${locale}.json`)).default;

  const host = (queryHost as string) || req.headers.host!;
  const slug = query.slug as string;

  const { data } = await urqlClient
    .query(
      TagInitialDocument,
      {
		host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
		slug: slug,
		first: INITIAL_LIMIT, after: null
	},
      {
        fetchOptions: {
          headers: createHeaders({ byPassCache: false }),
        },
        requestPolicy: 'network-only',
      },
    )
    .toPromise();

  const { publication, tag } = data || {};

  if (!publication || !tag) {
    return {
      notFound: true,
    };
  }

  const { posts } = publication || {};

  // Cho phép tag page tồn tại ngay cả khi chưa có posts
  // Chỉ check posts tồn tại, không check length
  if (!posts) {
    return {
      notFound: true,
    };
  }

  const menu = publication.preferences.navbarItems || [];
  for (let i = 0; i < menu.length; i++) {
    const menuItem = menu[i];
    if (menuItem.type === 'link') {
      const { pathname, host: menuItemHost } = new URL(menuItem.url!);
      const isLinkOnSameDomain = menuItemHost === host;
      const pathnameMatches = resolvedPath === pathname;
      if (pathnameMatches && isLinkOnSameDomain) {
        currentMenu = menuItem.id!;
        break;
      }
    }
  }

  return {
    props: {
      messages,
      publication,
      posts,
      tag,
	  slug: slug,
	  currentMenuId: currentMenu,
    },
  };
}

