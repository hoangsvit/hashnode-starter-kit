import { useTranslations } from 'next-intl';
import { twJoin } from 'tailwind-merge';

import { useAppContext } from './contexts/appContext';
import ProfileImage from './profile-image';

export const PostLikers = () => {
	const t = useTranslations();
	const { post } = useAppContext();

	if (!post?.likedBy) return null;

	const loadProfile = (e: any, user: any) => {
		e.preventDefault();
		const isPublication = true;
		const url = `${isPublication ? 'https://hashnode.com/@' : '/@'}${user.username}`;
		if (isPublication) {
			window.location.href = url;
		}
		return null;
	};
	const likersList = post.likedBy.edges.map((edge) => {
		const user = edge.node;
		const reactionCount = edge.reactionCount || 1;

		return (
			<div
				key={user.id}
				className="border-b-1/2 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900"
			>
				<div className="flex items-center justify-between">
					<div className="flex min-w-0 items-center">
						<div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700">
							<ProfileImage width="160" height="160" user={user} hoverDisabled={true} />
						</div>
						<div className="ml-3 min-w-0">
							<div className="flex items-center">
								<button
									className="truncate"
									onClick={(e) => loadProfile(e, user)}
									type="button"
								>
									<span
										title={user.name}
										className={twJoin(
											'mr-2 truncate text-sm font-semibold text-slate-800 dark:text-slate-100',
										)}
									>
										{user.name}
									</span>
								</button>
							</div>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								@{user.username}
							</p>
						</div>
					</div>
					<div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
						<span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
							{reactionCount} {reactionCount === 1 ? t('likers.reaction') : t('likers.reactions')}
						</span>
					</div>
				</div>
			</div>
		);
	});

	return (
		<div id="likers-list" className="mx-2 flex flex-col gap-5">
			<div className="relative z-50 flex flex-row flex-wrap items-center justify-between border-b bg-white p-4 dark:border-slate-800 dark:bg-transparent">
				<div className="flex w-full flex-row items-center dark:text-slate-200 md:w-auto">
					<h3 className="text-xl font-medium tracking-tight text-slate-900 dark:text-slate-100">
						{t('likers.title')}
						{post.likedBy.totalDocuments > 0 && (
							<span> ({post.likedBy.totalDocuments})</span>
						)}
					</h3>
				</div>
			</div>
			<div>{likersList}</div>
		</div>
	);
};
