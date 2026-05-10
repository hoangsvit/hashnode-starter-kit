import { GetServerSideProps } from 'next';
import { initUrqlClient } from 'next-urql';
import Head from 'next/head';
import { AppProvider } from '../components/contexts/appContext';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import PublicationFooter from '../components/publication-footer';
import {
	PublicationByHostDocument,
	PublicationByHostQueryVariables,
	PublicationFragment,
} from '../generated/graphql';
import { useEnvironmentTitle } from '../hooks/useEnvironmentTitle';
import { createHeaders, createSSRExchange, getUrqlClientConfig } from '../lib/api/client';

type TravelStop = {
	country: string;
	flag: string;
	status: 'visited' | 'next';
	description: string;
	position: {
		x: number;
		y: number;
	};
};

type Props = {
	messages: Record<string, any>;
	publication: PublicationFragment;
};

const travelStops: TravelStop[] = [
	{
		country: 'Singapore',
		flag: '🇸🇬',
		status: 'visited',
		description: 'Một điểm dừng hiện đại, xanh và rất dễ khám phá bằng MRT.',
		position: { x: 500, y: 575 },
	},
	{
		country: 'Thái Lan',
		flag: '🇹🇭',
		status: 'visited',
		description: 'Ẩm thực đường phố, chùa chiền và nhịp sống đầy năng lượng.',
		position: { x: 420, y: 410 },
	},
	{
		country: 'Đài Loan',
		flag: '🇹🇼',
		status: 'visited',
		description: 'Chợ đêm, trà sữa và những cung đường núi ven biển đáng nhớ.',
		position: { x: 720, y: 300 },
	},
	{
		country: 'Trung Quốc',
		flag: '🇨🇳',
		status: 'next',
		description: 'Điểm đến tiếp theo trong hành trình khám phá châu Á.',
		position: { x: 585, y: 205 },
	},
];

const visitedStops = travelStops.filter((stop) => stop.status === 'visited');
const nextStop = travelStops.find((stop) => stop.status === 'next');

