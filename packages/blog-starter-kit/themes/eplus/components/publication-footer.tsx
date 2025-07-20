import { useEffect, useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { resizeImage } from '../utils/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Helper function to add ref parameter to external URLs
const addRefToExternalUrl = (url: string): string => {
  if (!url.startsWith('http')) return url; // Skip internal links
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('ref', 'eplus.dev');
    return urlObj.toString();
  } catch {
    return url; // Return original URL if parsing fails
  }
};

interface PublicationFooterProps {
  isTeam?: boolean;
  authorName?: string;
  title?: string;
  imprint?: string;
  disableFooterBranding?: boolean;
  logo?: string;
  hideBackToTop?: boolean;
}

const PublicationFooter = memo(function PublicationFooter(props: PublicationFooterProps) {
  const { isTeam, authorName, title, imprint, disableFooterBranding, logo, hideBackToTop = false } = props;
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();

  // Generate aria-label for logo link
  const blogType = isTeam ? 'team' : '';
  const logoAriaLabel = title 
    ? `${title} home page` 
    : `${authorName}'s ${blogType} blog home page`.replace(/\s+/g, ' ').trim();

  const handleScroll = useCallback(() => {
    setShowButton(window.scrollY > 200);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <footer className="blog-footer-area -mt-px border-t bg-slate-100 px-5 py-10 text-center text-slate-800 dark:border-slate-800 dark:bg-black dark:text-slate-500 md:px-10 md:py-12 lg:py-20">
      {imprint && (
        <section className="blog-impressum mx-auto mb-10 rounded-lg border bg-white px-4 py-6 text-left dark:border-slate-800 dark:bg-transparent lg:w-3/4 xl:w-2/3">
          <p className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Impressum
          </p>
          <div
            className="prose mx-auto w-full dark:prose-dark"
            dangerouslySetInnerHTML={{ __html: `${imprint}` }}
          ></div>
        </section>
      )}
      <div className="blog-footer-credits flex flex-col items-center justify-center">
        <nav className="mb-6" aria-label="Footer navigation">
          <div className="flex flex-wrap items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
            <Link 
              href="/about-me" 
              className="mx-2 py-1 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded dark:focus:ring-offset-slate-900"
            >
              About
            </Link>
            <span className="font-extrabold text-black opacity-20 dark:text-white" aria-hidden="true">&middot;</span>
            <Link 
              href="/ecosystem" 
              className="mx-2 py-1 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded dark:focus:ring-offset-slate-900"
            >
              Ecosystem
            </Link>
            <span className="font-extrabold text-black opacity-20 dark:text-white" aria-hidden="true">&middot;</span>
            <Link 
              href="/privacy-policy" 
              className="mx-2 py-1 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded dark:focus:ring-offset-slate-900"
            >
              Privacy Policy
            </Link>
            <span className="font-extrabold text-black opacity-20 dark:text-white" aria-hidden="true">&middot;</span>
            <Link 
              href="/terms-of-service" 
              className="mx-2 py-1 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded dark:focus:ring-offset-slate-900"
            >
              Terms
            </Link>
          </div>
        </nav>
        {disableFooterBranding ? (
          <>        {logo && (
          <div className="flex flex-col items-center">
            <Link 
              href={router.locale === 'en' ? '/' : `/${router.locale}/`} 
              className="relative block h-10 w-40" 
              aria-label={logoAriaLabel}
            >
              <Image
                fill
                alt={title ?? `${authorName}'s ${isTeam ? 'team' : ''} blog`}
                src={resizeImage(logo, { w: 1000, h: 250, c: 'thumb' })}
                className="object-contain"
                sizes="(max-width: 768px) 160px, 160px"
              />
            </Link>
          </div>
        )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Built with
              </span>
              <span className="text-lg">❤️</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                by <span className="font-semibold text-slate-700 dark:text-white">{authorName}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span>&copy; 2020 - {new Date().getFullYear()}</span>
              <span className="hidden sm:inline">by</span>
              <a
                href={addRefToExternalUrl("https://eplus.dev")}
                className="hover:underline font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit ePlus.DEV website"
              >
                ePlus.DEV
              </a>
            </div>
          </div>
        )}
      </div>
      {showButton && !hideBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 group rounded-full bg-slate-700/80 p-3 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-slate-900/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 dark:focus:ring-offset-slate-900"
          aria-label="Scroll to top"
        >
          <svg 
            className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </footer>
  );
});

export default PublicationFooter;
