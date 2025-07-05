import React from 'react';

const HamburgerSVG = ({ className, ...props }) => (
<svg className={className} fill="none" viewBox="0 0 24 24">
				<path
					stroke="currentColor"
					stroke-linecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M20.989 11.997H3M20.989 18H3M21 6H3"
				/>
			</svg>
);

export default HamburgerSVG;