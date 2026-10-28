<script lang="ts">
	import { page } from '$app/state';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { localizedHref, type PageKey } from '#lib/paths.ts';

	let { children } = $props();

	const SITE_ORIGIN = 'https://starlight.mooner.dev';
	const current: PageKey = $derived(page.route.id?.endsWith('/app-privacy') ? 'privacy' : 'home');
	// Prerendered links are relative, so resolve them against the page URL before making them absolute.
	const absolute = (href: string) => SITE_ORIGIN + new URL(href, page.url.href).pathname;
</script>

<svelte:head>
	<link rel="alternate" hreflang="ko" href={absolute(localizedHref('ko', current))} />
	<link rel="alternate" hreflang="en" href={absolute(localizedHref('en', current))} />
	<link rel="alternate" hreflang="x-default" href={absolute(localizedHref('ko', current))} />
</svelte:head>

<SiteHeader />
<main id="content">
	{@render children()}
</main>
<SiteFooter />
