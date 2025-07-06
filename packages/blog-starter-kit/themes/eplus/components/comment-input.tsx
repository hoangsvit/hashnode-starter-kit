import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useAddComment } from '../hooks/useAddComment';
import { useAppContext } from './contexts/appContext';
import { useAuth } from '../hooks/useAuth';

interface CommentInputProps {
  onCommentAdded?: () => void;
}

interface MarkdownToolbarProps {
  onFormatText: (formatType: string) => void;
  disabled?: boolean;
}

const MarkdownToolbar = ({ onFormatText, disabled = false }: MarkdownToolbarProps) => {
  const tools = [
    { type: 'bold', icon: 'B', title: 'Bold (Ctrl+B)', className: 'font-bold' },
    { type: 'italic', icon: 'I', title: 'Italic (Ctrl+I)', className: 'italic' },
    { type: 'link', icon: '🔗', title: 'Link (Ctrl+K)' },
    { type: 'code', icon: '</>', title: 'Code (Ctrl+`)' },
    { type: 'quote', icon: '❝', title: 'Quote (Ctrl+Shift+.)' },
    { type: 'list', icon: '•', title: 'List (Ctrl+Shift+L)' },
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
      {tools.map((tool) => (
        <button
          key={tool.type}
          type="button"
          onClick={() => onFormatText(tool.type)}
          disabled={disabled}
          className={`
            flex items-center justify-center w-8 h-8 rounded text-sm transition-colors
            hover:bg-gray-100 dark:hover:bg-gray-700
            disabled:opacity-50 disabled:cursor-not-allowed
            ${tool.className || ''}
          `}
          title={tool.title}
        >
          {tool.icon}
        </button>
      ))}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Markdown supported
      </div>
    </div>
  );
};

export const CommentInput = ({ onCommentAdded }: CommentInputProps) => {
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { addComment, isSubmitting, error } = useAddComment();
  const { post } = useAppContext();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormatText = useCallback((formatType: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = comment.substring(start, end);
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

    const newContent = comment.substring(0, start) + formattedText + comment.substring(end);
    setComment(newContent);

    // Set cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [comment]);

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

    if (!comment.trim() || !post?.id) return;

    const result = await addComment(post.id, comment.trim());

    if (result.success) {
      setComment('');
      setIsExpanded(false);
      setShowPreview(false);
      onCommentAdded?.();
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setComment('');
    setIsExpanded(false);
    setShowPreview(false);
  };

  const renderPreview = () => {
    if (!comment.trim()) {
      return (
        <div className="p-3 text-sm text-gray-500 dark:text-gray-400 italic">
          Nothing to preview
        </div>
      );
    }

    // Simple markdown preview (you can integrate with a proper markdown parser)
    const previewContent = comment
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
          <div className="border rounded-lg border-slate-300 dark:border-slate-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
            {isExpanded && (
              <MarkdownToolbar onFormatText={handleFormatText} disabled={isSubmitting} />
            )}

            {isExpanded && (
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-slate-300 dark:border-slate-600 bg-gray-50 dark:bg-gray-800/50">
                Tip: Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for links
              </div>
            )}

            {isExpanded && (
              <div className="flex border-b border-slate-300 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    !showPreview
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Write
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
                  Preview
                </button>
              </div>
            )}

            {showPreview && isExpanded ? (
              <div className="min-h-[100px]">
                {renderPreview()}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder={t('comments.writeComment')}
                className={`w-full resize-none p-3 text-sm border-none outline-none bg-transparent dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-lg ${
                  isExpanded ? 'min-h-[100px]' : 'min-h-[60px]'
                }`}
                rows={isExpanded ? 4 : 2}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {isExpanded && (
          <div className="flex items-center justify-end">
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
