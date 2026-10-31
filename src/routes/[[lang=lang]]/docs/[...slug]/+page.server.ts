import { error } from '@sveltejs/kit';
import { allSlugs, getPage } from '#lib/docs/content.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// Rendered at build time; client-side navigation reads the prerendered data.
export const entries: EntryGenerator = () =>
	allSlugs().flatMap((slug) => [{ slug }, { lang: 'en', slug }]);

export const load: PageServerLoad = async ({ params }) => {
	const doc = await getPage(params.lang === 'en' ? 'en' : 'ko', params.slug.replace(/\/$/, ''));
	if (!doc) error(404, 'Not found');
	return { doc };
};
