import { resolve } from '$app/paths';
import type { Locale } from '#lib/i18n.ts';

export type PageKey = 'home' | 'privacy';

export function localizedHref(locale: Locale, key: PageKey = 'home'): string {
	const lang = locale === 'en' ? 'en' : undefined;
	return key === 'home'
		? resolve('/[[lang=lang]]', { lang })
		: resolve('/[[lang=lang]]/app-privacy', { lang });
}
