import { fetchChangelog, fetchVersions, PRIMARY_CHANNEL } from '#lib/versions.ts';
import type { PageLoad } from './$types';

// Runs at prerender time so the static HTML already shows real versions.
// The page refetches on mount, since a deploy can be older than the latest build.
export const load: PageLoad = async ({ fetch }) => {
	const versions = await fetchVersions(fetch);
	const changelog = versions ? await fetchChangelog(fetch, versions[PRIMARY_CHANNEL]) : null;
	return { versions, changelog };
};
