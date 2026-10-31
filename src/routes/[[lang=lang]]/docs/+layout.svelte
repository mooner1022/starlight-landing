<script lang="ts">
	import { page } from '$app/state';
	import Starfield from '#lib/components/Starfield.svelte';
	import DocsSidebar from '#lib/docs/DocsSidebar.svelte';
	import { getMessages } from '#lib/i18n.ts';
	import type { DocPage } from '#lib/docs/types.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const t = $derived(getMessages());
	// The banner sits above the sidebar, so it reads the current page from the child route's data.
	const doc = $derived(page.data.doc as DocPage | undefined);
</script>

<section class="banner night">
	<Starfield />
	<div class="container wide">
		<p class="eyebrow">{doc && doc.slug ? t.docs.sections[doc.section] : t.docs.title}</p>
		<h1>{doc?.title ?? t.docs.title}</h1>
		{#if doc?.description}<p class="lead">{doc.description}</p>{/if}
	</div>
</section>

<div class="container wide docs">
	<DocsSidebar nav={data.nav} current={doc?.slug ?? ''} />
	<div class="docs-main">
		{@render children()}
	</div>
</div>

<style>
	.banner {
		position: relative;
		overflow: hidden;
		padding: 132px 0 48px;
	}

	.banner .container {
		position: relative;
	}

	h1 {
		max-width: 22em;
		font-size: clamp(1.75rem, 3.6vw, 2.5rem);
		font-weight: 800;
	}

	.lead {
		max-width: 44em;
		margin-top: 12px;
		color: var(--text-muted);
		font-size: clamp(1rem, 1.5vw, 1.0625rem);
	}

	.docs {
		display: grid;
		grid-template-columns: 248px minmax(0, 1fr);
		align-items: start;
		gap: clamp(32px, 3vw, 48px);
		padding-block: 40px 96px;
	}

	@media (max-width: 960px) {
		.banner {
			padding: 112px 0 36px;
		}

		.docs {
			grid-template-columns: 1fr;
			gap: 28px;
			padding-top: 24px;
		}
	}
</style>
