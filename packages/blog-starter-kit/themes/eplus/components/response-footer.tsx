import { useState, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';

import ResponseReplyCard from './response-reply-card';
import { CommentSVGV2 } from './icons/svgs';
import { ReplyInput } from './reply-input';
import { LikeButton } from './like-button';
import { useAuth } from '../hooks/useAuth';

interface Props {
  isPublicationPost: boolean;
  response: any; // Accept any comment type (could be GraphQL Comment or old Response type)
  draftId?: string;
  isValidating?: boolean;
}

const ResponseFooter = memo(function ResponseFooter(props: Props) {
  const { isPublicationPost, response, draftId, isValidating = false } = props;
  const [repliesToShow, setRepliesToShow] = useState(1);
  const [hideShowAllBox, setHideShowAllBox] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [newReplies, setNewReplies] = useState<any[]>([]);
  const { user } = useAuth();
  const t = useTranslations();

  const totalReplies = response.replies.edges.length + newReplies.length;

  const showAllReplies = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setRepliesToShow(totalReplies);
    setHideShowAllBox(true);
  }, [totalReplies]);

  const hideAllReplies = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setRepliesToShow(1);
    setHideShowAllBox(false);
  }, []);

  const toggleAllReplies = useCallback((e: React.MouseEvent) => {
    if (totalReplies > 1) {
      if (!hideShowAllBox) {
        showAllReplies(e);
      } else {
        hideAllReplies(e);
      }
    }
  }, [totalReplies, hideShowAllBox, showAllReplies, hideAllReplies]);

  const handleReplyClick = useCallback(() => {
    setShowReplyInput(!showReplyInput);
  }, [showReplyInput]);

  const handleReplyAdded = useCallback((newReply?: any) => {
    setShowReplyInput(false);
    if (newReply) {
      // Add the new reply to local state
      setNewReplies(prev => [...prev, newReply]);
      // Show all replies including the new one
      setRepliesToShow(totalReplies + 1);
      setHideShowAllBox(false);
    }
  }, [totalReplies]);

  const handleReplyCancel = useCallback(() => {
    setShowReplyInput(false);
  }, []);

  // Combine existing replies with new replies
  const allReplies = [...response.replies.edges, ...newReplies.map(reply => ({ node: reply }))];
  const repliesToDisplay = allReplies.slice(-1 * repliesToShow);

  const replies = repliesToDisplay.map((reply: any) => (
    <div key={reply.node.id.toString()}>
      <div className="my-1.5 ml-3.5 h-6 w-px border dark:border-slate-600" />
      <ResponseReplyCard
        draftId={draftId}
        isPublicationPost={isPublicationPost}
        key={reply.node.id.toString()}
        response={response}
        reply={reply.node}
        isValidating={isValidating}
      />
    </div>
  ));

  return (
    <div className="w-full">
      <div className="flex flex-row flex-nowrap items-center gap-4">
        {/* Like Button */}
        <LikeButton
          commentId={response.id}
          initialLikeCount={response.totalReactions ?? 0}
          isLiked={response.myTotalReactions > 0}
        />

        {/* Combined Button - Show replies count and Reply action */}
        <button
          type="button"
          onClick={user ? handleReplyClick : undefined}
          disabled={!user}
          className="flex items-center gap-1 px-2 py-1 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300"
          aria-label={user ? (t('comments.reply') || 'Reply to comment') : (t('auth.loginToReply') || 'Login to reply')}
          title={!user ? (t('auth.loginToReply') || 'Login to reply') : undefined}
        >
          <CommentSVGV2 className="h-4 w-4 stroke-current" />
          <span className="font-medium">
            {totalReplies > 0 ? `${totalReplies} • ` : ''}
            {t('comments.reply') || 'Reply'}
          </span>
        </button>

        {/* Show/Hide all replies button - only show when there are multiple replies */}
        {totalReplies > 1 && (
          <button
            type="button"
            onClick={toggleAllReplies}
            className="text-sm text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors duration-200"
            aria-label={hideShowAllBox ? (t('comments.hideReplies') || 'Hide replies') : (t('comments.showAllReplies') || 'Show all') + ` ${totalReplies} ` + (t('comments.replies') || 'replies')}
          >
            <span className="font-medium">
              {hideShowAllBox ? (t('comments.hideReplies') || 'Hide replies') : (t('comments.showAllReplies') || 'Show all') + ` ${totalReplies} ` + (t('comments.replies') || 'replies')}
            </span>
          </button>
        )}
      </div>

      {totalReplies > 0 && (
        <div className="ml-3 min-w-0">
          {replies}
          {totalReplies > 1 && !hideShowAllBox && (
            <button
              type="button"
              onClick={showAllReplies}
              className="flex py-2 text-sm text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors duration-200"
              aria-label={t('comments.showMoreReplies') || 'Show more replies'}
            >
              <span className="font-medium">{t('comments.showMoreReplies') || 'Show more replies'}</span>
            </button>
          )}
        </div>
      )}

      {/* Reply Input */}
      {showReplyInput && (
        <ReplyInput
          commentId={response.id}
          onReplyAdded={handleReplyAdded}
          onCancel={handleReplyCancel}
        />
      )}
    </div>
  );
});

export default ResponseFooter;
