const INTERNAL_URL_ORIGIN = 'http://internal.local';

function normalizeHost(host?: string) {
	return host?.replace(/^www\./i, '').toLowerCase();
}

function isSamePublicationHost(hostname: string) {
	const publicationHost = normalizeHost(process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST);
	return Boolean(publicationHost && normalizeHost(hostname) === publicationHost);
}

export function isInternalNavigationUrl(href: string) {
	if (!href) return false;

	if (href.startsWith('/') || href.startsWith('#')) return true;

	try {
		const url = new URL(href, INTERNAL_URL_ORIGIN);
		return url.origin === INTERNAL_URL_ORIGIN || isSamePublicationHost(url.hostname);
	} catch {
		return false;
	}
}

export function getInternalNavigationHref(href: string) {
	if (href.startsWith('/')) return href;
	if (href.startsWith('#')) return href;

	try {
		const url = new URL(href, INTERNAL_URL_ORIGIN);
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return href;
	}
}

export function getExternalLinkProps(href: string) {
	if (!href.startsWith('http://') && !href.startsWith('https://')) return {};

	return {
		target: '_blank',
		rel: 'noopener noreferrer',
	};
}
