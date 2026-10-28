<script lang="ts">
	import { onMount } from 'svelte';
	import DownloadDialog from '#lib/components/DownloadDialog.svelte';
	import SectionIndicator from '#lib/components/SectionIndicator.svelte';
	import { getMessages } from '#lib/i18n.ts';
	import CodeShowcase from '#lib/sections/CodeShowcase.svelte';
	import DownloadSection from '#lib/sections/DownloadSection.svelte';
	import Features from '#lib/sections/Features.svelte';
	import Hero from '#lib/sections/Hero.svelte';
	import OpenSource from '#lib/sections/OpenSource.svelte';
	import PluginDev from '#lib/sections/PluginDev.svelte';
	import { fetchChangelog, fetchVersions, PRIMARY_CHANNEL, type Versions } from '#lib/versions.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const t = $derived(getMessages());
	const sections = $derived([
		{ id: 'home', label: t.sections.home },
		{ id: 'features', label: t.sections.features },
		{ id: 'code', label: t.sections.code },
		{ id: 'plugins', label: t.sections.plugins },
		{ id: 'download', label: t.sections.download },
		{ id: 'open-source', label: t.sections.openSource }
	]);

	// The prerendered data can be as old as the last deploy, so look for newer builds once the page is open.
	let fresh = $state<{ versions: Versions; changelog: string | null }>();
	const versions = $derived(fresh?.versions ?? data.versions);
	const changelog = $derived(fresh ? fresh.changelog : data.changelog);

	let dialog: DownloadDialog;
	const onDownload = (url: string) => dialog.open(url);
	const onChoose = (available: Versions) => dialog.choose(available);

	onMount(async () => {
		const latest = await fetchVersions(fetch);
		if (!latest) return;
		const changed = latest[PRIMARY_CHANNEL].changelog !== data.versions?.[PRIMARY_CHANNEL].changelog;
		fresh = {
			versions: latest,
			changelog: changed || !data.changelog ? await fetchChangelog(fetch, latest[PRIMARY_CHANNEL]) : data.changelog
		};
	});
</script>

<svelte:head>
	<title>{t.meta.title}</title>
	<meta name="description" content={t.meta.description} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Project StarLight" />
	<meta property="og:title" content={t.meta.title} />
	<meta property="og:description" content={t.meta.description} />
</svelte:head>

<Hero {versions} {onChoose} />
<Features />
<CodeShowcase />
<PluginDev />
<DownloadSection {versions} {changelog} {onDownload} />
<OpenSource />
<SectionIndicator {sections} label={t.nav.sections} />
<DownloadDialog bind:this={dialog} />
