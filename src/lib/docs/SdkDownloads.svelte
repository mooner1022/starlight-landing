<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { getMessages } from '#lib/i18n.ts';
	import { SDK_BUILD_COMMAND, SDK_RELEASE } from '#lib/docs/sdk.ts';

	const t = $derived(getMessages());
</script>

<!-- A preview: downloads aren't hosted yet, so artifacts without a url render as disabled. -->
<section class="sdk" aria-labelledby="sdk-title">
	<header>
		<div>
			<p class="eyebrow">{t.docs.sdk.title}</p>
			<h2 id="sdk-title">PluginCore {SDK_RELEASE.version}</h2>
		</div>
		<span class="channel">{t.docs.sdk.channel} · {SDK_RELEASE.date}</span>
	</header>
	<p class="note">{t.docs.sdk.channelNote}</p>

	<ul class="artifacts">
		{#each SDK_RELEASE.artifacts as artifact (artifact.id)}
			<li class="artifact">
				<span class="icon"><Icon name="package" size={22} /></span>
				<div class="info">
					<p class="name">
						{artifact.name}
						{#if artifact.id === 'configdsl'}
							<span class="bundled">{t.docs.sdk.bundled}</span>
						{:else}
							<span class="version">v{SDK_RELEASE.version}</span>
						{/if}
					</p>
					<p class="desc">{t.docs.sdk[artifact.id]}</p>
					<code class="file">{artifact.file}</code>
				</div>
				{#if artifact.url}
					<a class="button primary" href={artifact.url} download>
						<Icon name="download" size={18} />
						{t.docs.sdk.download}
					</a>
				{:else}
					<span class="button pending" aria-disabled="true">
						<Icon name="download" size={18} />
						{t.docs.sdk.preparing}
					</span>
				{/if}
			</li>
		{/each}
	</ul>

	<div class="build">
		<p>{t.docs.sdk.notice}</p>
		<figure class="code-window">
			<pre><code><span class="tok-com"># github.com/mooner1022/StarLight</span>
{SDK_BUILD_COMMAND}</code></pre>
		</figure>
	</div>
</section>

<style>
	.sdk {
		margin-bottom: 40px;
		padding: 24px;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background:
			radial-gradient(120% 120% at 100% 0%, var(--accent-soft), transparent 55%),
			var(--surface);
		box-shadow: var(--shadow);
	}

	header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 8px 16px;
	}

	.eyebrow {
		margin-bottom: 6px;
	}

	h2 {
		font-size: 1.375rem;
		font-weight: 700;
	}

	.channel {
		padding: 4px 10px;
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	.note {
		margin-top: 8px;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.artifacts {
		display: grid;
		gap: 10px;
		margin-top: 20px;
		list-style: none;
	}

	.artifact {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 12px 16px;
		padding: 16px 18px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
	}

	.icon {
		display: inline-grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.name {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 8px;
		font-weight: 700;
	}

	.version {
		color: var(--accent);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.bundled {
		color: var(--text-faint);
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.desc {
		margin-top: 2px;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.file {
		display: inline-block;
		margin-top: 4px;
		color: var(--text-faint);
		font-size: 0.8125rem;
	}

	.artifact .button {
		min-height: 40px;
		padding: 0 16px;
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.pending {
		border-color: var(--border-strong);
		color: var(--text-faint);
		cursor: not-allowed;
	}

	.build {
		margin-top: 20px;
	}

	.build p {
		margin-bottom: 10px;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.build pre {
		padding: 14px 18px;
		font-size: 0.8125rem;
	}

	@media (max-width: 560px) {
		.artifact {
			grid-template-columns: auto minmax(0, 1fr);
		}

		.artifact .button {
			grid-column: 1 / -1;
		}
	}
</style>
