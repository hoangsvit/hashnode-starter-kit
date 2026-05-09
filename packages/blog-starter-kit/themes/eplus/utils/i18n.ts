import { useRouter } from 'next/router';

/**
 * Utility function to create i18n-aware href
 * @param path - The path to navigate to
 * @param locale - Optional locale, defaults to current locale
 * @returns The correct href for the current locale
 */
export const useI18nHref = () => {
	const router = useRouter();

	const getI18nHref = (path: string, locale?: string) => {
		const currentLocale = locale || router.locale;

		// For default locale (en), return path as-is
		if (currentLocale === 'en') {
			return path;
		}

		// For other locales, prefix with locale
		return `/${currentLocale}${path}`;
	};

	return getI18nHref;
};

/**
 * Helper function to get the correct href for i18n
 * @param path - The path to navigate to
 * @param locale - The locale to use
 * @returns The correct href for the given locale
 */
export const getI18nHref = (path: string, locale: string = 'en') => {
	// For default locale (en), return path as-is
	if (locale === 'en') {
		return path;
	}

	// For other locales, prefix with locale
	return `/${locale}${path}`;
};
