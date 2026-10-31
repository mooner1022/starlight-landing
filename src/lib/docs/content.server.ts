/*
 * The wiki's pages are markdown files in src/docs/<locale>/. The folder names the sidebar section
 * (or `section:` in the frontmatter), and `order:` sorts pages within it. `index.md` is the wiki's
 * front page. A locale without its own copy of a page falls back to the Korean one.
 */
import type { Locale } from '#lib/i18n.ts';
import { renderMarkdown } from '#lib/docs/markdown.server.ts';
import {
	DOC_SECTIONS,
	type DocHeading,
	type DocNavSection,
	type DocPage,
	type DocSection
} from '#lib/docs/types.ts';

const EDIT_BASE = 'https://github.com/mooner1022/starlight-landing/edit/main/src/docs';
const DEFAULT_LOCALE: Locale = 'ko';
// Mirrors paths.base in vite.config.ts. Doc links are root-relative, so a rendered page reads the same from any URL.
const BASE_PATH = import.meta.env.DEV ? '' : (process.env.BASE_PATH ?? '');

function docUrl(locale: Locale, path: string): string {
	const [slug, hash] = path.split('#');
	const page = slug.replace(/\/$/, '');
	return `${BASE_PATH}${locale === 'en' ? '/en' : ''}/docs${page ? `/${page}` : ''}${hash ? `#${hash}` : ''}`;
}

const files = import.meta.glob('/src/docs/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
	string,
	string
>;

interface Source {
	locale: Locale;
	slug: string;
	file: string;
	section: DocSection;
	order: number;
	title: string;
	description: string;
	layout: string | null;
	body: string;
}

/** Reads the `key: value` frontmatter the docs use; no nesting or lists. */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
	if (!match) return { data: {}, body: raw };
	const data: Record<string, string> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator < 0) continue;
		data[line.slice(0, separator).trim()] = line
			.slice(separator + 1)
			.trim()
			.replace(/^["']|["']$/g, '');
	}
	return { data, body: raw.slice(match[0].length) };
}

const sources: Source[] = Object.entries(files).map(([path, raw]) => {
	const [, locale, file] = /^\/src\/docs\/(ko|en)\/(.+)\.md$/.exec(path) ?? [];
	if (!locale) throw new Error(`Docs file outside src/docs/<ko|en>/: ${path}`);
	const { data, body } = parseFrontmatter(raw);
	const slug = file === 'index' ? '' : file.replace(/\/index$/, '');
	const section = (data.section ?? file.split('/')[0]) as DocSection;
	if (!DOC_SECTIONS.includes(section)) throw new Error(`Unknown docs section "${section}" in ${path}`);
	if (!data.title) throw new Error(`Docs page without a title: ${path}`);
	return {
		locale: locale as Locale,
		slug,
		file: `${file}.md`,
		section,
		order: Number(data.order ?? 100),
		title: data.title,
		description: data.description ?? '',
		layout: data.layout ?? null,
		body
	};
});

const byOrder = (a: Source, b: Source) =>
	DOC_SECTIONS.indexOf(a.section) - DOC_SECTIONS.indexOf(b.section) || a.order - b.order;

/** Pages of a locale, falling back to Korean for pages it doesn't have. */
function pagesFor(locale: Locale): Source[] {
	const own = sources.filter((source) => source.locale === locale);
	const fallback = sources.filter(
		(source) => source.locale === DEFAULT_LOCALE && !own.some((page) => page.slug === source.slug)
	);
	return [...own, ...fallback].sort(byOrder);
}

/** Every slug, for prerendering. */
export function allSlugs(): string[] {
	return [...new Set(sources.map((source) => source.slug))];
}

// Rendering is the slow part, so each page is rendered once per build and page locale.
const renderCache = new Map<string, ReturnType<typeof renderMarkdown>>();
function render(source: Source, locale: Locale) {
	const key = `${locale}:${source.slug}`;
	let rendered = renderCache.get(key);
	if (!rendered) {
		rendered = renderMarkdown(source.body, { resolveDocLink: (path) => docUrl(locale, path) });
		renderCache.set(key, rendered);
	}
	return rendered;
}

export async function getNavigation(locale: Locale): Promise<DocNavSection[]> {
	const pages = pagesFor(locale);
	const headings = await Promise.all(pages.map((page) => render(page, locale).then((r) => r.headings)));
	return DOC_SECTIONS.map((id) => ({
		id,
		pages: pages
			.map((page, i) => ({ page, headings: headings[i] }))
			.filter(({ page }) => page.section === id)
			.map(({ page, headings }) => ({
				slug: page.slug,
				title: page.title,
				description: page.description,
				headings: headings.map(({ depth, id, text }): DocHeading => ({ depth, id, text }))
			}))
	})).filter((section) => section.pages.length > 0);
}

export async function getPage(locale: Locale, slug: string): Promise<DocPage | null> {
	const pages = pagesFor(locale);
	const index = pages.findIndex((page) => page.slug === slug);
	if (index < 0) return null;
	const source = pages[index];
	const { html, headings } = await render(source, locale);
	const link = (page: Source | undefined) => (page ? { slug: page.slug, title: page.title } : null);
	return {
		slug: source.slug,
		section: source.section,
		title: source.title,
		description: source.description,
		layout: source.layout,
		html,
		toc: headings,
		prev: link(pages[index - 1]),
		next: link(pages[index + 1]),
		editUrl: `${EDIT_BASE}/${source.locale}/${source.file}`,
		contentLocale: source.locale
	};
}
