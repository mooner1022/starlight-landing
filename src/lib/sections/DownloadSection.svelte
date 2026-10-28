<script lang="ts">
	import Changelog from '#lib/components/Changelog.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { parseChangelog } from '#lib/changelog.ts';
	import { getMessages } from '#lib/i18n.ts';
	import { reveal } from '#lib/reveal.ts';
	import { CHANNELS, changelogPageUrl, PRIMARY_CHANNEL, type Versions } from '#lib/versions.ts';

	let {
		versions,
		changelog,
		onDownload
	}: {
		versions: Versions | null;
		changelog: string | null;
		onDownload: (url: string) => void;
	} = $props();

	const t = $derived(getMessages());
	const latest = $derived(changelog ? parseChangelog(changelog)[0] : undefined);
</script>

<!-- Laid out to fit one screen on desktop, so the section pages like the others instead of scrolling inside. -->
<section id="download" class="section alt">
	<div class="container">
		<header class="section-head" use:reveal>
			<p class="eyebrow">{t.download.eyebrow}</p>
			<h2 class="section-title">{t.download.title}</h2>
			<p class="section-lead">{t.download.lead}</p>
		</header>

		<div class="layout" class:single={!versions}>
			<div class="main">
				<ul class="channels">
					{#each CHANNELS as channel, i (channel)}
						{@const version = versions?.[channel]}
						{@const recommended = channel === PRIMARY_CHANNEL}
						<li class="channel" class:recommended use:reveal={i * 0.06}>
							<div class="channel-info">
								<div class="channel-head">
									<h3>{t.download.channels[channel].name}</h3>
									{#if recommended}<span class="badge">{t.download.recommended}</span>{/if}
									<code class="channel-version">{version ? `v${version.version}` : '—'}</code>
								</div>
								<p class="channel-body">{t.download.channels[channel].body}</p>
							</div>
							{#if version}
								<a
									class="button {recommended ? 'primary' : 'ghost'}"
									href={version.downloadUrl}
									onclick={() => onDownload(version.downloadUrl)}
								>
									<Icon name="download" size={18} />
									{t.download.get}
								</a>
							{/if}
						</li>
					{/each}
				</ul>
				{#if !versions}
					<p class="status">{t.download.unavailable}</p>
				{/if}

				<ol class="steps" use:reveal={0.18}>
					{#each t.download.steps as step, i (i)}
						<li>
							<span class="step-number">{i + 1}</span>
							<div>
								<h3>{step.title}</h3>
								<p>{step.body}</p>
							</div>
						</li>
					{/each}
				</ol>
			</div>

			{#if versions}
				<article class="changelog-card" use:reveal={0.12}>
					<header>
						<div>
							<p class="eyebrow">{t.download.changelogTitle}</p>
							{#if latest}<h3>{latest.title}</h3>{/if}
						</div>
						<a class="all" href={changelogPageUrl(versions[PRIMARY_CHANNEL])} rel="noopener">
							{t.download.changelogAll}
							<Icon name="external" size={16} />
						</a>
					</header>
					{#if t.download.changelogNote}<p class="note">{t.download.changelogNote}</p>{/if}
					<!-- Clipped to the card with a fade; the full history is one click away on GitHub. -->
					<div class="changelog-body">
						{#if latest}
							<Changelog release={latest} />
						{:else}
							<p class="note">{t.download.changelogUnavailable}</p>
						{/if}
					</div>
				</article>
			{/if}
		</div>
	</div>
</section>

<style>
	.alt {
		background: var(--bg-alt);
	}

	.section-head {
		margin-bottom: clamp(28px, 4vh, 44px);
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: 20px;
	}

	.layout.single {
		grid-template-columns: 1fr;
	}

	.main {
		display: grid;
		align-content: start;
		gap: 24px;
	}

	/* Channels */
	.channels {
		display: grid;
		gap: 10px;
		list-style: none;
	}

	.channel {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 18px 18px 18px 22px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: var(--shadow);
	}

	.channel.recommended {
		border-color: rgb(223 193 153 / 0.55);
		background:
			radial-gradient(120% 140% at 100% 0%, var(--accent-soft), transparent 60%),
			var(--surface);
	}

	.channel-info {
		flex: 1;
		min-width: 0;
	}

	.channel-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 10px;
	}

	.channel h3 {
		font-size: 1.0625rem;
		font-weight: 700;
	}

	.badge {
		padding: 2px 9px;
		border-radius: 999px;
		background: var(--gold);
		color: var(--gold-ink);
		font-size: 0.6875rem;
		font-weight: 700;
	}

	.channel-version {
		color: var(--accent);
		font-size: 0.8125rem;
	}

	.channel-body {
		margin-top: 2px;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.channel .button {
		flex-shrink: 0;
		min-height: 42px;
		padding: 0 18px;
		font-size: 0.9375rem;
	}

	.status {
		color: var(--text-muted);
	}

	/* Install steps */
	.steps {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.steps li {
		display: flex;
		gap: 12px;
	}

	.step-number {
		display: inline-grid;
		flex-shrink: 0;
		place-items: center;
		width: 28px;
		height: 28px;
		border: 1px solid var(--accent);
		border-radius: 50%;
		color: var(--accent);
		font-size: 0.8125rem;
		font-weight: 700;
	}

	.steps h3 {
		font-size: 0.9375rem;
		font-weight: 700;
		line-height: 1.75;
	}

	.steps p {
		margin-top: 2px;
		color: var(--text-muted);
		font-size: 0.8125rem;
		line-height: 1.55;
	}

	/* Changelog */
	.changelog-card {
		display: flex;
		flex-direction: column;
		padding: 24px 26px 0;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		/* Take the height of the channel column instead of growing with the changelog. */
		contain: size;
	}

	.changelog-card header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 8px 20px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--border);
	}

	.changelog-card .eyebrow {
		margin-bottom: 4px;
	}

	.changelog-card h3 {
		font-size: 1.125rem;
		font-weight: 700;
	}

	.all {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--accent);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.all:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.note {
		margin-top: 12px;
		color: var(--text-faint);
		font-size: 0.8125rem;
	}

	.changelog-body {
		flex: 1;
		min-height: 0;
		padding-top: 16px;
		overflow: hidden;
		mask-image: linear-gradient(180deg, #000 70%, transparent);
	}

	.changelog-body :global(.changelog) {
		font-size: 0.875rem;
	}

	@media (max-width: 960px) {
		.layout {
			grid-template-columns: 1fr;
		}

		.changelog-card {
			contain: none;
			max-height: 380px;
		}
	}

	@media (max-width: 600px) {
		.channel {
			flex-direction: column;
			align-items: stretch;
		}

		.steps {
			grid-template-columns: 1fr;
		}
	}
</style>
