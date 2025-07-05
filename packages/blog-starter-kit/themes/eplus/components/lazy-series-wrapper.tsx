import { useLazySeries } from '../hooks/useLazySeries';
import { SeriesPostsList } from './series-posts-list';

interface LazySeriesWrapperProps {
	seriesSlug?: string;
	host?: string;
	currentPostSlug?: string;
}

export const LazySeriesWrapper = ({ seriesSlug, host, currentPostSlug }: LazySeriesWrapperProps) => {
	const { series, loading, error } = useLazySeries({
		seriesSlug,
		host,
		enabled: !!seriesSlug && !!host,
	});

	if (error) {
		console.warn('Series loading error:', error);
		return null;
	}

	if (loading) {
		return (
			<div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
				<div className="mb-6">
					<div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-64 animate-pulse mb-2"></div>
					<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-96 animate-pulse"></div>
				</div>
				
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={`skeleton-${index}`}
							className="group relative rounded-lg border p-4 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
						>
							<div className="flex items-start space-x-3">
								<div className="flex-shrink-0">
									<div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
								</div>
								<div className="flex-1 min-w-0">
									<div className="mb-3 overflow-hidden rounded-md">
										<div className="h-32 w-full bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
									</div>
									<div className="space-y-2">
										<div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
										<div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
										<div className="flex items-center space-x-3">
											<div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
											<div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (!series) {
		return null;
	}

	return <SeriesPostsList series={series} currentPostSlug={currentPostSlug} />;
};
