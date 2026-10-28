/*
 * Moves the landing page one section at a time.
 *
 * A wheel gesture that travels past THRESHOLD pixels glides to the next section. Everything that follows
 * in the same gesture (including trackpad inertia) is ignored, so one swipe never skips sections.
 * Sections taller than the screen scroll normally inside, and only hand over to the next section
 * once their edge is reached and a new gesture starts.
 *
 * Paging only takes over on large screens with a precise pointer. Touch devices keep native scrolling,
 * but section links still glide everywhere.
 */

interface Stop {
	start: number;
	end: number;
}

/** Wheel distance, in pixels, that turns a gesture into a page turn. */
const THRESHOLD = 50;
/** Silence (ms) that separates two gestures. Trackpad inertia keeps firing well within this. */
const GESTURE_GAP = 180;
/** Sections that overflow the screen by less than this only lose some bottom padding, so they page like short ones. */
const OVERFLOW_TOLERANCE = 120;
const PAGING_QUERY = '(min-width: 861px) and (min-height: 560px) and (hover: hover) and (pointer: fine)';

export interface SectionPager {
	goTo(index: number): void;
	destroy(): void;
}

export function createSectionPager(
	sections: HTMLElement[],
	onActiveChange: (index: number) => void
): SectionPager {
	const paging = matchMedia(PAGING_QUERY);
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

	let frame = 0;
	let animating = false;
	let locked = false;
	let lastWheel = 0;
	let travelled = 0;
	let active = -1;
	let ticking = false;

	const jump = (top: number) => window.scrollTo({ top, behavior: 'instant' });

	/** Scroll positions where each section starts and ends, plus one for the footer below them. */
	function stops(): Stop[] {
		const list = sections.map((section) => {
			const rect = section.getBoundingClientRect();
			const start = Math.round(rect.top + scrollY);
			const end = Math.round(rect.bottom + scrollY - innerHeight);
			return { start, end: end - start > OVERFLOW_TOLERANCE ? end : start };
		});
		const max = document.documentElement.scrollHeight - innerHeight;
		if (max > list[list.length - 1].end + 1) list.push({ start: max, end: max });
		return list;
	}

	function currentStop(list: Stop[]): number {
		const current = position();
		let index = 0;
		list.forEach((stop, i) => {
			if (stop.start <= current + 2) index = i;
		});
		return index;
	}

	// easeInOutCubic: a soft start and a long, gentle landing
	const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

	/** Where a scroll inside a section is heading, so consecutive wheel notches add up. */
	let scrollTarget: number | null = null;
	const position = () => scrollTarget ?? scrollY;

	/** Page turn: a fixed-length glide that ignores input until it lands. */
	function glideTo(target: number) {
		cancelAnimationFrame(frame);
		scrollTarget = null;
		const from = scrollY;
		const distance = target - from;
		if (Math.abs(distance) < 1 || reducedMotion.matches) return jump(target);

		const duration = Math.min(950, 550 + Math.abs(distance) * 0.15);
		const startedAt = performance.now();
		animating = true;
		const step = (now: number) => {
			const t = Math.min(1, (now - startedAt) / duration);
			jump(from + distance * easeInOut(t));
			if (t < 1) frame = requestAnimationFrame(step);
			else animating = false;
		};
		frame = requestAnimationFrame(step);
	}

	/**
	 * Scrolling inside a section: every frame closes part of the gap to the target. New notches only move
	 * the target, so the motion stays continuous instead of restarting (and twitching) on each one.
	 * The position is kept as a float here, because reading scrollY back would feed in rounding.
	 */
	let chasePosition = 0;
	let lastFrame = 0;
	function chase(target: number) {
		if (reducedMotion.matches) return jump(target);
		if (scrollTarget === null) {
			chasePosition = scrollY;
			lastFrame = performance.now();
		}
		scrollTarget = target;
		cancelAnimationFrame(frame);

		const step = (now: number) => {
			const elapsed = Math.min(64, now - lastFrame);
			lastFrame = now;
			const gap = (scrollTarget ?? chasePosition) - chasePosition;
			if (Math.abs(gap) < 0.5) {
				jump(chasePosition + gap);
				scrollTarget = null;
				return;
			}
			// Closes about 16% of the gap per 60 Hz frame, independent of the actual frame rate.
			chasePosition += gap * (1 - Math.pow(0.84, elapsed / 16.67));
			jump(chasePosition);
			frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);
	}

	/** Whether there is room to keep scrolling inside the current (tall) section. */
	function canScrollWithin(stop: Stop, direction: number) {
		return direction > 0 ? position() < stop.end - 1 : position() > stop.start + 1;
	}

	/**
	 * Scrolls `delta` pixels inside a tall section, stopping at its edge.
	 * Returns true once the edge is reached.
	 */
	function scrollWithin(stop: Stop, direction: number, delta: number) {
		const edge = direction > 0 ? stop.end : stop.start;
		const target = direction > 0 ? Math.min(position() + delta, edge) : Math.max(position() - delta, edge);
		// Trackpads already stream small deltas, so follow them directly; mouse notches get smoothed.
		if (delta < 40) {
			cancelAnimationFrame(frame);
			scrollTarget = null;
			jump(target);
		} else {
			chase(target);
		}
		return target === edge;
	}

	function turnPage(list: Stop[], index: number, direction: number) {
		const stop = list[index];
		// Not lined up with the current section (e.g. after a resize): settle on it first.
		if (direction < 0 && stop.start === stop.end && scrollY > stop.start + 1) return glideTo(stop.start);
		const next = list[index + direction];
		if (!next) return;
		// Entering a tall section from below lands on its bottom, so scrolling up continues naturally.
		glideTo(direction > 0 ? next.start : next.end);
	}

	function onWheel(event: WheelEvent) {
		if (!paging.matches || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
		if (document.querySelector('dialog[open]')) return;
		event.preventDefault();

		const now = performance.now();
		if (now - lastWheel > GESTURE_GAP) {
			locked = false;
			travelled = 0;
		}
		lastWheel = now;
		if (animating || locked || event.deltaY === 0) return;

		const direction = Math.sign(event.deltaY);
		const scale = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? innerHeight : 1;
		const delta = Math.abs(event.deltaY) * scale;
		const list = stops();
		const index = currentStop(list);

		if (canScrollWithin(list[index], direction)) {
			if (scrollWithin(list[index], direction, delta)) locked = true;
			return;
		}

		if (Math.sign(travelled) !== direction) travelled = 0;
		travelled += direction * delta;
		if (Math.abs(travelled) < THRESHOLD) return;

		travelled = 0;
		locked = true;
		turnPage(list, index, direction);
	}

	function onKeydown(event: KeyboardEvent) {
		if (!paging.matches || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
		const target = event.target as HTMLElement | null;
		if (target?.closest('input, textarea, select, button, [contenteditable], dialog')) return;

		const page = innerHeight * 0.85;
		const keys: Record<string, [number, number]> = {
			ArrowDown: [1, 120],
			ArrowUp: [-1, 120],
			PageDown: [1, page],
			PageUp: [-1, page],
			' ': [event.shiftKey ? -1 : 1, page]
		};

		if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault();
			const list = stops();
			glideTo(event.key === 'Home' ? 0 : list[list.length - 1].start);
			return;
		}
		const key = keys[event.key];
		if (!key) return;
		event.preventDefault();
		if (animating) return;

		const [direction, delta] = key;
		const list = stops();
		const index = currentStop(list);
		if (canScrollWithin(list[index], direction)) scrollWithin(list[index], direction, delta);
		else turnPage(list, index, direction);
	}

	/** Same-page links to a section glide there instead of jumping. */
	function onClick(event: MouseEvent) {
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		// Buttons that only look like links (e.g. the hero download, which opens a dialog) handle themselves.
		const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]:not([aria-haspopup])');
		if (!link) return;
		const url = new URL(link.href);
		if (url.pathname !== location.pathname) return;
		const index = sections.findIndex((section) => `#${section.id}` === url.hash);
		if (index < 0) return;
		event.preventDefault();
		goTo(index);
	}

	function updateActive() {
		ticking = false;
		const middle = innerHeight / 2;
		let index = 0;
		sections.forEach((section, i) => {
			if (section.getBoundingClientRect().top <= middle) index = i;
		});
		if (index !== active) {
			active = index;
			onActiveChange(index);
		}
	}

	function onScroll() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(updateActive);
	}

	function goTo(index: number) {
		const stop = stops()[index];
		if (stop) glideTo(stop.start);
	}

	window.addEventListener('wheel', onWheel, { passive: false });
	window.addEventListener('keydown', onKeydown);
	window.addEventListener('click', onClick, true);
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
	updateActive();

	return {
		goTo,
		destroy() {
			cancelAnimationFrame(frame);
			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('keydown', onKeydown);
			window.removeEventListener('click', onClick, true);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		}
	};
}
