<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Icon from '#lib/components/Icon.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import { getLocale, getMessages } from '#lib/i18n.ts';
	import { alternateHref, docsHref, localizedHref } from '#lib/paths.ts';

	const locale = $derived(getLocale());
	const t = $derived(getMessages());
	const home = $derived(localizedHref(locale));
	const docs = $derived(docsHref(locale));
	const inDocs = $derived(page.route.id?.includes('/docs/') ?? false);
	const otherLocaleHref = $derived(alternateHref(locale === 'ko' ? 'en' : 'ko'));

	const links = $derived([
		{ id: 'features', label: t.nav.features },
		{ id: 'code', label: t.nav.code },
		{ id: 'plugins', label: t.nav.plugins },
		{ id: 'download', label: t.nav.download }
	]);

	// Transparent over the night sky at the top, then a frosted bar once the page scrolls.
	let scrolled = $state(false);
	const updateScrolled = () => (scrolled = window.scrollY > 24);
	onMount(updateScrolled);
</script>

<svelte:window onscroll={updateScrolled} />

<a class="skip-link" href="#content">{t.nav.skip}</a>

<header class="site-header" class:on-night={!scrolled} class:scrolled>
	<div class="container bar" class:wide={inDocs}>
		<a class="brand" href="{home}#home" aria-label={t.nav.home}>
			<span class="brand-mark"><Logo size={22} /></span>
			<span class="brand-name">StarLight</span>
		</a>

		<nav aria-label="Primary">
			<ul>
				{#each links as link (link.id)}
					<li><a href="{home}#{link.id}">{link.label}</a></li>
				{/each}
				<li class="docs-link">
					<a href={docs} class:active={inDocs} aria-current={inDocs ? 'page' : undefined}>
						<Icon name="book" size={16} />
						{t.nav.docs}
					</a>
				</li>
			</ul>
		</nav>

		<div class="actions">
			<!-- The nav is hidden on small screens, so the docs keep a way in from the header. -->
			<a class="icon-button docs-button" href={docs} aria-label={t.nav.docs} title={t.nav.docs}>
				<Icon name="book" size={18} />
			</a>
			<a
				class="lang"
				href={otherLocaleHref}
				hreflang={locale === 'ko' ? 'en' : 'ko'}
				aria-label={t.nav.switchLangLabel}
				title={t.nav.switchLangLabel}
				data-sveltekit-noscroll
			>
				<Icon name="globe" size={16} />
				<span>{t.nav.switchLang}</span>
			</a>
			<a
				class="icon-button"
				href="https://github.com/mooner1022/StarLight"
				aria-label="GitHub"
				title="GitHub"
				rel="noopener"
			>
				<Icon name="github" size={18} />
			</a>
			<ThemeToggle />
		</div>
	</div>
</header>

<style>
	.skip-link {
		position: absolute;
		top: 12px;
		left: 12px;
		z-index: 100;
		padding: 10px 16px;
		border-radius: 999px;
		background: var(--gold);
		color: var(--gold-ink);
		font-weight: 600;
		transform: translateY(-200%);
		transition: transform 0.2s;
	}

	.skip-link:focus {
		transform: none;
	}

	.site-header {
		position: fixed;
		inset: 0 0 auto;
		z-index: 50;
		padding-block: 18px;
		border-bottom: 1px solid transparent;
		transition:
			padding 0.3s var(--ease),
			background-color 0.3s,
			border-color 0.3s,
			color 0.3s;
	}

	.site-header.scrolled {
		padding-block: 12px;
		border-bottom-color: var(--border);
		background: color-mix(in srgb, var(--bg) 80%, transparent);
		backdrop-filter: blur(14px) saturate(140%);
		-webkit-backdrop-filter: blur(14px) saturate(140%);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font-weight: 700;
		font-size: 1.0625rem;
		letter-spacing: 0.01em;
	}

	.brand-mark {
		display: inline-grid;
		color: var(--gold);
		transition: transform 0.6s var(--ease);
	}

	.brand:hover .brand-mark {
		transform: rotate(45deg);
	}

	nav {
		margin-left: auto;
	}

	nav ul {
		display: flex;
		gap: 4px;
		list-style: none;
	}

	nav a {
		display: block;
		padding: 8px 14px;
		border-radius: 999px;
		color: var(--text-muted);
		font-size: 0.9375rem;
		font-weight: 500;
		transition:
			color 0.2s,
			background-color 0.2s;
	}

	nav a:hover {
		color: var(--text);
		background: rgb(127 127 127 / 0.12);
	}

	.docs-link {
		margin-left: 6px;
		padding-left: 10px;
		border-left: 1px solid var(--border);
	}

	.docs-link a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.docs-link a.active {
		color: var(--accent);
		background: var(--accent-soft);
	}

	.docs-button {
		display: none;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.lang {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 40px;
		padding: 0 14px;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-muted);
		font-size: 0.875rem;
		font-weight: 600;
		transition:
			color 0.2s,
			border-color 0.2s,
			background-color 0.2s;
	}

	.lang:hover {
		color: var(--text);
		border-color: var(--border-strong);
		background: rgb(127 127 127 / 0.12);
	}

	@media (max-width: 860px) {
		nav {
			display: none;
		}

		.actions {
			margin-left: auto;
		}

		.docs-button {
			display: inline-grid;
		}
	}

	@media (max-width: 400px) {
		.brand-name {
			display: none;
		}
	}
</style>
