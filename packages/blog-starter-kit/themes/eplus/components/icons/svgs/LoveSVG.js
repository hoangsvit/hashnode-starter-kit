import React from 'react';

export default class LoveSVG extends React.Component {
	render() {
		return (
			<svg className={this.props.className} fill="none" viewBox="0 0 24 24">
				<path
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					d="M11 19C12 19 21 14.0002 21 7.00043C21 3.50057 18 1.04405 15 1.00065C13.5 0.978943 12 1.50065 11 3.00059C10 1.50065 8.47405 1.00065 7 1.00065C4 1.00065 1 3.50057 1 7.00043C1 14.0002 10 19 11 19Z"
				/>
			</svg>
		);
	}
}
