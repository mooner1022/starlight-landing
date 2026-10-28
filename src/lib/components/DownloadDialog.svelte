<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import { getMessages } from '#lib/i18n.ts';
	import { CHANNELS, fileName, PRIMARY_CHANNEL, type Channel, type Versions } from '#lib/versions.ts';

	const t = $derived(getMessages());

	let dialog: HTMLDialogElement;
	let step = $state<'choose' | 'started'>('choose');
	let versions = $state<Versions | null>(null);
	let selected = $state<Channel>(PRIMARY_CHANNEL);
	let url = $state('');

	/** Lets the user pick a channel before downloading. */
	export function choose(available: Versions) {
		versions = available;
		selected = PRIMARY_CHANNEL;
		step = 'choose';
		dialog.showModal();
	}

	/** Shown alongside the browser download, which the link itself starts. */
	export function open(downloadUrl: string) {
		url = downloadUrl;
		step = 'started';
		if (!dialog.open) dialog.showModal();
	}
</script>

<dialog
	bind:this={dialog}
	aria-labelledby="download-dialog-title"
	onclick={(event) => {
		// Clicking the backdrop closes the dialog.
		if (event.target === dialog) dialog.close();
	}}
>
	{#if step === 'choose' && versions}
		{@const chosen = versions[selected]}
		<div class="body choose">
			<h2 id="download-dialog-title">{t.dialog.chooseTitle}</h2>
			<p>{t.dialog.chooseLead}</p>

			<fieldset>
				<legend class="visually-hidden">{t.dialog.chooseTitle}</legend>
				{#each CHANNELS as channel (channel)}
					<label class="option" class:checked={selected === channel}>
						<input type="radio" name="channel" value={channel} bind:group={selected} />
						<span class="option-text">
							<span class="option-head">
								<strong>{t.download.channels[channel].name}</strong>
								{#if channel === PRIMARY_CHANNEL}<span class="badge">{t.download.recommended}</span>{/if}
								<code>v{versions[channel].version}</code>
							</span>
							<span class="option-body">{t.download.channels[channel].body}</span>
						</span>
					</label>
				{/each}
			</fieldset>

			<div class="actions">
				<form method="dialog">
					<button class="button ghost">{t.dialog.cancel}</button>
				</form>
				<a class="button primary" href={chosen.downloadUrl} onclick={() => open(chosen.downloadUrl)}>
					<Icon name="download" size={18} />
					{t.dialog.download}
				</a>
			</div>
		</div>
	{:else}
		<div class="body started">
			<span class="mark"><Logo size={40} /></span>
			<h2 id="download-dialog-title">{t.dialog.title}</h2>
			<p class="file"><Icon name="download" size={16} /><code>{fileName(url)}</code></p>
			<p>
				{t.dialog.retryBefore}<a class="retry" href={url}>{t.dialog.retryLink}</a>{t.dialog.retryAfter}
			</p>
			<p class="hint">{t.dialog.installHint}</p>
			<form method="dialog">
				<button class="button primary">{t.dialog.close}</button>
			</form>
		</div>
	{/if}
</dialog>

<style>
	dialog {
		width: min(460px, calc(100vw - 32px));
		padding: 0;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-lg);
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 40px 80px -30px rgb(0 0 0 / 0.6);
	}

	dialog[open] {
		animation: pop 0.3s var(--ease);
	}

	dialog::backdrop {
		background: rgb(6 8 18 / 0.6);
		backdrop-filter: blur(4px);
	}

	.body {
		display: grid;
		gap: 12px;
		padding: 32px 28px 28px;
	}

	.started {
		justify-items: center;
		padding-top: 36px;
		text-align: center;
	}

	.mark {
		display: inline-grid;
		margin-bottom: 4px;
		color: var(--gold);
	}

	h2 {
		font-size: 1.375rem;
		font-weight: 700;
	}

	p {
		color: var(--text-muted);
		font-size: 0.9375rem;
	}

	fieldset {
		display: grid;
		gap: 10px;
		margin: 8px 0 0;
		padding: 0;
		border: 0;
	}

	.option {
		display: flex;
		gap: 14px;
		padding: 16px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
		transition:
			border-color 0.2s,
			background-color 0.2s;
	}

	.option:hover {
		border-color: var(--border-strong);
	}

	.option.checked {
		border-color: rgb(223 193 153 / 0.7);
		background: var(--accent-soft);
	}

	.option:has(input:focus-visible) {
		outline: 2px solid var(--gold);
		outline-offset: 2px;
	}

	input {
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		margin: 2px 0 0;
		accent-color: var(--gold);
	}

	input:focus-visible {
		outline: none;
	}

	.option-text {
		display: grid;
		flex: 1;
		gap: 4px;
		min-width: 0;
	}

	.option-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 10px;
	}

	.option-head code {
		margin-left: auto;
		color: var(--accent);
		font-size: 0.8125rem;
	}

	.option-body {
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.badge {
		padding: 2px 8px;
		border-radius: 999px;
		background: var(--gold);
		color: var(--gold-ink);
		font-size: 0.6875rem;
		font-weight: 700;
	}

	.actions {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 10px;
		margin-top: 8px;
	}

	.actions .button,
	.started form,
	.started .button {
		width: 100%;
	}

	.file {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		max-width: 100%;
		padding: 6px 12px;
		border-radius: 999px;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.file code {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.retry {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.hint {
		color: var(--text-faint);
		font-size: 0.875rem;
	}

	.started form {
		margin-top: 8px;
	}

	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.98);
		}
	}
</style>
