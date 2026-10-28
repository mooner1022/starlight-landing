<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { getMessages } from '#lib/i18n.ts';
	import { reveal } from '#lib/reveal.ts';

	const t = $derived(getMessages());
</script>

<section id="code" class="section alt">
	<div class="container split">
		<div class="copy" use:reveal>
			<p class="eyebrow">{t.code.eyebrow}</p>
			<h2 class="section-title">{t.code.title}</h2>
			<p class="section-lead">{t.code.body}</p>
			<ul class="points">
				{#each t.code.points as point (point)}
					<li><Icon name="check" size={18} /><span>{point}</span></li>
				{/each}
			</ul>
		</div>

		<!-- The signature mirrors LegacyEvent in the StarLight app (event "response"). -->
		<figure class="code-window" use:reveal={0.1}>
			<figcaption class="window-bar">
				<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
				<span class="file">response.js</span>
			</figcaption>
			<pre><code
					><span class="tok-com">// {t.code.comment}</span>
<span class="tok-kw">function</span> <span class="tok-fn">response</span><span class="tok-punc">(</span>room<span class="tok-punc">,</span> msg<span class="tok-punc">,</span> sender<span class="tok-punc">,</span> isGroupChat<span class="tok-punc">,</span>
                  replier<span class="tok-punc">,</span> imageDB<span class="tok-punc">,</span> packageName<span class="tok-punc">) {"{"}</span>
    <span class="tok-kw">if</span> <span class="tok-punc">(</span>msg <span class="tok-punc">===</span> <span class="tok-str">"/ping"</span><span class="tok-punc">) {"{"}</span>
        replier<span class="tok-punc">.</span><span class="tok-fn">reply</span><span class="tok-punc">(</span><span class="tok-str">"pong! ✦"</span><span class="tok-punc">);</span>
    <span class="tok-punc">{"}"}</span>
<span class="tok-punc">{"}"}</span></code
				></pre>
		</figure>
	</div>
</section>

<style>
	.alt {
		background: var(--bg-alt);
	}

	.split {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		align-items: center;
		gap: clamp(32px, 6vw, 72px);
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

	figure {
		margin: 0;
	}

	.window-bar {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 14px 18px;
		border-bottom: 1px solid rgb(255 255 255 / 0.07);
		background: rgb(255 255 255 / 0.02);
	}

	.dots {
		display: flex;
		gap: 6px;
	}

	.dots i {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.14);
	}

	.file {
		color: #9aa0bb;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}

	@media (max-width: 860px) {
		.split {
			grid-template-columns: 1fr;
		}
	}
</style>
