import { ImgHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

import Image, { ImageProps } from 'next/legacy/image';

type Props = {
  src: any; // can be string or StaticImport of next/image
  alt: string;
  originalSrc: string;
} & ImgHTMLAttributes<any> &
  ImageProps;

/**
 * Conditionally renders native img for gifs and next/image for other types
 * @param props
 * @returns <img /> or <Image/>
 */
function CustomImage(props: Props) {
  const { originalSrc, ...originalRestOfTheProps } = props;
  const {
    alt = '',
    loader,
    quality,
    priority,
    loading,
    unoptimized,
    objectFit,
    objectPosition,
    src,
    width,
    height,
    layout,
    placeholder,
    blurDataURL,
    className,
    ...restOfTheProps
  } = originalRestOfTheProps; // Destructured next/image props on purpose, so that unwanted props don't end up in <img />

  if (!originalSrc) {
    return null;
  }

  const isGif = originalSrc.endsWith('.gif');
  const isHashnodeCDNImage = src.indexOf('cdn.hashnode.com') > -1;
  
  // Add blur class if NEXT_PUBLIC_BLUR_IMAGES is enabled
  const shouldBlurImages = process.env.NEXT_PUBLIC_BLUR_IMAGES === 'true';
  const blurClass = shouldBlurImages ? 'dev-mode-blur-image' : '';
  const mergedClassName = twMerge(className, blurClass);

  if (isGif || !isHashnodeCDNImage) {
    // restOfTheProps will contain all props excluding the next/image props
    return <img {...restOfTheProps} alt={alt} src={src ?? originalSrc} className={mergedClassName} />;
  }

  // Notes we are passing whole props object here with merged className
  return <Image {...originalRestOfTheProps} src={src ?? originalSrc} className={mergedClassName} />;
}

export default CustomImage;
