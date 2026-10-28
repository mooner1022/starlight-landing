<script lang="ts">
	import { onMount } from 'svelte';
	import { createSectionPager } from '#lib/section-pager.ts';

	let { sections, label }: { sections: { id: string; label: string }[]; label: string } = $props();

	let active = $state(0);

	onMount(() => {
		const elements = sections
			.map((section) => document.getElementById(section.id))
			.filter((element) => element !== null);
		const pager = createSectionPager(elements, (index) => (active = index));
		return () => pager.destroy();
	});
</script>

<!-- Links are plain anchors so they work without JS; the pager turns them into glides. -->
<nav class="indicator" aria-label={label}>
	<ol>
		{#each sections as section, i (section.id)}
			<li>
				<a href="#{section.id}" class:active={i === active} aria-current={i === active ? 'location' : undefined}>
					<span class="label">{section.label}</span>
					<span class="marker" aria-hidden="true"></span>
				</a>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.indicator {
		position: fixed;
		top: 50%;
		right: clamp(12px, 2vw, 28px);
		z-index: 40;
		translate: 0 -50%;
	}

	ol {
		display: grid;
		gap: 2px;
		margin: 0;
		padding: 8px 6px;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: color-mix(in srgb, var(--bg) 62%, transparent);
		backdrop-filter: blur(10px);
		list-style: none;
	}

	a {
		position: relative;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
	}

	.marker {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-faint);
		transition:
			width 0.35s var(--ease),
			height 0.35s var(--ease),
			border-radius 0.35s var(--ease),
			rotate 0.35s var(--ease),
			background-color 0.35s,
			box-shadow 0.35s;
	}

	a:hover .marker {
		background: var(--text-muted);
	}

	/* The current section becomes a small gold diamond, a nod to the star in the logo. */
	a.active .marker {
		width: 10px;
		height: 10px;
		border-radius: 2px;
		rotate: 45deg;
		/* Pure gold in dark mode; deepened toward the light theme's accent so it holds up on paper. */
		background: color-mix(in srgb, var(--gold) 55%, var(--accent));
		box-shadow: 0 0 12px rgb(223 193 153 / 0.65);
	}

	.label {
		position: absolute;
		right: calc(100% + 14px);
		padding: 4px 10px;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--surface);
		color: var(--text);
		font-size: 0.8125rem;
		font-weight: 600;
		white-space: nowrap;
		box-shadow: var(--shadow);
		opacity: 0;
		translate: 6px 0;
		pointer-events: none;
		transition:
			opacity 0.2s,
			translate 0.2s var(--ease);
	}

	a:hover .label,
	a:focus-visible .label {
		opacity: 1;
		translate: 0 0;
	}

	@media (max-width: 860px) {
		.indicator {
			display: none;
		}
	}
</style>
