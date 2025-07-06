import { useTranslations } from 'next-intl';

interface MarkdownToolbarProps {
  onFormatText: (formatType: string) => void;
  disabled?: boolean;
}

export const MarkdownToolbar = ({ onFormatText, disabled = false }: MarkdownToolbarProps) => {
  const t = useTranslations();
  
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
        {t('comments.markdownSupported') || 'Markdown supported'}
      </div>
    </div>
  );
};
