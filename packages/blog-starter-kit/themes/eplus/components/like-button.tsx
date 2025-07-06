import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '../hooks/useAuth';
import { useLikeComment } from '../hooks/useLikeComment';

interface LikeButtonProps {
  commentId: string;
  initialLikeCount?: number;
  isLiked?: boolean;
  onLikeToggle?: (isLiked: boolean, newCount: number) => void;
}

// Heart SVG icon component
const HeartIcon = ({ filled = false, className = "" }: { filled?: boolean; className?: string }) => (
  <svg
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

export const LikeButton = ({
  commentId,
  initialLikeCount = 0,
  isLiked = false,
  onLikeToggle
}: LikeButtonProps) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(isLiked);
  const { user } = useAuth();
  const { toggleLike, isLoading, setError } = useLikeComment();
  const t = useTranslations();

  const handleLikeToggle = useCallback(async () => {
    if (!user || isLoading || liked) return; // Prevent action if already liked

    // Clear any previous errors
    setError(null);

    try {
      // Optimistically update UI
      setLiked(true);
      setLikeCount(prev => prev + 1);

      // Call the API
      const result = await toggleLike(commentId, liked, likeCount);

      if (result.success) {
        // Update with actual values from server
        setLiked(result.isLiked);
        setLikeCount(result.newLikeCount);

        // Call the callback if provided
        onLikeToggle?.(result.isLiked, result.newLikeCount);
      } else {
        // Revert optimistic update on failure
        setLiked(false);
        setLikeCount(prev => prev - 1);
      }

    } catch (error) {
      // Revert on error
      setLiked(false);
      setLikeCount(prev => prev - 1);
      console.error('Failed to like comment:', error);
    }
  }, [user, isLoading, liked, likeCount, toggleLike, commentId, onLikeToggle, setError]);

  const getAriaLabel = () => {
    if (!user) return t('auth.loginToReply') || 'Login to like';
    if (liked) return t('comments.alreadyLiked') || 'Already liked';
    return t('comments.like') || 'Like comment';
  };

  const getTitle = () => {
    if (!user) return t('auth.loginToReply') || 'Login to like';
    if (liked) return t('comments.alreadyLiked') || 'Already liked';
    return undefined;
  };

  const getButtonStyles = () => {
    let baseStyles = `
      flex items-center gap-1 px-2 py-1 text-sm transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      dark:focus:ring-offset-slate-900 rounded-md
    `;

    if (liked) {
      baseStyles += ' text-red-500 cursor-not-allowed opacity-75';
    } else {
      baseStyles += ' text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100';
    }

    if (!user) {
      baseStyles += ' opacity-50 cursor-not-allowed';
    } else if (!liked) {
      baseStyles += ' hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer';
    }

    if (isLoading) {
      baseStyles += ' opacity-70';
    }

    return baseStyles;
  };

  return (
    <button
      type="button"
      onClick={handleLikeToggle}
      disabled={!user || isLoading || liked}
      className={getButtonStyles()}
      aria-label={getAriaLabel()}
      title={getTitle()}
    >
      <HeartIcon
        filled={liked}
        className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`}
      />
      {likeCount > 0 && (
        <span className="font-medium">
          {likeCount}
        </span>
      )}
    </button>
  );
};
