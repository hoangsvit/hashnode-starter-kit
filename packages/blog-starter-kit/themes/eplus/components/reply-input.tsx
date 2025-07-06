import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '../hooks/useAuth';
import { UserAvatar } from './user-avatar';
import { useAddReply } from '../hooks/useAddReply';
import { MarkdownToolbar } from './markdown-toolbar';

interface ReplyInputProps {
  commentId: string;
  onReplyAdded?: (newReply?: any) => void;
  onCancel?: () => void;
}

export const ReplyInput = ({ commentId, onReplyAdded, onCancel }: ReplyInputProps) => {
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const { addReply, isSubmitting, error, setError } = useAddReply();
  const { user } = useAuth();
  const t = useTranslations();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormatText = useCallback((formatType: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';
    let newCursorPos = start;

    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        newCursorPos = selectedText ? start + formattedText.length : start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        newCursorPos = selectedText ? start + formattedText.length : start + 1;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](url)`;
        newCursorPos = selectedText ? start + formattedText.length - 4 : start + 1;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        newCursorPos = selectedText ? start + formattedText.length : start + 1;
        break;
      case 'quote':
        formattedText = `> ${selectedText || 'quote'}`;
        newCursorPos = selectedText ? start + formattedText.length : start + 2;
        break;
      case 'list':
        formattedText = `- ${selectedText || 'list item'}`;
        newCursorPos = selectedText ? start + formattedText.length : start + 2;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // Set cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleFormatText('bold');
          break;
        case 'i':
          e.preventDefault();
          handleFormatText('italic');
          break;
        case 'k':
          e.preventDefault();
          handleFormatText('link');
          break;
        case '`':
          e.preventDefault();
          handleFormatText('code');
          break;
        case '.':
          if (e.shiftKey) {
            e.preventDefault();
            handleFormatText('quote');
          }
          break;
        case 'l':
          if (e.shiftKey) {
            e.preventDefault();
            handleFormatText('list');
          }
          break;
      }
    }
  }, [handleFormatText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Reply content cannot be empty');
      return;
    }

    try {
      const newReply = await addReply(commentId, content.trim());
      setContent('');
      setShowPreview(false);
      onReplyAdded?.(newReply);
    } catch (err) {
      // Error is already handled by the hook, just continue
      console.error('Reply submission failed:', err);
    }
  };

  const handleCancel = () => {
    setContent('');
    setShowPreview(false);
    setError(null);
    onCancel?.();
  };

  const renderPreview = () => {
    if (!content.trim()) {
      return (
        <div className="p-3 text-sm text-gray-500 dark:text-gray-400 italic">
          {t('comments.nothingToPreview') || 'Nothing to preview'}
        </div>
      );
    }

    // Simple markdown preview (you can integrate with a proper markdown parser)
    const previewContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');

    return (
      <div
        className="p-3 prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: previewContent }}
      />
    );
  };

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

  return (
    <div className="mt-3 ml-8">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <UserAvatar user={user} size="sm" />
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="border rounded-lg border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <MarkdownToolbar onFormatText={handleFormatText} disabled={isSubmitting} />

              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {t('comments.markdownTip') || 'Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for links'}
              </div>

              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    !showPreview
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {t('comments.write') || 'Write'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    showPreview
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {t('comments.preview') || 'Preview'}
                </button>
              </div>

              {showPreview ? (
                <div className="min-h-[80px]">
                  {renderPreview()}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('comments.writeReply') || 'Write a reply...'}
                  className="w-full min-h-[80px] p-3 resize-y border-none outline-none bg-transparent dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg"
                  disabled={isSubmitting}
                />
              )}

              {error && (
                <div className="px-3 pb-2 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div className="p-3 pt-0">
                <div className="flex justify-end">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      {t('comments.cancel') || 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                      disabled={isSubmitting || !content.trim()}
                    >
                      {isSubmitting ? (t('comments.posting') || 'Posting...') : (t('comments.reply') || 'Reply')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
