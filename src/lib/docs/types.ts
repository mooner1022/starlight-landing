// Shapes shared by the docs server modules and the wiki components.

export const DOC_SECTIONS = ['start', 'guides', 'reference', 'sdk'] as const;
export type DocSection = (typeof DOC_SECTIONS)[number];

export interface DocHeading {
	depth: number;
	id: string;
	text: string;
}

export interface DocNavPage {
	slug: string;
	title: string;
	description: string;
	/** Used by the sidebar search. */
	headings: DocHeading[];
}

export interface DocNavSection {
	id: DocSection;
	pages: DocNavPage[];
}

export interface DocLink {
	slug: string;
	title: string;
}

export interface DocPage {
	slug: string;
	section: DocSection;
	title: string;
	description: string;
	/** Optional page template, e.g. `sdk` adds the SDK download cards above the content. */
	layout: string | null;
	html: string;
	toc: DocHeading[];
	prev: DocLink | null;
	next: DocLink | null;
	editUrl: string;
	/** The locale the content is actually written in; differs from the page locale when it falls back. */
	contentLocale: 'ko' | 'en';
}
