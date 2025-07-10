import * as Tooltip from '@radix-ui/react-tooltip';
import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CommentSVGV2, LoveSVG } from './icons/svgs';
import { kFormatter } from '../utils/image';
import { Separator } from './separator-root';
import PostFloatingBarTooltipWrapper from './post-floating-bar-tooltip-wrapper';
import { PostFullFragment } from '../generated/graphql';
import TocSheet from './toc-sheet';
import PostShareWidget from './post-share-widget';
import { PostMoreActions } from './post-more-actions';


function PostFloatingMenu(props: {
  readonly post: PostFullFragment;
  readonly shareText: string;
  readonly showPaymentModal?: () => void;
  readonly openComments?: () => void;
  readonly openLikers?: () => void;
  readonly list: readonly any[];
}) {
  const {
    post,
    shareText,
    showPaymentModal,
    openComments,
    openLikers,
    list,
  } = props;

  const t = useTranslations();

  const handleFloatingBarDisplay = () => {
    const blogHeader = document.querySelector('.blog-header');
    const blogContent = document.querySelector('#post-content-parent');
    const floatingBar = document.querySelector('.post-floating-bar');

    if (!floatingBar?.classList.contains('freeze')) {
      if (window.scrollY > blogHeader!.clientHeight) {
        floatingBar?.classList.add('active', 'animation');
      } else if (floatingBar?.classList.contains('active')) {
        floatingBar?.classList.remove('active');
      }
    }

    const currentViewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    // Adding 40 as a buffer to adjust the trigger
    const isPostContentBottomInsideViewport = blogContent!.getBoundingClientRect().bottom + 40 <= currentViewportHeight;
    // Adding 175 as a buffer to adjust the trigger
    const isPostContentBottomAlmostOut =
      window.scrollY - currentViewportHeight - 175 <= blogContent!.clientHeight &&
      floatingBar?.classList.contains('freeze');

    if (isPostContentBottomInsideViewport) {
      floatingBar?.classList.remove('active');
      floatingBar?.classList.add('freeze');
    } else if (isPostContentBottomAlmostOut) {
      floatingBar?.classList.remove('freeze', 'animation');
      floatingBar?.classList.add('active');
    }
  };

  useEffect(() => {
    handleFloatingBarDisplay();
    window.addEventListener('scroll', handleFloatingBarDisplay);
    return () => {
      window.removeEventListener('scroll', handleFloatingBarDisplay);
    };
  }, []);

  // Best practice to have the accessible name being with the visible text (comment count)
  const commentBtnAccessibleLabel = useMemo(() => {
    const commentCount = post?.responseCount + (post?.replyCount || 0);
    if (commentCount > 0) {
      return `${kFormatter(commentCount)} ${commentCount === 1 ? t('common.comment') : t('common.comments')}, ${t('common.openComments')}`;
    }
    return t('common.openComments');
  }, [post?.responseCount, post?.replyCount, t]);

  return (
    <Tooltip.Provider delayDuration={200}>
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `.post-floating-bar {
              bottom: -60px;
            }
            .post-floating-bar.animation {
              -webkit-transition: .2s all;
              -o-transition: .2s all;
              transition: .2s all;
              transition-timing-function: ease-in;
            }
            .post-floating-bar.active {
              bottom: 40px
            }
            .post-floating-bar.freeze {
              bottom: 0!important;
              position: absolute!important;
              transition: none!important;
            }
            .post-floating-bar.freeze > div {
              box-shadow: none!important;
            }
            `,
        }}
      />
      <div className="post-floating-bar fixed left-0 right-0 z-50 flex h-12 w-full flex-wrap justify-center 2xl:h-14">
        <div className="relative mx-auto flex h-12 shrink flex-wrap items-center justify-center rounded-full border-1/2 border-slate-200 bg-white px-5 py-1 text-sm  text-slate-800 shadow-xl dark:border-slate-500 dark:bg-slate-700 dark:text-slate-50 2xl:h-14">
          <PostFloatingBarTooltipWrapper label={t('common.likeThisPost')}>
            {post && (
              <div>
                <button
                  type="button"
                  onClick={showPaymentModal}
                  aria-label={t('common.likeThisPost')}
                  className="outline-none! flex cursor-pointer items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="rounded-full p-2">
                    <LoveSVG className="h-4 w-4 stroke-current text-slate-800 dark:text-slate-50 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
                  </span>
                  {(post?.reactionCount > 0 || (post?.likedBy && post.likedBy.totalDocuments > 0)) && (
                    <PostFloatingBarTooltipWrapper label={t('common.openLikers')}>
                      <span
                        className="ml-0.5 pr-2 cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openLikers) {
                            openLikers();
                          }
                        }}
                      >
                        {kFormatter(post.reactionCount || post?.likedBy?.totalDocuments || 0)}
                      </span>
                    </PostFloatingBarTooltipWrapper>
                  )}
                </button>
              </div>
            )}
          </PostFloatingBarTooltipWrapper>

          <Separator className="mx-2 h-5" />

          <PostFloatingBarTooltipWrapper label={t('common.writeComment')}>
            {post && (
              <div>
                <button
                  type="button"
                  onClick={openComments}
                  aria-label={commentBtnAccessibleLabel}
                  className="outline-none! flex cursor-pointer items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="rounded-full p-2">
                    <CommentSVGV2 className="h-4 w-4 stroke-current text-slate-800 dark:text-slate-50 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6" />
                  </span>
                  {post?.responseCount > 0 && (
                    <span className="ml-0.5 pr-2">{kFormatter(post.responseCount + (post.replyCount || 0))}</span>
                  )}
                </button>
              </div>
            )}
          </PostFloatingBarTooltipWrapper>

          <Separator className="mx-2 h-5" />

          {post && post.features.tableOfContents.isEnabled && (
            <>
              <TocSheet list={list.slice()} />
              <Separator className="mx-2 h-5" />
            </>
          )}

          <PostShareWidget post={post} shareText={shareText} />
          
          <Separator className="mx-2 h-5" />
          
          <PostMoreActions post={post} isCompact={true} />
        </div>
      </div>
    </Tooltip.Provider>
  );
}

export default PostFloatingMenu;
