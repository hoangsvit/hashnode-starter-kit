import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '../hooks/useAuth';
import { UserAvatar } from './user-avatar';
import { useAddReply } from '../hooks/useAddReply';

interface ReplyInputProps {
  commentId: string;
  onReplyAdded?: (newReply?: any) => void;
  onCancel?: () => void;
}

export const ReplyInput = ({ commentId, onReplyAdded, onCancel }: ReplyInputProps) => {
  const [content, setContent] = useState('');
  const { addReply, isSubmitting, error, setError } = useAddReply();
  const { user } = useAuth();
  const t = useTranslations();

  // Don't render if user is not authenticated
  if (!user) {
    return (
      <div className="mt-3 ml-8">
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>
            {t('auth.loginRequired') || 'Please'}{' '}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium"
            >
              {t('auth.login') || 'login'}
            </a>{' '}
            {t('auth.toReply') || 'to reply'}
          </span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Reply content cannot be empty');
      return;
    }

    try {
      const newReply = await addReply(commentId, content.trim());
      setContent('');
      onReplyAdded?.(newReply);
    } catch (err) {
      // Error is already handled by the hook, just continue
      console.error('Reply submission failed:', err);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError(null);
    onCancel?.();
  };

  return (
    <div className="mt-3 ml-8">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <UserAvatar user={user} size="sm" />
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="border rounded-lg border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('comments.writeReply') || 'Write a reply...'}
                className="w-full min-h-[80px] p-3 resize-y border-none outline-none bg-transparent dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg"
                disabled={isSubmitting}
              />
              {error && (
                <div className="px-3 pb-2 text-red-500 text-sm">
                  {error}
                </div>
              )}
              <div className="flex items-center justify-between p-3 pt-0">
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    disabled={isSubmitting || !content.trim()}
                  >
                    {isSubmitting ? (t('comments.posting') || 'Posting...') : (t('comments.reply') || 'Reply')}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
