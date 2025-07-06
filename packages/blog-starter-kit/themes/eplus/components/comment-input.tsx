import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useAddComment } from '../hooks/useAddComment';
import { useAppContext } from './contexts/appContext';
import { useAuth } from '../hooks/useAuth';

interface CommentInputProps {
  onCommentAdded?: () => void;
}

export const CommentInput = ({ onCommentAdded }: CommentInputProps) => {
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { addComment, isSubmitting, error } = useAddComment();
  const { post } = useAppContext();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim() || !post?.id) return;

    const result = await addComment(post.id, comment.trim());

    if (result.success) {
      setComment('');
      setIsExpanded(false);
      onCommentAdded?.();
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setComment('');
    setIsExpanded(false);
  };

  const handleLogin = () => {
    const currentUrl = router.asPath;
    router.push(`/identity?next=${encodeURIComponent(currentUrl)}`);
  };

  // Show login prompt if user is not authenticated
  if (isLoading) {
    return (
      <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('comments.checkingAuth')}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="mb-4 text-center">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              {t('comments.loginRequired')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('comments.loginToComment')}
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {t('comments.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={handleFocus}
            placeholder={t('comments.writeComment')}
            className={`w-full resize-none rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 ${
              isExpanded ? 'min-h-[100px]' : 'min-h-[60px]'
            }`}
            rows={isExpanded ? 4 : 2}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {isExpanded && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t('comments.markdownSupported')}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isSubmitting ? t('common.posting') : t('common.postComment')}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
