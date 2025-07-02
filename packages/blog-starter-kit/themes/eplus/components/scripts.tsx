import { useAppContext } from './contexts/appContext';

export const Scripts = () => {
	const { publication } = useAppContext();
	const gaTrackingID = publication.integrations?.gaTrackingID || process.env.NEXT_PUBLIC_GA_TRACKING_ID;
	
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
