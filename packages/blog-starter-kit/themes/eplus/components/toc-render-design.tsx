import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/legacy/image';
import { useRouter } from 'next/router';
import { twJoin } from 'tailwind-merge';
import { useTranslations } from 'next-intl';
import { ChevronDownSVG_16x16, ChevronRightSVG_16x16, ChevronUpSVG_16x16 } from './icons/svgs';
import { useTocModalStore } from './toc-sheet';

interface TocRowProps {
	children: React.ReactNode;
	node: any;
	modal?: boolean;
}

interface TocTreeProps {
	list: any[];
	minHeaderLevel?: number;
	currentItem?: any;
	numItemsCompleted?: number;
	modal?: boolean;
}

interface TocRenderDesignProps {
	list: any[];
	hideShowMoreOption?: boolean;
	modal?: boolean;
}

function TocRow(props: TocRowProps) {
	const { children, node, modal } = props;
	const [childrenVisibility, setChildrenVisibility] = useState(false);
	const { hide: hideTocModal } = useTocModalStore();
	const t = useTranslations('toc');

	// Phân cấp màu sắc tinh tế và thanh lịch
	const getLevelStyles = (level: number) => {
		const baseIndent = (level - 1) * 16; // 16px per level

		return {
			indent: `pl-${Math.min(baseIndent / 4, 12)}`, // max pl-12
			textSize: level === 1 ? 'text-base' : level === 2 ? 'text-sm' : 'text-xs',
			fontWeight: level === 1 ? 'font-semibold' : level === 2 ? 'font-medium' : 'font-normal',
			opacity: level > 3 ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200',
			borderColor: level === 1 ? 'border-l-2 border-slate-300 dark:border-slate-600' : ''
		};
	};

	const levelStyles = getLevelStyles(node.level || 1);

	return (
		<li key={node.id} className="group">
			<div
				className={twJoin(
					'flex items-center gap-2 py-1.5 px-2 rounded-md transition-all duration-200',
					levelStyles.borderColor,
					'hover:bg-slate-50 dark:hover:bg-slate-800/50',
				)}
			>
				{node.hasChildren && (
					<button
						type="button"
						className="flex-shrink-0 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
						aria-label={childrenVisibility ? `${t('collapse')} ${node.title}` : `${t('expand')} ${node.title}`}
						aria-expanded={childrenVisibility}
						onClick={() => {
							setChildrenVisibility((prevVisibility: boolean) => !prevVisibility);
						}}
					>
						{childrenVisibility ? (
							<ChevronDownSVG_16x16 className="h-3 w-3 stroke-current" />
						) : (
							<ChevronRightSVG_16x16 className="h-3 w-3 stroke-current" />
						)}
					</button>
				)}
				<a
					id={node.id}
					className={twJoin(
						'flex-1 leading-relaxed transition-colors duration-200',
						levelStyles.textSize,
						levelStyles.fontWeight,
						levelStyles.opacity,
						levelStyles.indent,
						!node.hasChildren && 'ml-4',
						'hover:text-slate-900 dark:hover:text-slate-100'
					)}
					href={`#heading-${node.slug}`}
					onClick={() => {
						if (hideTocModal && modal) {
							// This rAF is required to prevent flickering of the navbar when the user clicks on a link in the TOC modal
							requestAnimationFrame(() => {
								hideTocModal();
							});
						}
					}}
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						__html: node.title,
					}}
					aria-label={node.title}
				/>
			</div>
			{node.hasChildren ? (
				<> {childrenVisibility && <div className="ml-2 mt-1">{children}</div>} </>
			) : (
				<>{children}</>
			)}
		</li>
	);
}

