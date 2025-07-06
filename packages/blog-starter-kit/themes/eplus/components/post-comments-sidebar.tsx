import { PostFullFragment } from '../generated/graphql';
import CommentsSheet from './comments-sheet';
import ResponseList from './response-list';
import { useTranslations } from 'next-intl';

const PostCommentsSidebar = ({
  hideSidebar,
  isPublicationPost,
  selectedFilter,
  post,
}: {
  hideSidebar: () => void;
  isPublicationPost: boolean;
  selectedFilter: string;
  post: PostFullFragment;
}) => {
  const t = useTranslations('comments');

  return (
    <CommentsSheet hideSheet={hideSidebar}>

      {!post.preferences.disableComments ? (
        <ResponseList
          isPublicationPost={isPublicationPost}
          currentFilter={selectedFilter}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-base text-slate-500 dark:text-slate-400">
          <p className="mx-auto w-4/5 text-center">{t('commentsDisabled')}</p>
        </div>
      )}
    </CommentsSheet>
  );
};

export default PostCommentsSidebar;
