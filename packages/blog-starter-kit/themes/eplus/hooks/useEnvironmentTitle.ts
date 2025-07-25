import { useMemo } from 'react';

export const useEnvironmentTitle = (originalTitle: string) => {
	const isDevelopment = process.env.NEXT_PUBLIC_MODE === 'development';

	const title = useMemo(() => {
		if (isDevelopment) {
			return `[DEV] / ${originalTitle}`;
		}
		return originalTitle;
	}, [originalTitle, isDevelopment]);

	return title;
};
