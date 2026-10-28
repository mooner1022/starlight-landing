<script lang="ts">
	import type { Inline, ListItem, Release } from '#lib/changelog.ts';

	let { release }: { release: Release } = $props();
</script>

{#snippet inline(parts: Inline[])}
	{#each parts as part, i (i)}{#if part.code}<code>{part.text}</code>{:else}{part.text}{/if}{/each}
{/snippet}

{#snippet list(items: ListItem[])}
	<ul>
		{#each items as item, i (i)}
			<li>
				{@render inline(item.content)}
				{#if item.children.length}{@render list(item.children)}{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<div class="changelog">
	{#each release.blocks as block, i (i)}
		{#if block.type === 'heading'}
			<h4>{@render inline(block.content)}</h4>
		{:else if block.type === 'list'}
			{@render list(block.items)}
		{:else}
			<p>
				{#each block.lines as line, j (j)}{#if j > 0}<br />{/if}{@render inline(line)}{/each}
			</p>
		{/if}
	{/each}
</div>

<style>
	.changelog {
		color: var(--text-muted);
		font-size: 0.9375rem;
	}

	h4 {
		margin: 20px 0 8px;
		color: var(--text);
		font-size: 0.9375rem;
		font-weight: 700;
	}

	h4:first-child {
		margin-top: 0;
	}

	ul {
		display: grid;
		gap: 6px;
		padding-left: 20px;
	}

	ul ul {
		margin-top: 6px;
	}

	li::marker {
		color: var(--accent);
	}

	p {
		margin-top: 8px;
	}

	code {
		padding: 1px 6px;
		border-radius: 6px;
		background: var(--accent-soft);
		color: var(--text);
		font-size: 0.85em;
	}
</style>