function TocTree(props: TocTreeProps) {
	const { list, minHeaderLevel, currentItem, numItemsCompleted = 0, modal } = props;

	if (!list || list.length === 0 || numItemsCompleted >= list.length) {
		return null;
	}
	let nodes: any[] = [];

	if (numItemsCompleted > 0) {
		nodes = list.filter((node) => {
			return node.parentId === currentItem.id;
		});
	} else {
		// Find the largest header size and each of those headers
		const minHeader =
			minHeaderLevel ||
			list.reduce((prevNode, currNode) => (prevNode.level < currNode.level ? prevNode : currNode));
		nodes = list.filter((header) => header.level === minHeader.level);

		// When the first heading is not the largest, capture previous suitable headings for top level nodes
		if (!nodes[0].parentId) {
			const temp: any[] = [];
			let curLevel = 0;

			for (let i = 0; i < list.indexOf(nodes[0]); i++) {
				if (!list[i].previousLevel || list[i].level <= curLevel) {
					// set a new initial level li
					curLevel = list[i].level;
					temp.push(list[i]);
				}
			}
			nodes = [...temp, ...nodes];
		}
	}

	// Calculate hasChildren for each node based on the full list
	nodes = nodes.map((node) => ({
		...node,
		hasChildren: list.some((item) => item.parentId === node.id)
	}));

	if (!nodes || !nodes.length) {
		return null;
	}

	return (
		<ul className="space-y-1">
			{nodes.map((node) => (
				<TocRow key={node.id} node={node} modal={modal}>
					<TocTree
						currentItem={node}
						list={list}
						numItemsCompleted={numItemsCompleted + nodes.length}
						minHeaderLevel={minHeaderLevel}
						modal={modal}
					/>
				</TocRow>
			))}
		</ul>
	);
}

const TocRenderDesign = (props: TocRenderDesignProps) => {
	const { list, hideShowMoreOption, modal } = props;
	const [tocFullVisibility, setTocFullVisibility] = useState<boolean>(false);
	const [isOverflowing, setIsOverflowing] = useState(false);
	const router = useRouter();
	const t = useTranslations('toc');
	const { pathname } = router;
	const isDraftPreview = pathname.indexOf('/preview') === 0;
	const tocContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const hasEnoughItems = list && list.length >= 12;
		const shouldShowMoreOption = hideShowMoreOption !== false && hasEnoughItems;

		setIsOverflowing(shouldShowMoreOption);
		setTocFullVisibility(!hasEnoughItems || hideShowMoreOption === true);
	}, [list, hideShowMoreOption]);
	return (
		<div
			className={twJoin(
				'relative mb-10 w-full rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900',
				modal && 'mb-0 rounded-none border-none bg-transparent px-0 py-4',
			)}
			ref={tocContainerRef}
		>
			<div className={tocFullVisibility ? 'max-h-full' : 'max-h-[388px] overflow-hidden'}>
				{/* Header */}
				{modal || (
					<div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
						<h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
							{t('title')}
						</h2>
					</div>
				)}
				{/* Body */}
				{list?.length === 0 ? (
					<div className="flex h-[388px] flex-col items-center justify-center gap-2">
						<div className="relative h-[110px] w-[110px]">
							<Image
								src="https://cdn.hashnode.com/res/hashnode/image/upload/v1686858363512/7ad376cf-1646-4bd4-b74c-25cf8f47238b.png"
								alt="No heading"
								layout="fill"
							/>
						</div>
						<h3 className="text-center text-sm text-slate-700">
							{t('noHeadings')} {isDraftPreview ? t('draft') : t('article')}.
						</h3>
					</div>
				) : (
					<>
						<TocTree list={list} modal={modal} />
						{/* Overlay */}
						{!tocFullVisibility && isOverflowing && (
							<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent dark:from-slate-900 pointer-events-none" />
						)}
					</>
				)}
			</div>

			{/* Show more toggle option */}
			{isOverflowing && !hideShowMoreOption && (
				<div className="flex items-center justify-center pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
					<button
						type="button"
						className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
						aria-expanded={tocFullVisibility}
						aria-label={tocFullVisibility ? 'Show less content' : 'Show more content'}
						onClick={() => {
							setTocFullVisibility((prevVisibility: boolean) => !prevVisibility);
							tocContainerRef.current?.scrollIntoView();
						}}
					>
						{tocFullVisibility ? (
							<>
								<span>{t('showLess')}</span>
								<ChevronUpSVG_16x16 className="inline h-3 w-3 stroke-current ml-1" />
							</>
						) : (
							<>
								<span>{t('showMore')}</span>
								<ChevronDownSVG_16x16 className="inline h-3 w-3 stroke-current ml-1" />
							</>
						)}
					</button>
				</div>
			)}
		</div>
	);
};

export default TocRenderDesign;
