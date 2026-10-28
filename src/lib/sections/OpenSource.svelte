<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import Starfield from '#lib/components/Starfield.svelte';
	import { getLocale, getMessages } from '#lib/i18n.ts';
	import { localizedHref } from '#lib/paths.ts';
	import { reveal } from '#lib/reveal.ts';

	const locale = $derived(getLocale());
	const t = $derived(getMessages());
</script>

<section id="open-source" class="section open-source night">
	<Starfield />
	<div class="container">
		<div class="content" use:reveal>
			<span class="mark"><Logo size={44} /></span>
			<h2 class="section-title">{t.openSource.title}</h2>
			<p class="section-lead">{t.openSource.body}</p>
			<div class="actions">
				<a class="button primary" href="https://github.com/mooner1022/StarLight" rel="noopener">
					<Icon name="github" size={18} />
					{t.openSource.github}
				</a>
				<a class="button ghost" href={localizedHref(locale, 'privacy')}>
					<Icon name="shield" size={18} />
					{t.openSource.privacy}
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.open-source {
		position: relative;
		overflow: hidden;
		text-align: center;
	}

	.content {
		position: relative;
		max-width: 620px;
		margin-inline: auto;
	}

	.mark {
		display: inline-grid;
		margin-bottom: 24px;
		color: var(--gold);
		filter: drop-shadow(0 0 24px rgb(223 193 153 / 0.5));
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
		margin-top: 32px;
	}
</style>
