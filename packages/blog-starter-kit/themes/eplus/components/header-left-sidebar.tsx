/* eslint-disable no-nested-ternary */
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

import { PublicationFragment } from '../generated/graphql';
import CommonHeaderIconBtn from './common-header-icon-btn';
import { BarsSVG } from './icons/svgs';

const PublicationSidebar = dynamic(() => import('./publication-sidebar'), {
	ssr: false,
});

interface Props {
	currentMenuId?: string | null;
	isHome?: boolean | null;
	publication: Pick<
		PublicationFragment,
		'id' | 'title' | 'url' | 'isTeam' | 'favicon' | 'links' | 'about' | 'author' | 'preferences'
	>;
}

const LeftSidebarButton = (props: Props) => {
	const { currentMenuId, isHome, publication } = props;

	const triggerRef = useRef<HTMLButtonElement>(null);
	const [isSidebarVisible, toggleSidebarVisibility] = useState(false);

	const toggleSidebar = () => {
		toggleSidebarVisibility(!isSidebarVisible);
	};

	return (
		<>
			{isSidebarVisible ? (
				<PublicationSidebar
					currentActiveMenuItemId={currentMenuId}
					isHome={isHome}
					publication={publication}
					toggleSidebar={toggleSidebar}
					triggerRef={triggerRef}
				/>
			) : null}
			<CommonHeaderIconBtn handleClick={toggleSidebar} variant="leftSidebar" btnRef={triggerRef}>
				<BarsSVG className="h-6 w-6 stroke-current" />
			</CommonHeaderIconBtn>
		</>
	);
};

export default LeftSidebarButton;
