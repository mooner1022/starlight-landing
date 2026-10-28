<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import Starfield from '#lib/components/Starfield.svelte';
	import { getLocale, getMessages } from '#lib/i18n.ts';
	import { localizedHref } from '#lib/paths.ts';

	const locale = $derived(getLocale());
	const t = $derived(getMessages());
</script>

<svelte:head>
	<title>{t.meta.privacyTitle}</title>
	<meta name="description" content={t.privacy.body} />
</svelte:head>

<section class="banner night">
	<Starfield />
	<div class="container">
		<p class="eyebrow">{t.privacy.eyebrow}</p>
		<h1>{t.privacy.title}</h1>
	</div>
</section>

<section class="container content">
	<div class="card">
		<span class="icon"><Icon name="shield" size={22} /></span>
		<p>{t.privacy.body}</p>
	</div>
	<a class="back" href={localizedHref(locale)}>
		<span class="arrow"><Icon name="arrowRight" size={18} /></span>
		{t.privacy.back}
	</a>
</section>

<style>
	.banner {
		position: relative;
		overflow: hidden;
		padding: 148px 0 64px;
	}

	.banner .container {
		position: relative;
	}

	h1 {
		max-width: 20em;
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 800;
	}

	.content {
		max-width: 760px;
		padding-block: 56px 96px;
	}

	.card {
		display: flex;
		gap: 20px;
		padding: clamp(24px, 4vw, 36px);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: var(--shadow);
		font-size: 1.0625rem;
	}

	.icon {
		display: inline-grid;
		flex-shrink: 0;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 32px;
		color: var(--accent);
		font-weight: 600;
	}

	.arrow {
		display: inline-grid;
		rotate: 180deg;
	}

	.back:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
