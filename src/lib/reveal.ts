import type { Action } from 'svelte/action';

let observer: IntersectionObserver | undefined;

function getObserver() {
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-visible');
				observer?.unobserve(entry.target);
			}
		},
		// Keep the margin small: sections fill the screen, so their last row sits near the bottom edge.
		{ rootMargin: '0px 0px -24px 0px' }
	);
	return observer;
}

/**
 * Fades an element in the first time it scrolls into view. Pass a delay in seconds to stagger siblings.
 * Elements already on screen at hydration are left alone, so prerendered content never blinks out.
 */
export const reveal: Action<HTMLElement, number | undefined> = (node, delay = 0) => {
	if (node.getBoundingClientRect().top < window.innerHeight) return;

	node.dataset.reveal = '';
	if (delay) node.style.setProperty('--reveal-delay', `${delay}s`);
	getObserver().observe(node);

	return {
		destroy() {
			observer?.unobserve(node);
		}
	};
};
