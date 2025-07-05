import React, { useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import Image from 'next/legacy/image';

import { resizeImage } from '../utils/image';
import { DEFAULT_AVATAR } from '../utils/const/images';

const ProfileImage = ({ user, blogURL, postUrlForAnonymous, className, width, height }) => {
  const profileImageRef = useRef(null);

  const href = blogURL
    ? blogURL
    : user && !user.isDeactivated
    ? `https://hashnode.com/@${user.username}`
    : postUrlForAnonymous
    ? postUrlForAnonymous
    : '#';

  const imageWidth = width ? parseInt(width) : 70;
  const imageHeight = height ? parseInt(height) : 70;

  return (
    <a
      href={href}
      ref={profileImageRef}
      className={`relative block h-full w-full`}
    >
      <Image
        className={twMerge(
          className,
          `relative z-20 block w-full rounded-full`,
          process.env.NEXT_PUBLIC_BLUR_IMAGES === 'true' ? 'dev-mode-blur-image' : ''
        )}
        src={
          user && user.profilePicture
            ? resizeImage(user.profilePicture, { w: imageWidth, h: imageHeight, c: 'face' })
            : DEFAULT_AVATAR
        }
        width={imageWidth}
        height={imageHeight}
        alt={user ? user.name + "'s photo" : undefined}
      />
    </a>
  );
};

export default ProfileImage;
