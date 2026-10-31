<script lang="ts">
	import { onMount } from 'svelte';
	import { getMessages } from '#lib/i18n.ts';
	import type { DocHeading } from '#lib/docs/types.ts';

	let { headings }: { headings: DocHeading[] } = $props();

	const t = $derived(getMessages());
	let active = $state('');

	// Highlights the last heading that has scrolled past the fixed header.
	function update() {
		let current = headings[0]?.id ?? '';
		for (const heading of headings) {
			const element = document.getElementById(heading.id);
			if (element && element.getBoundingClientRect().top <= 120) current = heading.id;
		}
		active = current;
	}

	onMount(() => {
		let frame = 0;
		const onScroll = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(update);
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		update();
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
		};
	});

	$effect(() => {
		// Recompute when client-side navigation swaps the page.
		void headings;
		update();
	});
</script>

{#if headings.length > 1}
	<nav class="toc" aria-label={t.docs.onThisPage}>
		<p class="toc-title">{t.docs.onThisPage}</p>
		<ul>
			{#each headings as heading (heading.id)}
				<li class:sub={heading.depth === 3}>
					<a href="#{heading.id}" class:active={heading.id === active}>{heading.text}</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	.toc {
		position: sticky;
		top: 88px;
		max-height: calc(100vh - 112px);
		overflow-y: auto;
		scrollbar-width: thin;
	}

	.toc-title {
		margin-bottom: 10px;
		color: var(--text-faint);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	ul {
		border-left: 1px solid var(--border);
		list-style: none;
	}

	a {
		display: block;
		margin-left: -1px;
		padding: 4px 0 4px 14px;
		border-left: 1px solid transparent;
		color: var(--text-faint);
		font-size: 0.8125rem;
		line-height: 1.5;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	.sub a {
		padding-left: 26px;
	}

	a:hover {
		color: var(--text);
	}

	a.active {
		border-left-color: var(--gold);
		color: var(--accent);
	}
</style>
