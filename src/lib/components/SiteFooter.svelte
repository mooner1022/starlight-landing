<script lang="ts">
	import { page } from '$app/state';
	import Logo from '#lib/components/Logo.svelte';
	import { getLocale, getMessages } from '#lib/i18n.ts';
	import { docsHref, localizedHref } from '#lib/paths.ts';

	const locale = $derived(getLocale());
	const t = $derived(getMessages());
	// Lines up with the docs' wider layout.
	const inDocs = $derived(page.route.id?.includes('/docs/') ?? false);
</script>

<footer class="site-footer">
	<div class="container inner" class:wide={inDocs}>
		<div class="brand">
			<span class="mark"><Logo size={18} /></span>
			<strong>StarLight</strong>
			<span class="by">by <a href="https://profile.mooner.dev">mooner.dev</a> with ❤ and ☕</span>
		</div>

		<nav class="links" aria-label="Footer">
			<a href="https://github.com/mooner1022/StarLight" rel="noopener">GitHub</a>
			<a href={docsHref(locale)}>{t.nav.docs}</a>
			<a href="https://github.com/mooner1022/starlight-landing" rel="noopener">{t.footer.websiteSource}</a>
			<a href={localizedHref(locale, 'privacy')}>{t.footer.privacy}</a>
		</nav>

		<p class="license">
			{t.footer.licenseBefore}<a href="https://www.gnu.org/licenses/gpl-3.0.html" rel="license noopener"
				>GPL-3.0</a
			>{t.footer.licenseMiddle}<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license noopener"
				>CC BY-NC-SA 4.0</a
			>{t.footer.licenseAfter}
		</p>
	</div>
</footer>

<style>
	.site-footer {
		border-top: 1px solid var(--border);
		background: var(--bg-alt);
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.inner {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 16px 32px;
		padding-block: 40px;
	}

	.brand {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	.brand strong {
		color: var(--text);
	}

	.mark {
		display: inline-grid;
		color: var(--accent);
	}

	.by a,
	.license a {
		color: var(--accent);
	}

	.by a:hover,
	.license a:hover,
	.links a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
	}

	.license {
		grid-column: 1 / -1;
		color: var(--text-faint);
	}

	@media (max-width: 640px) {
		.inner {
			grid-template-columns: 1fr;
		}
	}
</style>
