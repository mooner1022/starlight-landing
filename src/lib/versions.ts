const REPO_RAW_URL = 'https://raw.githubusercontent.com/mooner1022/starlight-version/master';
const VERSION_CHECK_URL = `${REPO_RAW_URL}/version.json`;

export const CHANNELS = ['release', 'beta', 'snapshot'] as const;
export type Channel = (typeof CHANNELS)[number];

/** The channel the hero download button points to. All channels are listed in the download section. */
export const PRIMARY_CHANNEL: Channel = 'beta';

export interface Version {
	version: string;
	versionCode: number;
	changelog?: string;
	downloadUrl: string;
}

export type Versions = Record<Channel, Version>;

type Fetch = typeof fetch;

/** Returns `null` instead of throwing so that a network hiccup never breaks the build or the page. */
export async function fetchVersions(fetch: Fetch): Promise<Versions | null> {
	try {
		const response = await fetch(VERSION_CHECK_URL);
		if (!response.ok) return null;
		const versions = (await response.json()) as Versions;
		return CHANNELS.every((channel) => versions[channel]?.downloadUrl) ? versions : null;
	} catch (err) {
		console.error('Failed to fetch version info', err);
		return null;
	}
}

export function changelogUrl(version: Version): string | null {
	return version.changelog ? `${REPO_RAW_URL}/changes/${version.changelog}` : null;
}

export function changelogPageUrl(version: Version): string {
	const path = version.changelog ? `blob/master/changes/${version.changelog}` : 'tree/master/changes';
	return `https://github.com/mooner1022/starlight-version/${path}`;
}

export async function fetchChangelog(fetch: Fetch, version: Version): Promise<string | null> {
	const url = changelogUrl(version);
	if (!url) return null;
	try {
		const response = await fetch(url);
		return response.ok ? await response.text() : null;
	} catch (err) {
		console.error('Failed to fetch changelog', err);
		return null;
	}
}

export function fileName(url: string): string {
	return decodeURIComponent(url.split('/').pop() ?? url);
}
