import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { ChevronDownSVG } from './icons/svgs';
import { Fragment, useState, useCallback, useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

export const LanguageSwitcher = () => {
  const router = useRouter();
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Reset trạng thái loading khi route thay đổi hoàn tất
  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setIsChanging(false);
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  const handleLanguageChange = useCallback(async (newLocale: string) => {
    if (newLocale === router.locale) return; // Tránh reload không cần thiết

    setIsChanging(true);
    setIsOpen(false);

    try {
      // Sử dụng pathname và query để đảm bảo routing chính xác
      const { pathname, query, asPath } = router;

      console.log('Language change:', {
        currentLocale: router.locale,
        newLocale,
        pathname,
        query,
        asPath
      });

      // Sử dụng router.push với locale option để Next.js xử lý i18n routing
      await router.push(
        {
          pathname,
          query,
        },
        asPath,
        {
          locale: newLocale,
          scroll: false // Giữ nguyên scroll position
        }
      );

    } catch (error) {
      console.error('Error changing language:', error);
      setIsChanging(false);
    }
  }, [router]);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const currentLanguage = languages.find(lang => lang.code === router.locale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        disabled={isChanging}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md transition-colors ${
          isChanging
            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
            : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        aria-label={t('switchLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isChanging ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
            <span className="hidden sm:inline">{t('switchLanguage')}...</span>
          </>
        ) : (
          <>
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="hidden sm:inline">{currentLanguage.name}</span>
            <ChevronDownSVG className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && !isChanging && (
        <Fragment>
          <div
            className="fixed inset-0 z-10"
            onClick={closeDropdown}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    language.code === router.locale
                      ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-lg mr-3">{language.flag}</span>
                  <span>{language.name}</span>
                  {language.code === router.locale && (
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
};
