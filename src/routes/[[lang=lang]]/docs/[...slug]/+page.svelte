<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import DocsToc from '#lib/docs/DocsToc.svelte';
	import SdkDownloads from '#lib/docs/SdkDownloads.svelte';
	import { codeCopy } from '#lib/docs/code-copy.ts';
	import { getLocale, getMessages } from '#lib/i18n.ts';
	import { docsHref } from '#lib/paths.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(getLocale());
	const t = $derived(getMessages());
	const doc = $derived(data.doc);
	const isFallback = $derived(doc.contentLocale !== locale);
</script>

<svelte:head>
	<title>{doc.title} — {t.docs.metaSuffix}</title>
	{#if doc.description}<meta name="description" content={doc.description} />{/if}
</svelte:head>

<div class="page">
	<article lang={doc.contentLocale}>
		{#if isFallback && t.docs.fallback}
			<p class="fallback" lang={locale}>{t.docs.fallback}</p>
		{/if}

		{#if doc.layout === 'sdk'}
			<SdkDownloads />
		{/if}

		<!-- Markdown from src/docs, rendered at build time. -->
		<div class="prose" use:codeCopy={{ copy: t.docs.copy, copied: t.docs.copied, key: doc.slug }}>
			{@html doc.html}
		</div>

		<footer class="doc-footer">
			<a class="edit" href={doc.editUrl} rel="noopener">
				<Icon name="edit" size={16} />
				{t.docs.edit}
			</a>
			<nav class="pager" aria-label="{t.docs.prev} / {t.docs.next}">
				{#if doc.prev}
					<a class="prev" href={docsHref(locale, doc.prev.slug)}>
						<span class="dir">{t.docs.prev}</span>
						<span class="title">{doc.prev.title}</span>
					</a>
				{/if}
				{#if doc.next}
					<a class="next" href={docsHref(locale, doc.next.slug)}>
						<span class="dir">{t.docs.next}</span>
						<span class="title">{doc.next.title}</span>
					</a>
				{/if}
			</nav>
		</footer>
	</article>

	<aside class="toc-column">
		<DocsToc headings={doc.toc} />
	</aside>
</div>

<style>
	.page {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 220px;
		align-items: start;
		gap: clamp(32px, 3vw, 48px);
	}

	/* Fills the column; the cap only matters when the table of contents is hidden. */
	article {
		min-width: 0;
		max-width: 920px;
	}

	.fallback {
		margin-bottom: 24px;
		padding: 12px 16px;
		border: 1px dashed var(--border-strong);
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	/* ---------- Rendered markdown ---------- */
	.prose {
		color: var(--text);
		font-size: 1rem;
		line-height: 1.8;
	}

	.prose :global(:is(h2, h3, h4)) {
		position: relative;
		/* Clears the fixed header when jumping to an anchor. */
		scroll-margin-top: 96px;
		font-weight: 700;
	}

	.prose :global(h2) {
		margin: 56px 0 16px;
		padding-top: 24px;
		border-top: 1px solid var(--border);
		font-size: 1.5rem;
	}

	.prose :global(> h2:first-child) {
		margin-top: 0;
		padding-top: 0;
		border-top: 0;
	}

	.prose :global(h3) {
		margin: 36px 0 12px;
		font-size: 1.1875rem;
	}

	.prose :global(h4) {
		margin: 28px 0 8px;
		font-size: 1.0625rem;
	}

	.prose :global(.anchor) {
		margin-left: 8px;
		color: var(--text-faint);
		font-weight: 400;
		opacity: 0;
		transition: opacity 0.15s;
	}

	.prose :global(:is(h2, h3, h4):hover .anchor) {
		opacity: 1;
	}

	.prose :global(p),
	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 16px;
	}

	.prose :global(:is(ul, ol)) {
		padding-left: 22px;
	}

	.prose :global(li + li) {
		margin-top: 4px;
	}

	.prose :global(li::marker) {
		color: var(--accent);
	}

	.prose :global(a:not(.anchor)) {
		color: var(--accent);
		text-decoration: underline;
		text-decoration-color: rgb(223 193 153 / 0.4);
		text-underline-offset: 3px;
	}

	.prose :global(a:not(.anchor):hover) {
		text-decoration-color: currentColor;
	}

	.prose :global(strong) {
		font-weight: 700;
	}

	.prose :global(:not(pre) > code) {
		padding: 2px 6px;
		border-radius: 6px;
		background: var(--accent-soft);
		color: var(--text);
		font-size: 0.875em;
		word-break: break-word;
	}

	.prose :global(hr) {
		margin: 40px 0;
		border: 0;
		border-top: 1px solid var(--border);
	}

	.prose :global(blockquote) {
		margin: 0 0 16px;
		padding: 2px 0 2px 16px;
		border-left: 3px solid var(--border-strong);
		color: var(--text-muted);
	}

	/* Code blocks reuse the landing page's code window. */
	.prose :global(.doc-code) {
		margin: 0 0 20px;
	}

	.prose :global(.doc-code .window-bar) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 40px;
		padding: 6px 8px 6px 18px;
		border-bottom: 1px solid rgb(255 255 255 / 0.07);
		background: rgb(255 255 255 / 0.02);
	}

	.prose :global(.doc-code .file) {
		color: #9aa0bb;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}

	.prose :global(.doc-code pre) {
		padding: 16px 20px 18px;
		font-size: 0.84rem;
		line-height: 1.7;
	}

	.prose :global(.copy-button) {
		margin-left: auto;
		padding: 4px 10px;
		border: 1px solid rgb(255 255 255 / 0.12);
		border-radius: 999px;
		background: transparent;
		color: #9aa0bb;
		font: inherit;
		font-size: 0.75rem;
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	.prose :global(.copy-button:hover) {
		color: #e6e2da;
		border-color: rgb(255 255 255 / 0.24);
	}

	.prose :global(.copy-button.done) {
		color: var(--gold);
		border-color: rgb(223 193 153 / 0.5);
	}

	/* Tables scroll inside their wrapper on narrow screens. */
	.prose :global(.table-wrap) {
		margin: 0 0 20px;
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	.prose :global(table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.prose :global(:is(th, td)) {
		padding: 10px 14px;
		border-bottom: 1px solid var(--border);
		text-align: left;
		vertical-align: top;
	}

	.prose :global(th) {
		background: var(--bg-alt);
		color: var(--text-muted);
		font-size: 0.8125rem;
		font-weight: 700;
		white-space: nowrap;
	}

	.prose :global(tr:last-child td) {
		border-bottom: 0;
	}

	.prose :global(td code) {
		white-space: nowrap;
	}

	/* Callouts: > [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION] */
	.prose :global(.callout) {
		--callout: #9aa3e6;
		margin: 0 0 20px;
		padding: 14px 18px;
		border: 1px solid color-mix(in srgb, var(--callout) 30%, transparent);
		border-left: 3px solid var(--callout);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--callout) 8%, transparent);
	}

	.prose :global(.callout-tip) {
		--callout: #5fcf8f;
	}

	.prose :global(.callout-important) {
		--callout: var(--gold);
	}

	.prose :global(.callout-warning) {
		--callout: var(--dusk);
	}

	.prose :global(.callout-caution) {
		--callout: #ff6b8a;
	}

	.prose :global(.callout-title) {
		margin-bottom: 4px;
		color: color-mix(in srgb, var(--callout) 70%, var(--text));
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.04em;
	}

	.prose :global(.callout > :last-child) {
		margin-bottom: 0;
	}

	/* ---------- Footer ---------- */
	.doc-footer {
		margin-top: 56px;
		padding-top: 24px;
		border-top: 1px solid var(--border);
	}

	.edit {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.edit:hover {
		color: var(--accent);
	}

	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-top: 24px;
	}

	.pager a {
		display: grid;
		gap: 2px;
		padding: 14px 18px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		transition: border-color 0.2s;
	}

	.pager a:hover {
		border-color: rgb(223 193 153 / 0.55);
	}

	.next {
		grid-column: 2;
		text-align: right;
	}

	.dir {
		color: var(--text-faint);
		font-size: 0.8125rem;
	}

	.dir::before {
		content: '← ';
	}

	.next .dir::before {
		content: '';
	}

	.next .dir::after {
		content: ' →';
	}

	.title {
		color: var(--accent);
		font-weight: 600;
	}

	@media (max-width: 1180px) {
		.page {
			grid-template-columns: minmax(0, 1fr);
		}

		.toc-column {
			display: none;
		}
	}

	@media (max-width: 560px) {
		.pager {
			grid-template-columns: 1fr;
		}

		.next {
			grid-column: auto;
		}
	}
</style>
