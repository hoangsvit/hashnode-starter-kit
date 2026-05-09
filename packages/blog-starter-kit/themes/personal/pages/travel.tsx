import request from 'graphql-request';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { Container } from '../components/container';
import { AppProvider } from '../components/contexts/appContext';
import { Footer } from '../components/footer';
import { Layout } from '../components/layout';
import { PersonalHeader } from '../components/personal-theme-header';
import {
	PublicationByHostDocument,
	PublicationByHostQuery,
	PublicationByHostQueryVariables,
	PublicationFragment,
} from '../generated/graphql';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;

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
	publication: PublicationFragment;
};

const travelStops: TravelStop[] = [
	{
		country: 'Singapore',
		flag: '🇸🇬',
		status: 'visited',
		description: 'Một điểm dừng hiện đại, xanh và rất dễ khám phá bằng MRT.',
		position: { x: 50, y: 82 },
	},
	{
		country: 'Thái Lan',
		flag: '🇹🇭',
		status: 'visited',
		description: 'Ẩm thực đường phố, chùa chiền và nhịp sống đầy năng lượng.',
		position: { x: 42, y: 62 },
	},
	{
		country: 'Đài Loan',
		flag: '🇹🇼',
		status: 'visited',
		description: 'Chợ đêm, trà sữa và những cung đường núi ven biển đáng nhớ.',
		position: { x: 70, y: 43 },
	},
	{
		country: 'Trung Quốc',
		flag: '🇨🇳',
		status: 'next',
		description: 'Điểm đến tiếp theo trong hành trình khám phá châu Á.',
		position: { x: 60, y: 30 },
	},
];

const visitedStops = travelStops.filter((stop) => stop.status === 'visited');
const nextStop = travelStops.find((stop) => stop.status === 'next');

export default function TravelPage({ publication }: Props) {
	const pageTitle = `Travel map | ${publication.title}`;

	return (
		<AppProvider publication={publication}>
			<Layout>
				<Head>
					<title>{pageTitle}</title>
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
				<Container className="mx-auto flex max-w-5xl flex-col items-stretch gap-10 px-5 py-10">
					<PersonalHeader />

					<section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-6 shadow-sm md:p-10 dark:border-neutral-800 dark:from-sky-950/40 dark:via-neutral-950 dark:to-amber-950/30">
						<div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
							<div className="space-y-6">
								<p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">
									Travel map
								</p>
								<div className="space-y-4">
									<h1 className="text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl dark:text-white">
										Những quốc gia tôi đã từng đến
									</h1>
									<p className="max-w-xl text-base leading-8 text-neutral-600 dark:text-neutral-300">
										Một góc nhỏ để lưu lại hành trình qua Singapore, Thái Lan, Đài Loan và đánh dấu
										Trung Quốc là điểm đến tiếp theo.
									</p>
								</div>

								<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
									<div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900/80 dark:ring-neutral-800">
										<p className="text-3xl font-bold text-neutral-950 dark:text-white">
											{visitedStops.length}
										</p>
										<p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
											Đã đến
										</p>
									</div>
									<div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900/80 dark:ring-neutral-800">
										<p className="text-3xl font-bold text-neutral-950 dark:text-white">1</p>
										<p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
											Sắp đi
										</p>
									</div>
									<div className="col-span-2 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-neutral-200 sm:col-span-1 dark:bg-neutral-900/80 dark:ring-neutral-800">
										<p className="text-3xl font-bold text-neutral-950 dark:text-white">Asia</p>
										<p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
											Khu vực
										</p>
									</div>
								</div>
							</div>

							<div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-white/70 bg-sky-100/80 p-4 shadow-inner dark:border-neutral-800 dark:bg-sky-950/30">
								<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.28),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(34,197,94,0.24),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(251,191,36,0.28),transparent_22%)]" />
								<div className="absolute inset-x-8 top-1/2 h-px -rotate-12 bg-white/80 dark:bg-white/20" />
								<div className="absolute inset-y-10 left-1/2 w-px rotate-12 bg-white/80 dark:bg-white/20" />

								{travelStops.map((stop) => (
									<div
										key={stop.country}
										className="absolute -translate-x-1/2 -translate-y-1/2"
										style={{ left: `${stop.position.x}%`, top: `${stop.position.y}%` }}
									>
										<div
											className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg ring-4 ${
												stop.status === 'next'
													? 'animate-pulse bg-amber-400 ring-amber-200 dark:bg-amber-300 dark:ring-amber-900'
													: 'bg-white ring-sky-200 dark:bg-neutral-900 dark:ring-sky-900'
											}`}
											aria-label={stop.country}
										>
											{stop.flag}
										</div>
										<span className="mt-2 block whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-center text-xs font-bold text-neutral-700 shadow-sm dark:bg-neutral-950/90 dark:text-neutral-200">
											{stop.country}
										</span>
									</div>
								))}
							</div>
						</div>
					</section>

					<section className="grid gap-4 md:grid-cols-2">
						{travelStops.map((stop) => (
							<article
								key={stop.country}
								className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
							>
								<div className="mb-5 flex items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<span className="text-4xl" aria-hidden="true">
											{stop.flag}
										</span>
										<div>
											<h2 className="text-xl font-bold text-neutral-950 dark:text-white">
												{stop.country}
											</h2>
											<p className="text-sm text-neutral-500 dark:text-neutral-400">
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
								<p className="leading-7 text-neutral-600 dark:text-neutral-300">
									{stop.description}
								</p>
							</article>
						))}
					</section>

					{nextStop && (
						<section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
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

					<Footer />
				</Container>
			</Layout>
		</AppProvider>
	);
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const data = await request<PublicationByHostQuery, PublicationByHostQueryVariables>(
		GQL_ENDPOINT,
		PublicationByHostDocument,
		{
			host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
		},
	);

	const publication = data.publication;
	if (!publication) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			publication,
		},
		revalidate: 60,
	};
};
