// Example of how to use next-intl in your components

import { useTranslations, useLocale } from 'next-intl';
import { Link } from './navigation';

export default function ExampleComponent() {
  const t = useTranslations('common');
  const locale = useLocale();

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>Current locale: {locale}</p>
      <Link href="/about">{t('about')}</Link>
    </div>
  );
}

// In your pages, you can use getStaticProps or getServerSideProps like this:
// export async function getStaticProps({ locale }) {
//   return {
//     props: {
//       messages: (await import(`../messages/${locale}.json`)).default
//     }
//   };
// }
