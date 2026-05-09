import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';

export default function MyDocument({ locale }: { locale?: string }) {
	return (
		<Html lang={locale || 'en'}>
			<Head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									var theme = localStorage.getItem('theme');
									if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
										document.documentElement.classList.add('dark');
									} else {
										document.documentElement.classList.remove('dark');
									}
								} catch (e) {}
							})();
						`,
					}}
				/>
				<script src="https://unpkg.com/@lottiefiles/lottie-player@1.6.0/dist/lottie-player.js" async />
			</Head>
			<body>
				<Main />
				<NextScript />
				<div id="hn-toast" />
			</body>
		</Html>
	);
}

MyDocument.getInitialProps = async (ctx: DocumentContext): Promise<DocumentInitialProps & { locale?: string }> => {
	const initialProps = await Document.getInitialProps(ctx);
	return { ...initialProps, locale: ctx.locale };
};
