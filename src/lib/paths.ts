import { page } from '$app/state';
import { resolve } from '$app/paths';
import type { Locale } from '#lib/i18n.ts';

export type PageKey = 'home' | 'privacy';

export function localizedHref(locale: Locale, key: PageKey = 'home'): string {
	const lang = locale === 'en' ? 'en' : undefined;
	return key === 'home'
		? resolve('/[[lang=lang]]', { lang })
		: resolve('/[[lang=lang]]/app-privacy', { lang });
}

/** A page of the plugin docs; an empty slug is the docs' front page. */
export function docsHref(locale: Locale, slug = ''): string {
	return resolve('/[[lang=lang]]/docs/[...slug]', { lang: locale === 'en' ? 'en' : undefined, slug });
}

/** The current page in another locale, for the language switch and hreflang links. */
export function alternateHref(locale: Locale): string {
	const route = page.route.id ?? '';
	if (route.endsWith('/app-privacy')) return localizedHref(locale, 'privacy');
	if (route.includes('/docs/')) return docsHref(locale, page.params.slug ?? '');
	return localizedHref(locale);
}
