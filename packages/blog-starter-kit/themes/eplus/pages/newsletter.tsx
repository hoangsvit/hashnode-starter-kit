import CustomImage from '../components/custom-image';
import PublicationSubscribeStandOut from '../components/publication-subscribe-standout';
import { resizeImage } from '../utils/image';
import { AppProvider } from '../components/contexts/appContext';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import styles from '../styles/newsletter.module.css';

import BlogPostPreview from '../components/magazine-blog-post-preview';
import {
  NewsletterDocument,
  NewsletterQueryVariables,
  PostThumbnailFragment,
  PublicationFragment,
} from '../generated/graphql';
import { createHeaders, createSSRExchange, getUrqlClientConfig } from '../lib/api/client';
import { GetServerSideProps } from 'next';
import { log as _log } from 'next-axiom';
import { initUrqlClient } from 'next-urql';
import { Header } from '../components/header';
import PublicationFooter from '../components/publication-footer';

type Props = {
  publication: PublicationFragment;
  recent3Posts: PostThumbnailFragment[];
  currentMenuId: string;
  messages: Record<string, any>;
}

const Newsletter = (props: Props) => {
  const { recent3Posts, publication, currentMenuId, messages } = props;
  const router = useRouter();
  const t = useTranslations('common');

  const profile = publication.author;

  const recentPosts = recent3Posts.map((post: any) => (
    <BlogPostPreview key={post.id} post={post} publication={publication} />
  ));
  const originalImageSrc =
    publication.favicon ||
    profile?.profilePicture ||
    'https://cdn.hashnode.com/res/hashnode/image/upload/v1600792675173/rY-APy9Fc.png';

  const publicationImageUrl = resizeImage(originalImageSrc, { w: 400, h: 400, c: 'face' });

  return (
    <NextIntlClientProvider
      locale={router.locale}
      messages={messages}
      timeZone="Asia/Ho_Chi_Minh"
    >
      <div className={`${styles.newsletterPage} min-h-screen transition-colors duration-300`}>
        <AppProvider publication={publication}>
          <Header currentMenuId={currentMenuId} isHome={false}/>
          <div className="blog-page-area mx-auto min-h-screen px-4 pb-8 pt-20 md:px-10 md:pt-20">
            <div className={`${styles.newsletterCard} blog-page-card container relative z-30 mx-auto grid grid-flow-row grid-cols-8 pb-0 2xl:grid-cols-10`}>
              <div className="col-span-full">
                <span className={`${styles.profileImage} mx-auto -mb-10 block h-32 w-32 overflow-hidden border-4 border-white dark:border-slate-700`}>
                  <CustomImage
                    originalSrc={originalImageSrc}
                    src={publicationImageUrl}
                    alt={publication.title || profile?.name}
                    className="block w-full"
                    width={400}
                    height={400}
                    priority
                    layout="responsive"
                  />
                </span>
                <PublicationSubscribeStandOut />
              </div>
            </div>
            {recent3Posts && recent3Posts.length > 0 && (
              <>
                <div className="blog-more-articles mt-10">
                  <h3 className="mb-3 text-center font-heading text-xl font-bold text-slate-900 dark:text-slate-50">
                    {t('moreContent')}
                  </h3>
                </div>
                <div className={`${styles.articlesGrid} container mx-auto px-4 xl:px-10 2xl:px-24`}>
                  {recentPosts}
                </div>
              </>
            )}
          </div>
          {publication ? (
            <PublicationFooter
              authorName={publication.author.name}
              title={publication.title}
              imprint={publication.imprint}
              disableFooterBranding={publication.preferences.disableFooterBranding}
              isTeam={publication.isTeam}
              logo={publication.preferences.logo}
            />
            ) : null}
        </AppProvider>
      </div>
    </NextIntlClientProvider>
  );
};

export const getServerSideProps: GetServerSideProps<{
  publication: PublicationFragment;
  recent3Posts: PostThumbnailFragment[];
}> = async (ctx) => {
  const { res, locale = 'en' } = ctx;
  const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;
  const log = _log.with({ host });

  // Load messages for the current locale
  const messages = (await import(`../messages/${locale}.json`)).default;

  const ssrCache = createSSRExchange();
  const urqlClient = initUrqlClient(getUrqlClientConfig(ssrCache), false);

  const gqlVariables: NewsletterQueryVariables = {
    host,
    slug: 'newsletter',
  };
  const publicationInfo = await urqlClient
    .query(NewsletterDocument, gqlVariables, {
      fetchOptions: {
        headers: createHeaders(),
      },
      requestPolicy: 'network-only',
    })
    .toPromise();

  if (publicationInfo.error) {
    log.error('Error while fetching publication info', {
      variables: gqlVariables,
      error: publicationInfo.error,
    });
    throw publicationInfo.error;
  }
  if (!publicationInfo.data?.publication) {
    log.error('Publication not found fetching publication info; returning 404', {
      variables: gqlVariables,
    });
    res.setHeader('cache-control', 's-maxage=3, stale-while-revalidate');
    return {
      notFound: true,
    };
  }

  const { publication } = publicationInfo.data;

  if (!publication.preferences.enabledPages?.newsletter) {
    return {
      notFound: true,
    };
  }

  if (process.env.PREVIEW_MODE) {
    res.setHeader('cache-control', 'no-cache');
  }

  res.setHeader('Cache-Control', 's-maxage=3, stale-while-revalidate');

  return {
    props: {
      publication,
      recent3Posts: publication.recentPosts.edges.map((edge) => edge.node),
      currentMenuId: 'newsletter',
      messages,
    },
  };
};

export default Newsletter;
