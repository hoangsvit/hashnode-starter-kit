import { useTranslations } from 'next-intl';
import { PostFullFragment } from '../generated/graphql';
import CommentsSheet from './comments-sheet';
import ResponseList from './response-list';

const PostResponsesSidebar = ({
  hideSidebar,
  isPublicationPost,
  selectedFilter,
  post,
  initialTab = 'comments',
}: {
  hideSidebar: () => void;
  isPublicationPost: boolean;
  selectedFilter: string;
  post: PostFullFragment;
  initialTab?: 'comments' | 'likers';
}) => {
  const t = useTranslations();

  return (
    <CommentsSheet hideSheet={hideSidebar}>
      {!post.preferences.disableComments ? (
        <ResponseList
          isPublicationPost={isPublicationPost}
          currentFilter={selectedFilter}
          initialTab={initialTab}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-base text-slate-500 dark:text-slate-400">
          <p className="mx-auto w-4/5 text-center">{t('comments.commentsDisabled')}</p>
        </div>
      )}
    </CommentsSheet>
  );
};

export default PostResponsesSidebar;
