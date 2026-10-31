import { getNavigation } from '#lib/docs/content.server.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => ({
	nav: await getNavigation(params.lang === 'en' ? 'en' : 'ko')
});
