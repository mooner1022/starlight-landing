<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { getMessages } from '#lib/i18n.ts';

	const t = $derived(getMessages());

	// The real theme is set on <html> by the inline script in app.html before hydration.
	let theme = $state<'light' | 'dark'>('dark');

	onMount(() => {
		theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
	});

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem('theme', theme);
		} catch {
			// Storage can be unavailable (private mode); the toggle still works for this visit.
		}
	}
</script>

<button
	type="button"
	class="icon-button"
	onclick={toggle}
	aria-label={theme === 'dark' ? t.nav.toLight : t.nav.toDark}
	title={theme === 'dark' ? t.nav.toLight : t.nav.toDark}
>
	<Icon name={theme === 'dark' ? 'moon' : 'sun'} size={18} />
</button>
