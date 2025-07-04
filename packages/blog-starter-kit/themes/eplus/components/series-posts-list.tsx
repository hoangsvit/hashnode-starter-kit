import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { SeriesFragment } from '../generated/graphql';
import CustomImage from './custom-image';
import { resizeImage, getBlurHash } from '../utils/image';
import { blurImageDimensions } from '../utils/const/images';
import { formatDate, formatDateTooltip } from '../utils/dateFormatter';

interface SeriesPostsListProps {
	series: SeriesFragment;
	currentPostSlug?: string;
}

export const SeriesPostsList = ({ series, currentPostSlug }: SeriesPostsListProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const currentLocale = router.locale || 'en';
	const [isVisible, setIsVisible] = useState(false);
	const [hasLoaded, setHasLoaded] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasLoaded) {
					setIsVisible(true);
					setHasLoaded(true);
				}
			},
			{
				threshold: 0.1,
				rootMargin: '100px 0px', // Load content when it's 100px away from viewport
			}
		);

		const currentContainer = containerRef.current;
		if (currentContainer) {
			observer.observe(currentContainer);
		}

		return () => {
			if (currentContainer) {
				observer.unobserve(currentContainer);
			}
		};
	}, [hasLoaded]);

	if (!series.posts.edges.length) {
		return null;
	}

	return (
		<div ref={containerRef} className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					{t('common.postsInSeries')}: {series.name}
				</h2>
				{series.description?.html && (
					<div
						className="prose prose-gray dark:prose-invert text-sm"
						dangerouslySetInnerHTML={{ __html: series.description.html }}
					/>
				)}
			</div>

			{!isVisible ? (
				// Skeleton loading state
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: Math.min(series.posts.edges.length, 6) }).map((_, index) => (
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
			) : (
				// Actual content
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{series.posts.edges.map(({ node: post }, index) => {
						const isCurrentPost = post.slug === currentPostSlug;
						
						return (
							<article
								key={post.id}
								className={`group relative rounded-lg border p-4 transition-all duration-200 hover:shadow-lg ${
									isCurrentPost
										? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
										: 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
								}`}
							>
								{isCurrentPost && (
									<div className="absolute top-2 right-2">
										<span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
											{t('common.currentPost')}
										</span>
									</div>
								)}

								<div className="flex items-start space-x-3">
									<div className="flex-shrink-0">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
											{index + 1}
										</div>
									</div>

									<div className="flex-1 min-w-0">
										{post.coverImage && (
											<div className="mb-3 overflow-hidden rounded-md">
												<CustomImage
													src={post.coverImage.url}
													originalSrc={post.coverImage.url}
													alt={post.title}
													width={400}
													height={200}
													className="h-32 w-full object-cover transition-transform duration-200 group-hover:scale-105"
													placeholder="blur"
													blurDataURL={getBlurHash(
														resizeImage(post.coverImage.url, {
															...blurImageDimensions,
															c: 'thumb',
														}),
													)}
													loading="lazy"
												/>
											</div>
										)}

										<div className="space-y-2">
											<h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
												{isCurrentPost ? (
													post.title
												) : (
													<Link href={`/${post.slug}`} className="hover:underline">
														{post.title}
													</Link>
												)}
											</h3>

											<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
												{post.brief}
											</p>

											<div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
												<div className="flex items-center space-x-1">
													{post.author.profilePicture && (
														<Image
															src={post.author.profilePicture}
															alt={post.author.name}
															className="h-4 w-4 rounded-full"
															width={16}
															height={16}
															loading="lazy"
														/>
													)}
													<span>{post.author.name}</span>
												</div>
												<span>•</span>
												<time 
													dateTime={post.publishedAt}
													className="tooltip-handle"
													data-title={formatDateTooltip(post.publishedAt, currentLocale)}
												>
													{formatDate(post.publishedAt, currentLocale, 'short')}
												</time>
											</div>
										</div>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			)}

			{isVisible && (
				<div className="mt-6 text-center">
					<Link
						href={`/series/${series.slug}`}
						className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
					>
						{t('common.viewAllPostsInSeries')}
						<svg
							className="ml-2 h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 8l4 4m0 0l-4 4m4-4H3"
							/>
						</svg>
					</Link>
				</div>
			)}
		</div>
	);
};
