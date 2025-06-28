import { useEffect, useState } from 'react';
// MobX Stuff
import Image from 'next/legacy/image';
import { resizeImage } from '../utils/image';
import Link from 'next/link';

function PublicationFooter(props: any) {
  const { isTeam, authorName, title, imprint, disableFooterBranding, logo } = props;
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        <div className="mb-6 flex flex-col flex-wrap items-center">
          <div className="flex flex-row items-center text-slate-600 dark:text-slate-300">
            <Link href="/about-me" className="mx-2">
              About
            </Link>
            <Link href="/ecosystem" className="mx-2">
              Ecosystem
            </Link>
            <Link href="/privacy-policy" className="mx-2">
              Privacy policy
            </Link>
            <span className="font-extrabold text-black opacity-20 dark:text-white">&middot;</span>
            <Link href="/terms-of-service" className="mx-2">
              Terms
            </Link>
          </div>
        </div>
        {disableFooterBranding ? (
          <>
            {logo && (
              <div className="flex flex-col items-center">
                <Link href="/" className="relative block h-10 w-40">
                  <Image
                    layout="fill"
                    alt={title ?? `${authorName}'s ${isTeam ? 'team' : ''} blog`}
                    src={resizeImage(logo, { w: 1000, h: 250, c: 'thumb' })}
                  />
                </Link>
              </div>
            )}
          </>
        ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Built with
              </span>
              <span className="text-lg">❤️</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                by <span className="font-semibold text-slate-700 dark:text-white">{authorName}</span>
              </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span>&copy; 2020 - {new Date().getFullYear()}</span>
              <span className="hidden sm:inline">|</span>
              <a
                aria-label="ePlus.DEV"
                href="https://eplus.dev"
                className="hover:underline font-semibold transition-colors duration-150"
                target="_blank"
                rel="noopener noreferrer"
              >
                ePlus.DEV
              </a>
              </div>
            </div>
        )}
      </div>
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-1 z-50 rounded-full bg-slate-700 bg-opacity-70 p-3 text-white shadow-lg hover:bg-slate-900 hover:bg-opacity-90 transition backdrop-blur-sm"
          style={{ pointerEvents: 'auto' }}
          aria-label="Top"
        >
          ↑ Top
        </button>
      )}
    </footer>
  );
}

export default PublicationFooter;
