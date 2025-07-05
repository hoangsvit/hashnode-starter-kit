import moment from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/hi';
import 'dayjs/locale/ja';
import 'dayjs/locale/vi';
import 'dayjs/locale/zh';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

moment.extend(localizedFormat);
moment.extend(relativeTime);

// Supported locales type
type SupportedLocale = 'en' | 'vi' | 'ja' | 'es' | 'fr' | 'zh' | 'hi';

// Date format types
type DateFormatType = 'short' | 'long' | 'localized';
type DateFormatKey = DateFormatType | 'withTime' | 'tooltip';

// Locale-specific date formats
const DATE_FORMATS: Record<SupportedLocale, Record<DateFormatKey, string>> = {
	en: {
		short: 'MMM D, YYYY',
		long: 'MMMM D, YYYY',
		withTime: 'MMM D, YYYY [at] h:mm A',
		tooltip: 'dddd, MMMM D, YYYY [at] h:mm A',
		localized: 'll', // Uses dayjs localized format
	},
	vi: {
		short: 'DD/MM/YYYY',
		long: 'DD MMMM, YYYY',
		withTime: 'DD/MM/YYYY [lúc] HH:mm',
		tooltip: 'dddd, DD MMMM, YYYY [lúc] HH:mm',
		localized: 'll', // Uses dayjs localized format
	},
	ja: {
		short: 'YYYY年MM月DD日',
		long: 'YYYY年MM月DD日',
		withTime: 'YYYY年MM月DD日 HH:mm',
		tooltip: 'dddd, YYYY年MM月DD日 HH:mm',
		localized: 'll', // Uses dayjs localized format
	},
	es: {
		short: 'DD/MM/YYYY',
		long: 'DD [de] MMMM [de] YYYY',
		withTime: 'DD/MM/YYYY [a las] HH:mm',
		tooltip: 'dddd, DD [de] MMMM [de] YYYY [a las] HH:mm',
		localized: 'll', // Uses dayjs localized format
	},
	fr: {
		short: 'DD/MM/YYYY',
		long: 'DD MMMM YYYY',
		withTime: 'DD/MM/YYYY [à] HH:mm',
		tooltip: 'dddd DD MMMM YYYY [à] HH:mm',
		localized: 'll', // Uses dayjs localized format
	},
	zh: {
		short: 'YYYY年MM月DD日',
		long: 'YYYY年MM月DD日',
		withTime: 'YYYY年MM月DD日 HH:mm',
		tooltip: 'dddd YYYY年MM月DD日 HH:mm',
		localized: 'll', // Uses dayjs localized format
	},
	hi: {
		short: 'DD/MM/YYYY',
		long: 'DD MMMM, YYYY',
		withTime: 'DD/MM/YYYY [को] HH:mm [बजे]',
		tooltip: 'dddd, DD MMMM, YYYY [को] HH:mm [बजे]',
		localized: 'll', // Uses dayjs localized format
	},
};

// Helper function to get locale formats with fallback
const getLocaleFormats = (locale: string) => {
	const supportedLocale =
		(locale as SupportedLocale) in DATE_FORMATS ? (locale as SupportedLocale) : 'en';
	return DATE_FORMATS[supportedLocale];
};

// Generic date formatting function
const formatDateWithFormat = (
	dateString: string,
	locale: string,
	formatKey: DateFormatKey,
): string => {
	try {
		const formats = getLocaleFormats(locale);
		const format = formats[formatKey];
		return moment(dateString).locale(locale).format(format);
	} catch (error) {
		console.warn(`Error formatting date: ${error}`);
		// Fallback to English format
		return moment(dateString).locale('en').format(DATE_FORMATS.en[formatKey]);
	}
};

export const formatDate = (
	dateString: string,
	locale: string = 'en',
	formatType: DateFormatType = 'short',
): string => {
	return formatDateWithFormat(dateString, locale, formatType);
};

export const formatDateWithTime = (dateString: string, locale: string = 'en'): string => {
	return formatDateWithFormat(dateString, locale, 'withTime');
};

export const formatDateTooltip = (dateString: string, locale: string = 'en'): string => {
	return formatDateWithFormat(dateString, locale, 'tooltip');
};

export const formatRelativeTime = (dateString: string, locale: string = 'en'): string => {
	try {
		return moment(dateString).locale(locale).fromNow();
	} catch (error) {
		console.warn(`Error formatting relative time: ${error}`);
		return moment(dateString).locale('en').fromNow();
	}
};

export const setupDayjsLocale = (locale: string): void => {
	const supportedLocale =
		(locale as SupportedLocale) in DATE_FORMATS ? (locale as SupportedLocale) : 'en';
	moment.locale(supportedLocale);
};

// Utility function to check if a locale is supported
export const isSupportedLocale = (locale: string): locale is SupportedLocale => {
	return (locale as SupportedLocale) in DATE_FORMATS;
};

// Get list of supported locales
export const getSupportedLocales = (): SupportedLocale[] => {
	return Object.keys(DATE_FORMATS) as SupportedLocale[];
};
