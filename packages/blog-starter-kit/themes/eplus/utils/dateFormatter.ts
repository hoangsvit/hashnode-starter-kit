import moment from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/vi';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

moment.extend(localizedFormat);
moment.extend(relativeTime);

// Locale-specific date formats
const DATE_FORMATS = {
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
};

export const formatDate = (
	dateString: string,
	locale: string = 'en',
	formatType: 'short' | 'long' | 'localized' = 'short',
) => {
	const localeKey = locale as keyof typeof DATE_FORMATS;
	const formats = DATE_FORMATS[localeKey] || DATE_FORMATS.en;
	const format = formats[formatType];

	return moment(dateString).locale(locale).format(format);
};

export const formatDateWithTime = (dateString: string, locale: string = 'en') => {
	const localeKey = locale as keyof typeof DATE_FORMATS;
	const formats = DATE_FORMATS[localeKey] || DATE_FORMATS.en;
	const format = formats.withTime;

	return moment(dateString).locale(locale).format(format);
};

export const formatDateTooltip = (dateString: string, locale: string = 'en') => {
	const localeKey = locale as keyof typeof DATE_FORMATS;
	const formats = DATE_FORMATS[localeKey] || DATE_FORMATS.en;
	const format = formats.tooltip;

	return moment(dateString).locale(locale).format(format);
};

export const formatRelativeTime = (dateString: string, locale: string = 'en') => {
	return moment(dateString).locale(locale).fromNow();
};

export const setupDayjsLocale = (locale: string) => {
	moment.locale(locale);
};
