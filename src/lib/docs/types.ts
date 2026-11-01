// Shapes shared by the docs server modules and the wiki components.

/** Top-level categories, in sidebar order. The first folder under src/docs/<locale>/ names a page's category. */
export const DOC_CATEGORIES = ['app', 'neonjs', 'plugins'] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];

/** Sections within a category, in sidebar order. Every category draws from this one set. */
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

export interface DocNavCategory {
	id: DocCategory;
	/** The category's front page. */
	slug: string;
	sections: DocNavSection[];
}

export interface DocLink {
	slug: string;
	title: string;
}

export interface DocPage {
	slug: string;
	/** Null for the docs' front page, which belongs to no category. */
	category: DocCategory | null;
	section: DocSection | null;
	title: string;
	description: string;
	/** Optional page template, e.g. `sdk` adds the SDK download cards above the content. */
	layout: string | null;
	html: string;
	toc: DocHeading[];
	/** Neighbours within the same category. */
	prev: DocLink | null;
	next: DocLink | null;
	editUrl: string;
	/** The locale the content is actually written in; differs from the page locale when it falls back. */
	contentLocale: 'ko' | 'en';
}
