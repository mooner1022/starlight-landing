<script lang="ts">
	import mockup from '#lib/assets/mockup.png?enhanced';
	import Icon from '#lib/components/Icon.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import Starfield from '#lib/components/Starfield.svelte';
	import { getMessages } from '#lib/i18n.ts';
	import { PRIMARY_CHANNEL, type Versions } from '#lib/versions.ts';

	let {
		versions,
		onChoose
	}: { versions: Versions | null; onChoose: (versions: Versions) => void } = $props();

	const t = $derived(getMessages());
	const primary = $derived(versions?.[PRIMARY_CHANNEL]);
</script>

<section id="home" class="hero night screen">
	<Starfield />
	<div class="container grid">
		<div class="copy">
			<p class="eyebrow">{t.hero.eyebrow}</p>
			<h1>
				<span>{t.hero.title[0]}</span>
				<span class="accent">{t.hero.title[1]}</span>
			</h1>
			<p class="lead">{t.hero.lead}</p>

			<div class="cta">
				{#if versions && primary}
					<!-- Falls back to the channel list in the download section when JS hasn't loaded. -->
					<a
						class="button primary download"
						href="#download"
						aria-haspopup="dialog"
						onclick={(event) => {
							event.preventDefault();
							onChoose(versions);
						}}
					>
						<Icon name="download" size={20} />
						<span>{t.hero.download}</span>
						<span class="version">v{primary.version} · {t.download.channels[PRIMARY_CHANNEL].name}</span>
					</a>
				{:else}
					<a class="button primary download" href="https://github.com/mooner1022/StarLight" rel="noopener">
						<Icon name="github" size={20} />
						<span>{t.hero.unavailable}</span>
					</a>
				{/if}
				<a class="button ghost" href="https://github.com/mooner1022/StarLight" rel="noopener">
					<Icon name="code" size={18} />
					<span>{t.hero.source}</span>
				</a>
			</div>

			<p class="note">
				<Icon name="smartphone" size={16} />
				{t.hero.note}
			</p>
		</div>

		<div class="visual">
			<div class="halo" aria-hidden="true"><Logo size={520} /></div>
			<enhanced:img
				src={mockup}
				alt={t.hero.mockupAlt}
				sizes="(min-width: 1100px) 680px, (min-width: 860px) 52vw, 94vw"
				fetchpriority="high"
			/>
		</div>
	</div>

	<a class="scroll-hint" href="#features">
		<span>{t.hero.scroll}</span>
		<span class="track" aria-hidden="true"><span class="meteor"></span></span>
	</a>
</section>

<style>
	.hero {
		position: relative;
		overflow: hidden;
		padding-top: clamp(112px, 14vw, 160px);
		padding-bottom: clamp(112px, 14vh, 150px);
	}

	/* A shooting star falls down a faint track to hint that the page continues below. */
	.scroll-hint {
		position: absolute;
		left: 50%;
		bottom: clamp(20px, 4vh, 36px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		color: var(--text-faint);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		translate: -50% 0;
		transition: color 0.2s;
		animation: hint-in 0.8s var(--ease) 1.2s both;
	}

	.scroll-hint:hover {
		color: var(--text-muted);
	}

	.track {
		position: relative;
		width: 6px;
		height: 48px;
		overflow: hidden;
	}

	.track::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 50%;
		width: 1px;
		background: linear-gradient(180deg, rgb(255 255 255 / 0.22), rgb(255 255 255 / 0.04));
	}

	.meteor {
		position: absolute;
		top: -18px;
		left: 0;
		width: 6px;
		height: 18px;
		border-radius: 999px;
		background: linear-gradient(180deg, transparent, var(--gold));
		box-shadow: 0 6px 10px -2px rgb(223 193 153 / 0.6);
		animation: fall 2s cubic-bezier(0.55, 0, 0.45, 1) 2s infinite;
	}

	@keyframes hint-in {
		from {
			opacity: 0;
			translate: -50% -8px;
		}
	}

	@keyframes fall {
		0% {
			transform: translateY(0);
			opacity: 0;
		}
		15%,
		75% {
			opacity: 1;
		}
		100% {
			transform: translateY(66px);
			opacity: 0;
		}
	}

	@media (max-height: 620px) {
		.scroll-hint {
			display: none;
		}
	}

	.hero::after {
		/* Soft horizon line where the night sky meets the page */
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgb(223 193 153 / 0.35), transparent);
	}

	.grid {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: center;
		gap: clamp(32px, 5vw, 64px);
	}

	h1 {
		display: flex;
		flex-direction: column;
		font-size: clamp(2.25rem, 4.6vw, 3.25rem);
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.035em;
	}

	.accent {
		background: linear-gradient(100deg, #f4e2c4 0%, var(--gold) 45%, var(--dusk) 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.lead {
		max-width: 30em;
		margin-top: 22px;
		color: var(--text-muted);
		font-size: clamp(1.0625rem, 1.8vw, 1.25rem);
	}

	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 36px;
	}

	.download {
		min-height: 56px;
		padding: 0 10px 0 24px;
		font-size: 1.0625rem;
	}

	.download .version {
		padding: 6px 12px;
		border-radius: 999px;
		background: rgb(30 23 9 / 0.12);
		font-size: 0.8125rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.download:not(:has(.version)) {
		padding-right: 24px;
	}

	.cta .ghost {
		min-height: 56px;
	}

	.note {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 20px;
		color: var(--text-faint);
		font-size: 0.875rem;
	}

	.visual {
		position: relative;
		display: grid;
		place-items: center;
		margin-right: calc(var(--gutter) * -1);
	}

	.visual :global(img) {
		position: relative;
		width: 100%;
		height: auto;
		filter: drop-shadow(0 40px 60px rgb(0 0 0 / 0.45));
		animation: rise 1.1s var(--ease) both;
	}

	.halo {
		position: absolute;
		display: grid;
		place-items: center;
		color: var(--gold);
		opacity: 0.07;
		animation: spin 120s linear infinite;
	}

	.halo::before {
		content: '';
		position: absolute;
		width: 70%;
		height: 70%;
		border-radius: 50%;
		background: radial-gradient(circle, rgb(223 193 153 / 0.9), transparent 70%);
		filter: blur(40px);
	}

	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
	}

	@media (max-width: 860px) {
		.grid {
			grid-template-columns: 1fr;
		}

		.visual {
			margin-right: 0;
		}

		.halo :global(svg) {
			width: 360px;
			height: 360px;
		}
	}

	@media (max-width: 480px) {
		.cta {
			flex-direction: column;
		}

		.cta .button {
			width: 100%;
		}

		.download {
			justify-content: space-between;
		}
	}
</style>
