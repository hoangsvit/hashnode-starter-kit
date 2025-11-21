import dynamic from 'next/dynamic';
import { Analytics } from './analytics';
import { Integrations } from './integrations';
import { Meta } from './meta';
import { Scripts } from './scripts';

const Snow = dynamic(() => import('./christmas').then(mod => ({ default: mod.Snow })), { ssr: false });
const Santa = dynamic(() => import('./christmas').then(mod => ({ default: mod.Santa })), { ssr: false });

type Props = {
	children: React.ReactNode;
};

export const Layout = ({ children }: Props) => {
	return (
		<>
			<Meta />
			<Scripts />
			<div className="min-h-screen bg-white dark:bg-neutral-950">
				<main>{children}</main>
			</div>
			<Snow />
			<Santa />
			<Analytics />
			<Integrations />
		</>
	);
};

