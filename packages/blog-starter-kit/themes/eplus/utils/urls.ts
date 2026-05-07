import { ParsedUrlQuery } from 'querystring';

/**
 * Gets the first query param value from a query object by its key.
 */

const hashnodeEnv = process.env.NEXT_PUBLIC_HASHNODE_ENV;
const isDevEnv = hashnodeEnv === 'development';
const isStagingEnv = hashnodeEnv === 'staging' || hashnodeEnv === 'test';
export const protocol = isDevEnv ? 'http://' : 'https://';

const isValidPublicationDomainNamesKey = (
	key: unknown,
): key is keyof typeof publicationDomainNames => (key as any) in publicationDomainNames;

export const publicationDomainNames = {
	development: 'app.localhost',
	staging: 'hashnode.net',
	test: 'hashnode.net',
	production: 'hashnode.dev',
} as const;

export function getSingleQueryParam(query: ParsedUrlQuery, key: string) {
	const value = query[key];
	return Array.isArray(value) ? value[0] : value;
}

export const getAppUrl = () => {
	let url;

	switch (hashnodeEnv) {
		case 'development':
			url = 'http://localhost:8080';
			break;
		case 'test':
		case 'staging':
			url = 'https://hashnode.xyz';
			break;
		case 'production':
		default:
			url = 'https://hashnode.com';
			break;
	}
	return url;
};

/**
 * Creates the origin address for a publication.
 *
 * @example
 * createPublicationHostName({ username: 'myusername' })
 * // returns 'https://myusername.hashnode.dev'
 */
export const createPublicationOrigin = (
	publication: any, // TODO: Need to think what we need to do about legacyPublication
) => {
	const domain = publication.domainInfo.domain?.host ?? '';
	const username = publication.domainInfo.hashnodeSubdomain ?? '';
	const domainStatus = {
		ready: publication.domainInfo.domain?.ready ?? undefined,
		certIssued: publication.domainInfo?.domain?.ready ?? undefined,
	};
	if (!publication || (!domain && !username)) {
		// using the hashnode domain as a fallback in order to prevent errors
		return getAppUrl();
	}

	const hasReadyDomain = !!domain && !!domainStatus?.ready;

	// always use prod as default to make sure prod works
	let subDomain = hasReadyDomain ? '' : `${username}.`;
	if (isDevEnv || isStagingEnv) {
		subDomain = `${username}.`;
	}

	let domainName = hasReadyDomain ? domain : publicationDomainNames.production;
	if ((isDevEnv || isStagingEnv) && isValidPublicationDomainNamesKey(hashnodeEnv)) {
		domainName = publicationDomainNames[hashnodeEnv];
	}
	const origin = `${protocol}${subDomain}${domainName}`;
	return replaceLegacyPublicationUrl(origin) || origin;
};

export const createPostUrl = (
	{ slug, cuid, partOfPublication }: any, // TODO: legacyPublication type needs to be fixed
	publication?: any,
) => {
	// for legacy purposes as it is not possible to create a post without a publication since 2022-08
	if (!partOfPublication || !publication) {
		// we always use absolute URLs since we are on users' domains
		const legacyPostUrl = `${getAppUrl()}/post/${slug}-${cuid}`;
		return replaceLegacyPublicationUrl(legacyPostUrl) || legacyPostUrl;
	}

	const origin = createPublicationOrigin(publication);
	const isSimpleUrl = publication.urlPattern === 'SIMPLE';
	const pathname = isSimpleUrl ? `/${slug}` : `/${slug}-${cuid}`;
	const postUrl = `${origin}${pathname}`;
	return replaceLegacyPublicationUrl(postUrl) || postUrl;
};

export const createDraftPreviewUrl = (id: string) => `${getAppUrl()}/preview/${id}`;

const LEGACY_HASHNODE_PUBLICATION_HOST = 'hoangit.hashnode.dev';
const DEFAULT_FRONTEND_PUBLICATION_HOST = 'eplus.dev';

const getFrontendPublicationHost = () =>
	process.env.NEXT_PUBLIC_FRONTEND_PUBLICATION_HOST ||
	process.env.NEXT_PUBLIC_SITE_HOST ||
	DEFAULT_FRONTEND_PUBLICATION_HOST;

const getFrontendPublicationOrigin = () => `https://${getFrontendPublicationHost()}`;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isHashnodePublicationHost = (hostname: string) => /(^|\.)hashnode\.dev$/i.test(hostname);

const isFrontendPublicationHost = (hostname: string) =>
	hostname.toLowerCase() === getFrontendPublicationHost().toLowerCase();

export const replaceLegacyPublicationUrl = (url?: string | null) => {
	if (!url) {
		return url;
	}

	const frontendOrigin = getFrontendPublicationOrigin();

	// Replace the original Hashnode publication URL (hoangit.hashnode.dev) with
	// the public frontend domain used by generated sitemaps and canonical URLs.
	let result = url.replace(
		new RegExp(
			`^https?:\\/\\/${escapeRegExp(LEGACY_HASHNODE_PUBLICATION_HOST)}(?=\\/|$)`,
			'i',
		),
		frontendOrigin,
	);

	// Hashnode can return navbar/static-page URLs on any *.hashnode.dev host.
	// Keep those links on the public frontend instead of sending readers back to Hashnode.
	result = result.replace(/^https?:\/\/[a-z0-9-]+\.hashnode\.dev(?=\/|$)/i, frontendOrigin);

	return result;
};

export const getPublicationRelativeUrl = (url?: string | null) => {
	const normalizedUrl = replaceLegacyPublicationUrl(url);

	if (!normalizedUrl) {
		return normalizedUrl;
	}

	if (
		normalizedUrl.startsWith('/') ||
		normalizedUrl.startsWith('#') ||
		/^(mailto|tel):/i.test(normalizedUrl)
	) {
		return normalizedUrl;
	}

	try {
		const parsedUrl = new URL(normalizedUrl, getFrontendPublicationOrigin());

		if (
			isFrontendPublicationHost(parsedUrl.hostname) ||
			parsedUrl.hostname.toLowerCase() === LEGACY_HASHNODE_PUBLICATION_HOST ||
			isHashnodePublicationHost(parsedUrl.hostname)
		) {
			return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
		}
	} catch (error) {
		return normalizedUrl;
	}

	return normalizedUrl;
};
