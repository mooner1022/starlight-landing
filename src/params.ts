import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	// Korean lives at the root, so the only valid language segment is `en`.
	lang: (param) => (param === 'en' ? param : undefined)
});
