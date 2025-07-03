import { withUrqlClient } from 'next-urql';
import { AppProps } from 'next/app';
import { useEffect, Fragment } from 'react';
import 'tailwindcss/tailwind.css';
import NextTopLoader from 'nextjs-toploader';
import { appWithTranslation } from 'next-i18next';
import { GlobalFontVariables } from '../components/fonts';
import { getUrqlClientConfig } from '../lib/api/client';
import '../styles/index.css';

function MyApp({ Component, pageProps }: AppProps) {
	useEffect(() => {
		(window as any).adjustIframeSize = (id: string, newHeight: string) => {
			const i = document.getElementById(id);
			if (!i) return;
			// eslint-disable-next-line radix
			i.style.height = `${parseInt(newHeight)}px`;
		};
	}, []);
	return (
		<Fragment>
			<GlobalFontVariables />
			<NextTopLoader color="#2299DD"
				initialPosition={0.08}
				crawlSpeed={200}
				height={3}
				crawl={true}
				showSpinner={true}
				easing="ease"
				speed={200}
				shadow="0 0 10px #2299DD,0 0 5px #2299DD"
				template='<div class="bar" role="bar"><div class="peg"></div></div>
				<div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
				zIndex={1600}
				showAtBottom={false}
			/>
			<Component {...pageProps} />
		</Fragment>
	);
}

// `withUrqlClient` HOC provides the `urqlClient` prop and takes care of restoring cache from urqlState
// this will provide ssr cache to the provider and enable to use `useQuery` hook on the client side
export default withUrqlClient(getUrqlClientConfig, { neverSuspend: true })(appWithTranslation(MyApp));
