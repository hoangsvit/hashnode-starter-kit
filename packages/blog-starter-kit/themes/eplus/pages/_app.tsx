import { withUrqlClient } from 'next-urql';
import { AppProps } from 'next/app';
import { useEffect, Fragment } from 'react';
import 'tailwindcss/tailwind.css';
import NextTopLoader from 'nextjs-toploader';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { GlobalFontVariables } from '../components/fonts';
import { getUrqlClientConfig } from '../lib/api/client';
import { useImageBlurMode } from '../hooks/useImageBlurMode';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/index.css';

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();

	// Apply image blur mode for privacy when enabled
	useImageBlurMode();

	useEffect(() => {
		(window as any).adjustIframeSize = (id: string, newHeight: string) => {
			const i = document.getElementById(id);
			if (!i) return;
			// eslint-disable-next-line radix
			i.style.height = `${parseInt(newHeight)}px`;
		};
	}, []);

	return (
		<NextIntlClientProvider
			locale={router.locale}
			messages={pageProps.messages}
			timeZone="Asia/Ho_Chi_Minh"
		>
			<AuthProvider>
				<Fragment>
					<GlobalFontVariables />
					<NextTopLoader
						color="#f6af41"
						initialPosition={0.08}
						crawlSpeed={200}
						height={3}
						crawl={true}
						showSpinner={true}
						easing="ease"
						speed={200}
						shadow="0 0 10px #f6af41,0 0 5px #f6af41"
						zIndex={1600}
						showAtBottom={false}
					/>
					<Component {...pageProps} />
				</Fragment>
			</AuthProvider>
		</NextIntlClientProvider>
	);
}

// `withUrqlClient` HOC provides the `urqlClient` prop and takes care of restoring cache from urqlState
// this will provide ssr cache to the provider and enable to use `useQuery` hook on the client side
export default withUrqlClient(getUrqlClientConfig, { neverSuspend: true })(MyApp);