export default function TravelPage({ publication }: Props) {
	const pageTitle = useEnvironmentTitle(
		`Travel map - ${publication.displayTitle || publication.title || 'Hashnode Blog'}`,
	);

	return (
		<AppProvider publication={publication}>
			<Head>
				<title>{pageTitle}</title>
				<meta name="robots" content="index, follow" />
				<meta
					name="description"
					content="Bản đồ những quốc gia tôi đã từng đến và điểm đến tiếp theo trong hành trình."
				/>
				<meta property="og:title" content={pageTitle} />
				<meta
					property="og:description"
					content="Singapore, Thái Lan, Đài Loan và điểm đến tiếp theo là Trung Quốc."
				/>
			</Head>
			<Layout>
				<Header currentMenuId="travel" isHome={false} />
				<div className="blog-page-area mx-auto min-h-screen px-4 pb-12 pt-12 md:px-10 md:pt-16">
					<section className="container mx-auto overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-6 shadow-sm md:p-10 dark:border-slate-800 dark:from-sky-950/40 dark:via-slate-950 dark:to-amber-950/30">
						<div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
							<div className="space-y-6">
								<p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">
									Travel map
								</p>
								<div className="space-y-4">
									<h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl dark:text-white">
										Những quốc gia tôi đã từng đến
									</h1>
									<p className="max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300">
										Một góc nhỏ để lưu lại hành trình qua Singapore, Thái Lan, Đài Loan và đánh dấu
										Trung Quốc là điểm đến tiếp theo.
									</p>
								</div>

								<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
									<div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/80 dark:ring-slate-800">
										<p className="text-3xl font-bold text-slate-950 dark:text-white">
											{visitedStops.length}
										</p>
										<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
											Đã đến
										</p>
									</div>
									<div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/80 dark:ring-slate-800">
										<p className="text-3xl font-bold text-slate-950 dark:text-white">1</p>
										<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
											Sắp đi
										</p>
									</div>
									<div className="col-span-2 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 sm:col-span-1 dark:bg-slate-900/80 dark:ring-slate-800">
										<p className="text-3xl font-bold text-slate-950 dark:text-white">Asia</p>
										<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
											Khu vực
										</p>
									</div>
								</div>
							</div>

							<div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-sky-100 shadow-2xl shadow-sky-900/10 ring-1 ring-sky-200/70 dark:border-slate-800 dark:bg-sky-950/30 dark:ring-sky-900/50">
								<svg
									className="h-[28rem] w-full"
									role="img"
									viewBox="0 0 1000 680"
									aria-label="Bản đồ hành trình qua Singapore, Thái Lan, Đài Loan và Trung Quốc"
								>
									<defs>
										<linearGradient id="travelOcean" x1="0" x2="1" y1="0" y2="1">
											<stop offset="0%" stopColor="#bae6fd" />
											<stop offset="45%" stopColor="#e0f2fe" />
											<stop offset="100%" stopColor="#fef3c7" />
										</linearGradient>
										<filter
											id="mapShadow"
											colorInterpolationFilters="sRGB"
											x="-20%"
											y="-20%"
											width="140%"
											height="140%"
										>
											<feDropShadow
												dx="0"
												dy="12"
												floodColor="#0f172a"
												floodOpacity="0.16"
												stdDeviation="12"
											/>
										</filter>
									</defs>

									<rect width="1000" height="680" fill="url(#travelOcean)" />
									<g stroke="#38bdf8" strokeDasharray="5 18" strokeOpacity="0.32" strokeWidth="1">
										<path d="M120 110H900" />
										<path d="M90 250H930" />
										<path d="M80 390H940" />
										<path d="M130 530H890" />
										<path d="M250 70V620" />
										<path d="M500 45V635" />
										<path d="M750 70V620" />
									</g>

									<g filter="url(#mapShadow)">
										<path
											d="M430 130L505 92L620 96L720 145L790 222L760 285L678 310L605 288L552 326L475 308L410 260L370 196Z"
											className="fill-emerald-100 stroke-emerald-500/60 dark:fill-emerald-900/60 dark:stroke-emerald-500/60"
											strokeWidth="2"
										/>
										<path
											d="M393 340L440 360L470 420L456 486L498 535L480 590L425 535L398 472L368 430L374 372Z"
											className="fill-emerald-100 stroke-emerald-500/60 dark:fill-emerald-900/60 dark:stroke-emerald-500/60"
											strokeWidth="2"
										/>
										<path
											d="M704 266C730 280 743 315 724 354C699 328 694 292 704 266Z"
											className="fill-emerald-100 stroke-emerald-500/60 dark:fill-emerald-900/60 dark:stroke-emerald-500/60"
											strokeWidth="2"
										/>
										<path
											d="M487 560C506 554 526 561 535 578C522 590 497 590 482 578Z"
											className="fill-emerald-100 stroke-emerald-500/60 dark:fill-emerald-900/60 dark:stroke-emerald-500/60"
											strokeWidth="2"
										/>
									</g>

									<path
										d="M500 575C452 535 401 485 420 410C474 351 626 363 720 300C666 269 620 242 585 205"
										fill="none"
										stroke="#f97316"
										strokeDasharray="12 14"
										strokeLinecap="round"
										strokeWidth="5"
									/>

									{travelStops.map((stop) => (
										<g
											key={stop.country}
											transform={`translate(${stop.position.x} ${stop.position.y})`}
										>
											<circle
												r={stop.status === 'next' ? 25 : 20}
												className={
													stop.status === 'next'
														? 'fill-amber-400 stroke-white dark:fill-amber-300 dark:stroke-amber-950'
														: 'fill-sky-600 stroke-white dark:fill-sky-400 dark:stroke-sky-950'
												}
												strokeWidth="6"
											/>
											<text dominantBaseline="central" fontSize="22" textAnchor="middle">
												{stop.flag}
											</text>
											<text
												className="fill-slate-800 font-bold dark:fill-white"
												fontSize="22"
												textAnchor="middle"
												y="48"
											>
												{stop.country}
											</text>
										</g>
									))}

									<g transform="translate(40 590)">
										<rect
											className="fill-white/85 dark:fill-slate-950/80"
											width="238"
											height="54"
											rx="18"
										/>
										<circle className="fill-sky-600 dark:fill-sky-400" cx="26" cy="27" r="7" />
										<text
											className="fill-slate-700 text-xs font-semibold dark:fill-slate-200"
											x="42"
											y="32"
										>
											Đã đi
										</text>
										<circle className="fill-amber-400" cx="126" cy="27" r="7" />
										<text
											className="fill-slate-700 text-xs font-semibold dark:fill-slate-200"
											x="142"
											y="32"
										>
											Sắp đi
										</text>
									</g>
								</svg>
								<div className="absolute right-4 top-4 rounded-full bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-600 shadow-sm dark:bg-slate-950/80 dark:text-slate-300">
									Asia route · not to scale
								</div>
							</div>
						</div>
					</section>

					<section className="container mx-auto mt-8 grid gap-4 md:grid-cols-2">
						{travelStops.map((stop) => (
							<article
								key={stop.country}
								className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
							>
								<div className="mb-5 flex items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<span className="text-4xl" aria-hidden="true">
											{stop.flag}
										</span>
										<div>
											<h2 className="text-xl font-bold text-slate-950 dark:text-white">
												{stop.country}
											</h2>
											<p className="text-sm text-slate-500 dark:text-slate-400">
												{stop.status === 'visited' ? 'Đã ghé thăm' : 'Điểm đến tiếp theo'}
											</p>
										</div>
									</div>
									<span
										className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
											stop.status === 'visited'
												? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
												: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
										}`}
									>
										{stop.status === 'visited' ? 'Visited' : 'Next'}
									</span>
								</div>
								<p className="leading-7 text-slate-600 dark:text-slate-300">{stop.description}</p>
							</article>
						))}
					</section>

					{nextStop && (
						<section className="container mx-auto mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
							<p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-300">
								Next destination
							</p>
							<h2 className="mt-3 text-3xl font-bold">
								{nextStop.flag} {nextStop.country}
							</h2>
							<p className="mt-3 max-w-2xl leading-7">
								Mục tiêu tiếp theo là chuẩn bị lịch trình, danh sách địa điểm muốn khám phá và những
								trải nghiệm nhất định phải thử tại Trung Quốc.
							</p>
						</section>
					)}
				</div>
				<PublicationFooter
					authorName={publication.author.name}
					disableFooterBranding={publication.preferences.disableFooterBranding}
					imprint={publication.imprint}
					isTeam={publication.isTeam}
					logo={publication.preferences.logo}
					title={publication.title}
				/>
			</Layout>
		</AppProvider>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
	const { locale = 'en' } = context;
	const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;

	if (!host) {
		return { notFound: true };
	}

	const messages = (await import(`../messages/${locale}.json`)).default;
	const ssrCache = createSSRExchange();
	const urqlClient = initUrqlClient(getUrqlClientConfig(ssrCache), false);

	const publicationRes = await urqlClient
		.query(PublicationByHostDocument, { host } satisfies PublicationByHostQueryVariables, {
			fetchOptions: { headers: createHeaders({ byPassCache: false }) },
			requestPolicy: 'network-only',
		})
		.toPromise();

	if (!publicationRes.data?.publication) {
		return { notFound: true };
	}

	return {
		props: {
			messages,
			publication: publicationRes.data.publication,
			urqlState: ssrCache.extractData(),
		},
	};
};
