import type { Handle } from '@sveltejs/kit/hooks';

export const handle: Handle = ({ event, resolve }) => {
	const lang = event.params.lang === 'en' ? 'en' : 'ko';

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
