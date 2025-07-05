import request from 'graphql-request';
import { useEffect, useState } from 'react';
import { SeriesFragment, SeriesPostsByPublicationDocument } from '../generated/graphql';

interface UseLazySeriesOptions {
	seriesSlug?: string;
	host?: string;
	enabled?: boolean;
}

export const useLazySeries = ({ seriesSlug, host, enabled = true }: UseLazySeriesOptions) => {
	const [series, setSeries] = useState<SeriesFragment | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!enabled || !seriesSlug || !host) {
			return;
		}

		const fetchSeries = async () => {
			setLoading(true);
			setError(null);

			try {
				const endpoint = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;
				const response = await request(endpoint, SeriesPostsByPublicationDocument, {
					host,
					seriesSlug,
					first: 6,
				});

				setSeries(response.publication?.series || null);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch series');
				console.warn('Failed to fetch series data:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchSeries();
	}, [seriesSlug, host, enabled]);

	return { series, loading, error };
};
