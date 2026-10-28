import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import adapter from '@sveltejs/adapter-static';
import { defineConfig } from 'vite';

const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig(({ mode }) => ({
	plugins: [
		enhancedImages(),
		sveltekit({
			adapter: adapter(),
			paths: {
				base: mode === 'development' ? '' : base
			},
			prerender: {
				// The English pages are only linked from the language switch, so list them explicitly.
				entries: ['*', '/en', '/en/app-privacy']
			}
		})
	]
}));
