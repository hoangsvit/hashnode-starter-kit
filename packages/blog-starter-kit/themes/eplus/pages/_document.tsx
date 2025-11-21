import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
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
				<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" async />
			</Head>
			<body>
				<Main />
				<NextScript />
				<div id="hn-toast" />
			</body>
		</Html>
	);
}
