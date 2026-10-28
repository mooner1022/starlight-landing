<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { getMessages } from '#lib/i18n.ts';
	import { reveal } from '#lib/reveal.ts';

	const t = $derived(getMessages());
</script>

<section id="features" class="section">
	<div class="container">
		<header class="section-head" use:reveal>
			<p class="eyebrow">{t.features.eyebrow}</p>
			<h2 class="section-title">{t.features.title}</h2>
			<p class="section-lead">{t.features.lead}</p>
		</header>

		<ul class="grid">
			{#each t.features.items as item, i (item.icon)}
				<li class="card" use:reveal={(i % 3) * 0.08}>
					<span class="icon"><Icon name={item.icon} size={22} /></span>
					<h3>{item.title}</h3>
					<p>{item.body}</p>
				</li>
			{/each}
		</ul>

		<div class="extras" use:reveal>
			<span class="label">{t.features.extrasLabel}</span>
			<ul>
				{#each t.features.extras as extra (extra)}
					<li>{extra}</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
		list-style: none;
	}

	.card {
		position: relative;
		padding: 28px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: var(--shadow);
		transition:
			border-color 0.25s,
			background-color 0.25s,
			opacity 0.7s var(--ease) var(--reveal-delay, 0s),
			transform 0.7s var(--ease) var(--reveal-delay, 0s);
	}

	.card:hover {
		border-color: var(--border-strong);
		background: var(--surface-hover);
	}

	.icon {
		display: inline-grid;
		place-items: center;
		width: 48px;
		height: 48px;
		margin-bottom: 20px;
		border-radius: 14px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	h3 {
		font-size: 1.1875rem;
		font-weight: 700;
	}

	.card p {
		margin-top: 8px;
		color: var(--text-muted);
		font-size: 0.9625rem;
	}

	.extras {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 16px;
		margin-top: 28px;
	}

	.label {
		color: var(--text-faint);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.extras ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		list-style: none;
	}

	.extras li {
		padding: 6px 14px;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	@media (max-width: 960px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 600px) {
		.grid {
			grid-template-columns: 1fr;
		}

		.card {
			padding: 24px;
		}
	}
</style>
