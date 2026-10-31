<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import Icon from '#lib/components/Icon.svelte';
	import { getLocale, getMessages } from '#lib/i18n.ts';
	import { docsHref } from '#lib/paths.ts';
	import type { DocNavSection } from '#lib/docs/types.ts';

	let { nav, current }: { nav: DocNavSection[]; current: string } = $props();

	const locale = $derived(getLocale());
	const t = $derived(getMessages());

	let query = $state('');
	const normalized = $derived(query.trim().toLowerCase());

	// Matches page titles, descriptions and headings; heading hits link straight to their anchor.
	const results = $derived.by(() => {
		if (!normalized) return [];
		return nav
			.flatMap((section) => section.pages)
			.map((page) => {
				const pageHit =
					page.title.toLowerCase().includes(normalized) || page.description.toLowerCase().includes(normalized);
				const headings = page.headings.filter((heading) => heading.text.toLowerCase().includes(normalized));
				return { page, pageHit, headings: headings.slice(0, 4) };
			})
			.filter(({ pageHit, headings }) => pageHit || headings.length > 0);
	});

	// On small screens the nav folds into a <details>; it starts open so it works without JS.
	let details: HTMLDetailsElement;
	const wide = () => matchMedia('(min-width: 961px)').matches;
	onMount(() => {
		details.open = wide();
		const media = matchMedia('(min-width: 961px)');
		const sync = () => (details.open = media.matches);
		media.addEventListener('change', sync);
		return () => media.removeEventListener('change', sync);
	});
	afterNavigate(() => {
		query = '';
		if (details && !wide()) details.open = false;
	});
</script>

<details class="sidebar" bind:this={details} open>
	<summary>
		<Icon name="book" size={16} />
		<span>{t.docs.navLabel}</span>
		<span class="chevron"><Icon name="chevronDown" size={16} /></span>
	</summary>

	<nav aria-label={t.docs.navLabel}>
		<label class="search">
			<Icon name="search" size={16} />
			<input type="search" bind:value={query} placeholder={t.docs.search} aria-label={t.docs.search} />
		</label>

		{#if normalized}
			{#if results.length}
				<ul class="results">
					{#each results as { page, headings } (page.slug)}
						<li>
							<a href={docsHref(locale, page.slug)} class="result-page">{page.title}</a>
							{#if headings.length}
								<ul>
									{#each headings as heading (heading.id)}
										<li><a href="{docsHref(locale, page.slug)}#{heading.id}">{heading.text}</a></li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="empty">{t.docs.noResults}</p>
			{/if}
		{:else}
			{#each nav as section (section.id)}
				<div class="group">
					<p class="group-title">{t.docs.sections[section.id]}</p>
					<ul>
						{#each section.pages as page (page.slug)}
							<li>
								<a
									href={docsHref(locale, page.slug)}
									class:active={page.slug === current}
									aria-current={page.slug === current ? 'page' : undefined}
								>
									{page.title}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		{/if}
	</nav>
</details>

<style>
	.sidebar {
		position: sticky;
		top: 88px;
		max-height: calc(100vh - 112px);
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
	}

	summary {
		display: none;
	}

	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 20px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text-faint);
		transition: border-color 0.2s;
	}

	.search:focus-within {
		border-color: rgb(223 193 153 / 0.6);
	}

	.search input {
		flex: 1;
		min-width: 0;
		height: 38px;
		border: 0;
		background: transparent;
		color: var(--text);
		font: inherit;
		font-size: 0.875rem;
		outline: none;
	}

	.group + .group {
		margin-top: 22px;
	}

	.group-title {
		margin-bottom: 6px;
		padding-left: 12px;
		color: var(--text-faint);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	ul {
		list-style: none;
	}

	.group a,
	.result-page {
		display: block;
		padding: 6px 12px;
		border-radius: 8px;
		color: var(--text-muted);
		font-size: 0.9rem;
		line-height: 1.45;
		transition:
			color 0.15s,
			background-color 0.15s;
	}

	.group a:hover,
	.result-page:hover {
		color: var(--text);
		background: rgb(127 127 127 / 0.1);
	}

	/* The current page gets the gold diamond used by the landing page's section indicator. */
	.group a.active {
		position: relative;
		color: var(--accent);
		background: var(--accent-soft);
		font-weight: 600;
	}

	.group a.active::before {
		content: '';
		position: absolute;
		top: 50%;
		left: -2px;
		width: 6px;
		height: 6px;
		border-radius: 1px;
		background: var(--gold);
		transform: translateY(-50%) rotate(45deg);
	}

	.results > li + li {
		margin-top: 8px;
	}

	.result-page {
		color: var(--text);
		font-weight: 600;
	}

	.results ul a {
		display: block;
		margin-left: 12px;
		padding: 4px 12px;
		border-left: 1px solid var(--border);
		color: var(--text-muted);
		font-size: 0.8125rem;
	}

	.results ul a:hover {
		color: var(--accent);
	}

	.empty {
		padding: 0 12px;
		color: var(--text-faint);
		font-size: 0.875rem;
	}

	@media (max-width: 960px) {
		.sidebar {
			position: static;
			max-height: none;
			overflow: visible;
			border: 1px solid var(--border);
			border-radius: var(--radius);
			background: var(--surface);
		}

		summary {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 14px 16px;
			color: var(--text);
			font-weight: 600;
			list-style: none;
			cursor: pointer;
		}

		summary::-webkit-details-marker {
			display: none;
		}

		.chevron {
			display: inline-grid;
			margin-left: auto;
			transition: rotate 0.2s;
		}

		.sidebar[open] .chevron {
			rotate: 180deg;
		}

		nav {
			padding: 4px 12px 16px;
		}
	}
</style>
