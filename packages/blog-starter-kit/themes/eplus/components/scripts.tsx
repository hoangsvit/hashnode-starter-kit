import { useAppContext } from './contexts/appContext';

// Validate GA Tracking ID format (G-XXXXXXXX or UA-XXXXX-X)
const isValidGATrackingId = (id: string): boolean => /^(G|UA|AW|DC)-[A-Z0-9-]+$/.test(id);

export const Scripts = () => {
	const { publication } = useAppContext();
	const rawGaId = publication.integrations?.gaTrackingID || process.env.NEXT_PUBLIC_GA_TRACKING_ID;
	const gaTrackingID = rawGaId && isValidGATrackingId(rawGaId) ? rawGaId : null;

	const googleAnalytics = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());` + (gaTrackingID ? `
    gtag('config', '${gaTrackingID}');` : '');

	if (!gaTrackingID) {
		return null;
	}

	return (
		<>
			<script async src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingID}`} />
			<script dangerouslySetInnerHTML={{ __html: googleAnalytics }} />
		</>
	);
};
