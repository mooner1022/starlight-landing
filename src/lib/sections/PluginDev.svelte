<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { getMessages } from '#lib/i18n.ts';
	import { reveal } from '#lib/reveal.ts';

	const t = $derived(getMessages());
</script>

<section id="plugins" class="section">
	<div class="container split">
		<!-- Taken from the StarLight-GradlePlugin README; bump the version here when the plugin is released. -->
		<div class="stack" use:reveal>
			<figure class="code-window">
				<figcaption class="window-bar"><span class="file">build.gradle.kts</span></figcaption>
				<pre><code
						><span class="tok-fn">plugins</span> <span class="tok-punc">{"{"}</span>
    <span class="tok-fn">id</span><span class="tok-punc">(</span><span class="tok-str">"com.android.application"</span><span class="tok-punc">)</span>
    <span class="tok-fn">id</span><span class="tok-punc">(</span><span class="tok-str">"io.github.mooner1022.slplugin"</span><span class="tok-punc">)</span> <span class="tok-kw">version</span> <span class="tok-str">"0.2.0"</span>
<span class="tok-punc">{"}"}</span>

<span class="tok-fn">starlight</span> <span class="tok-punc">{"{"}</span>
    <span class="tok-fn">manifest</span> <span class="tok-punc">{"{"}</span>
        id <span class="tok-punc">=</span> <span class="tok-str">"my_plugin"</span>
        mainClass <span class="tok-punc">=</span> <span class="tok-str">"com.example.MyPlugin"</span>
        apiVersion <span class="tok-punc">=</span> <span class="tok-str">"0.3.0"</span>
    <span class="tok-punc">{"}"}</span>
<span class="tok-punc">{"}"}</span></code
					></pre>
			</figure>
			<figure class="code-window terminal">
				<pre><code
						><span class="tok-com"># {t.plugins.deployComment}</span>
<span class="tok-punc">$</span> ./gradlew <span class="tok-fn">deployDebugSlp</span> -Pstarlight.restartApp=true</code
					></pre>
			</figure>
		</div>

		<div class="copy" use:reveal={0.1}>
			<p class="eyebrow">{t.plugins.eyebrow}</p>
			<h2 class="section-title">{t.plugins.title}</h2>
			<p class="section-lead">{t.plugins.body}</p>
			<ul class="points">
				{#each t.plugins.points as point (point)}
					<li><Icon name="check" size={18} /><span>{point}</span></li>
				{/each}
			</ul>
			<a class="link" href="https://github.com/mooner1022/StarLight-GradlePlugin" rel="noopener">
				{t.plugins.link}
				<Icon name="arrowRight" size={18} />
			</a>
		</div>
	</div>
</section>

<style>
	.split {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
		align-items: center;
		gap: clamp(32px, 6vw, 72px);
	}

	.stack {
		display: grid;
		gap: 14px;
	}

	figure {
		margin: 0;
	}

	.window-bar {
		padding: 12px 18px;
		border-bottom: 1px solid rgb(255 255 255 / 0.07);
		background: rgb(255 255 255 / 0.02);
	}

	.file {
		color: #9aa0bb;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}

	.terminal pre {
		padding-block: 16px 18px;
	}

	.points {
		display: grid;
		gap: 12px;
		margin-top: 28px;
		list-style: none;
	}

	.points li {
		display: flex;
		gap: 12px;
		color: var(--text-muted);
	}

	.points :global(svg) {
		margin-top: 4px;
		color: var(--accent);
	}

	.link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 28px;
		color: var(--accent);
		font-weight: 600;
	}

	.link :global(svg) {
		transition: translate 0.2s var(--ease);
	}

	.link:hover :global(svg) {
		translate: 4px 0;
	}

	@media (max-width: 860px) {
		.split {
			grid-template-columns: 1fr;
		}

		/* Lead with the explanation on small screens. */
		.copy {
			order: -1;
		}
	}
</style>
