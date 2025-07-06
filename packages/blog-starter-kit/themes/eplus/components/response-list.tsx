import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { getHashId } from '../utils/commonUtils';
import { useAppContext } from './contexts/appContext';
import { NoCommentsLightSVG } from './icons/svgs';

interface Props {
	readonly isPublicationPost: boolean;
	readonly currentFilter: string;
	readonly initialTab?: ResponseTab;
}

const PostComments = dynamic(() =>
	import('../components/post-comments').then((mod) => mod.PostComments),
);

const PostLikers = dynamic(() =>
	import('../components/post-likers').then((mod) => mod.PostLikers),
);

const CommentInput = dynamic(() =>
	import('../components/comment-input').then((mod) => mod.CommentInput),
);

type ResponseTab = 'comments' | 'likers';

function ResponseList(props: Props) {
	const t = useTranslations();
	const { currentFilter, initialTab = 'comments' } = props;
	const { post: _post } = useAppContext();
	const post = _post as any;
	const [isLoading, setIsLoading] = useState(false);
	const [initialResponsesLoaded, setInitialResponsesLoaded] = useState(false);
	const hashId = getHashId();

	const hasComments = post.responseCount > 0;
	const hasLikers = post.likedBy?.totalDocuments > 0;

	const [activeTab, setActiveTab] = useState<ResponseTab>(initialTab);

	// Update tab when initialTab changes (when popup opens)
	useEffect(() => {
		setActiveTab(initialTab);
	}, [initialTab]);

	useEffect(() => {
		(async () => {
			if (post.responseCount === 0) {
				return;
			}
			setIsLoading(true);
			setIsLoading(false);
			if (!initialResponsesLoaded) {
				setInitialResponsesLoaded(true);
			}
			// Scroll to responseId after the responses load
			if (!hashId) {
				return;
			}
			const el = document.getElementById(hashId);
			if (!el) {
				return;
			}
			el.scrollIntoView();
		})();
	}, [currentFilter, hashId, initialResponsesLoaded, post.responseCount]);

	// Luôn hiển thị popup với tabs

	return (
		<div className="mx-2 pb-10 lg:mx-0" id="responses-list">
			{/* Tabs */}
			<div className="flex border-b border-slate-200 dark:border-slate-700">
				<button
					onClick={() => setActiveTab('comments')}
					className={`px-4 py-2 text-sm font-medium ${
						activeTab === 'comments'
							? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
							: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
					}`}
				>
					{t('responses.comments')} {hasComments && `(${post.responseCount + post.replyCount})`}
				</button>
				<button
					onClick={() => setActiveTab('likers')}
					className={`px-4 py-2 text-sm font-medium ${
						activeTab === 'likers'
							? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
							: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
					}`}
				>
					{t('responses.likers')} {hasLikers && `(${post.likedBy?.totalDocuments ?? 0})`}
				</button>
			</div>

			{/* Tab Content */}
			{activeTab === 'comments' && (
				<div>
					{/* Comment Input */}
					<CommentInput onCommentAdded={() => {
						// Refresh comments after adding a new one
						// This could trigger a refetch of the post data
						window.location.reload();
					}} />

					{hasComments ? (
						<PostComments />
					) : (
						<div className="flex h-3/5 flex-col items-center justify-center text-sm text-slate-500 dark:text-slate-400">
							<NoCommentsLightSVG className="h-40 w-40" />
							<p>{t('comments.noComments')}</p>
						</div>
					)}
				</div>
			)}

			{activeTab === 'likers' && (
				<div>
					{hasLikers ? (
						<PostLikers />
					) : (
						<div className="flex h-3/5 flex-col items-center justify-center text-sm text-slate-500 dark:text-slate-400">
							<NoCommentsLightSVG className="h-40 w-40" />
							<p>{t('likers.noLikers')}</p>
						</div>
					)}
				</div>
			)}

			{isLoading &&
				[...Array(3).keys()].map((val: number) => (
					<div
						key={`responses-list-loader-${val}`}
						className="border-b-1/2 animate-pulse dark:border-slate-700"
					>
						<div className="px-4 py-5">
							<div className="mb-6 flex flex-row items-center bg-white dark:border-slate-800 dark:bg-slate-900">
								<div className="mr-4 h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
								<div className="flex flex-col gap-2">
									<div className="h-3 w-56 rounded bg-slate-200 dark:bg-slate-700" />
									<div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
								</div>
							</div>
							<div>
								<div className="mb-2 h-3 w-11/12 rounded bg-slate-200 dark:bg-slate-700" />
								<div className="mb-2 h-3 w-11/12 rounded bg-slate-200 dark:bg-slate-700" />
								<div className="mb-2 h-3 w-11/12 rounded bg-slate-200 dark:bg-slate-700" />
							</div>
						</div>
					</div>
				))}
		</div>
	);
}

export default ResponseList;
