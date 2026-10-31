/*
 * Renders the wiki's markdown files to HTML at build time. Only runs on the server (prerendering),
 * so marked and shiki never reach the browser.
 */
import { Marked, type Tokens } from 'marked';
import { createHighlighter, type Highlighter, type ThemeRegistration } from 'shiki';
import type { DocHeading } from '#lib/docs/types.ts';

// The landing page's code-window palette, as a TextMate theme.
const theme: ThemeRegistration = {
	name: 'starlight',
	type: 'dark',
	colors: {
		'editor.background': '#0d1022',
		'editor.foreground': '#e6e2da'
	},
	tokenColors: [
		{ scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#6c7193', fontStyle: 'italic' } },
		{
			scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'constant.language'],
			settings: { foreground: '#e8bf86' }
		},
		{ scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: '#b8dc9f' } },
		{ scope: ['constant.numeric', 'constant.character.escape'], settings: { foreground: '#f6b17a' } },
		{
			scope: ['entity.name.function', 'support.function', 'meta.function-call.generic', 'variable.function'],
			settings: { foreground: '#7fd6f7' }
		},
		{
			scope: ['entity.name.type', 'entity.name.class', 'support.class', 'support.type', 'entity.other.inherited-class'],
			settings: { foreground: '#b3b9f0' }
		},
		{ scope: ['support.type.property-name', 'meta.object-literal.key'], settings: { foreground: '#e8bf86' } },
		{ scope: ['entity.name.tag', 'entity.other.attribute-name'], settings: { foreground: '#7fd6f7' } },
		{ scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: '#9aa0bb' } },
		{ scope: ['variable', 'variable.parameter', 'meta.definition.variable'], settings: { foreground: '#e6e2da' } }
	]
};

const LANGS = ['kotlin', 'groovy', 'java', 'json', 'javascript', 'typescript', 'shellscript', 'xml', 'properties'];
const LANG_ALIASES: Record<string, string> = {
	kt: 'kotlin',
	kts: 'kotlin',
	gradle: 'groovy',
	js: 'javascript',
	ts: 'typescript',
	sh: 'shellscript',
	bash: 'shellscript',
	shell: 'shellscript'
};
const LANG_LABELS: Record<string, string> = {
	kotlin: 'Kotlin',
	groovy: 'Groovy',
	java: 'Java',
	json: 'JSON',
	javascript: 'JavaScript',
	typescript: 'TypeScript',
	shellscript: 'Shell',
	xml: 'XML',
	properties: 'Properties'
};

const CALLOUTS: Record<string, string> = {
	NOTE: '참고',
	TIP: '팁',
	IMPORTANT: '중요',
	WARNING: '주의',
	CAUTION: '경고'
};

// One highlighter for the whole build: creating it per page would slow prerendering to a crawl.
let highlighterPromise: Promise<Highlighter> | undefined;
const getHighlighter = () => (highlighterPromise ??= createHighlighter({ themes: [theme], langs: LANGS }));

const escapeHtml = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const stripTags = (html: string) =>
	html
		.replace(/<[^>]+>/g, '')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&');

/** Keeps Hangul and other letters (and the dots of version numbers), so headings get readable ids. */
function slugify(text: string): string {
	return (
		text
			.toLowerCase()
			.trim()
			.replace(/[^\p{L}\p{N}\s._-]/gu, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-') || 'section'
	);
}

/** Parses `lang title="file.kt"` from a fence's info string. */
function parseFence(info: string | undefined) {
	const [rawLang = '', ...rest] = (info ?? '').trim().split(/\s+/);
	const title = /title="([^"]+)"/.exec(rest.join(' '))?.[1] ?? null;
	const lang = LANG_ALIASES[rawLang] ?? rawLang;
	return { lang: LANGS.includes(lang) ? lang : 'text', title };
}

export interface RenderOptions {
	/** Turns a wiki path such as `guides/settings#ids` into a URL for the current locale. */
	resolveDocLink: (path: string) => string;
}

export interface RenderedMarkdown {
	html: string;
	headings: DocHeading[];
}

export async function renderMarkdown(source: string, options: RenderOptions): Promise<RenderedMarkdown> {
	const highlighter = await getHighlighter();
	const headings: DocHeading[] = [];
	const usedIds = new Map<string, number>();

	const marked = new Marked({
		gfm: true,
		renderer: {
			heading({ tokens, depth }: Tokens.Heading) {
				const inner = this.parser.parseInline(tokens);
				const text = stripTags(inner);
				const base = slugify(text);
				const count = usedIds.get(base) ?? 0;
				usedIds.set(base, count + 1);
				const id = count ? `${base}-${count}` : base;
				if (depth === 2 || depth === 3) headings.push({ depth, id, text });
				const anchor = depth >= 2 ? `<a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>` : '';
				return `<h${depth} id="${id}">${inner}${anchor}</h${depth}>\n`;
			},

			code({ text, lang: info }: Tokens.Code) {
				const { lang, title } = parseFence(info);
				const highlighted = highlighter.codeToHtml(text, { lang, theme: 'starlight' });
				const label = title ?? LANG_LABELS[lang] ?? '';
				const bar = label ? `<figcaption class="window-bar"><span class="file">${escapeHtml(label)}</span></figcaption>` : '';
				return `<figure class="code-window doc-code">${bar}${highlighted}</figure>\n`;
			},

			blockquote({ tokens }: Tokens.Blockquote) {
				const body = this.parser.parse(tokens);
				// GitHub-style alerts: > [!NOTE], > [!TIP], > [!WARNING] ...
				const alert = /^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/.exec(body);
				if (!alert) return `<blockquote>${body}</blockquote>\n`;
				const kind = alert[1];
				const rest = body.slice(alert[0].length);
				const content = rest.startsWith('</p>') ? rest.slice(4) : `<p>${rest}`;
				return `<div class="callout callout-${kind.toLowerCase()}"><p class="callout-title">${CALLOUTS[kind]}</p>${content}</div>\n`;
			},

			table(token: Tokens.Table) {
				// Let wide tables scroll on their own instead of widening the page.
				const head = token.header.map((cell) => `<th${cell.align ? ` style="text-align:${cell.align}"` : ''}>${this.parser.parseInline(cell.tokens)}</th>`).join('');
				const rows = token.rows
					.map((row) => `<tr>${row.map((cell) => `<td${cell.align ? ` style="text-align:${cell.align}"` : ''}>${this.parser.parseInline(cell.tokens)}</td>`).join('')}</tr>`)
					.join('');
				return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
			},

			link({ href, title, tokens }: Tokens.Link) {
				const text = this.parser.parseInline(tokens);
				const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
				if (href.startsWith('/docs')) {
					const path = href.replace(/^\/docs\/?/, '');
					return `<a href="${escapeHtml(options.resolveDocLink(path))}"${titleAttr}>${text}</a>`;
				}
				const external = /^https?:\/\//.test(href);
				return `<a href="${escapeHtml(href)}"${titleAttr}${external ? ' rel="noopener"' : ''}>${text}</a>`;
			}
		}
	});

	const html = await marked.parse(source);
	return { html, headings };
}
