<script lang="ts" module>
	// A seeded generator keeps the sky identical between the prerendered HTML and hydration.
	function mulberry32(seed: number) {
		return () => {
			seed |= 0;
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	const random = mulberry32(1022);
	const round = (n: number) => Math.round(n * 100) / 100;

	const stars = Array.from({ length: 110 }, () => {
		const big = random() > 0.86;
		return {
			x: round(random() * 100),
			y: round(random() * 100),
			size: big ? 3 : random() > 0.5 ? 2 : 1.5,
			opacity: round(0.35 + random() * 0.6),
			twinkle: random() > 0.6,
			delay: round(random() * 6),
			duration: round(3 + random() * 4),
			gold: random() > 0.55
		};
	});

	const meteors = [
		{ top: 8, left: 78, delay: 1.5 },
		{ top: 22, left: 96, delay: 7.5 },
		{ top: 2, left: 58, delay: 13 }
	];
</script>

<div class="sky" aria-hidden="true">
	{#each stars as star, i (i)}
		<span
			class="star"
			class:twinkle={star.twinkle}
			class:gold={star.gold}
			style:left="{star.x}%"
			style:top="{star.y}%"
			style:width="{star.size}px"
			style:height="{star.size}px"
			style:--o={star.opacity}
			style:animation-delay="{star.delay}s"
			style:animation-duration="{star.duration}s"
		></span>
	{/each}
	{#each meteors as meteor, i (i)}
		<span class="meteor" style:top="{meteor.top}%" style:left="{meteor.left}%" style:animation-delay="{meteor.delay}s"
		></span>
	{/each}
</div>

<style>
	.sky {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		mask-image: linear-gradient(180deg, #000 55%, transparent 100%);
	}

	.star {
		position: absolute;
		border-radius: 50%;
		background: #f4f1ff;
		opacity: var(--o);
	}

	.star.gold {
		background: #f3d9a8;
	}

	.star.twinkle {
		animation: twinkle ease-in-out infinite;
	}

	@keyframes twinkle {
		0%,
		100% {
			opacity: var(--o);
		}
		50% {
			opacity: 0.1;
		}
	}

	/* Shooting stars travel down-left with a cyan head, like the one on the app's home screen. */
	.meteor {
		position: absolute;
		width: 140px;
		height: 3px;
		border-radius: 999px;
		background: linear-gradient(90deg, var(--meteor), rgb(127 214 247 / 0.5) 25%, transparent);
		box-shadow: 0 0 12px rgb(127 214 247 / 0.5);
		opacity: 0;
		transform: rotate(-38deg);
		transform-origin: left center;
		animation: shoot 18s linear infinite;
	}

	@keyframes shoot {
		0% {
			opacity: 0;
			translate: 0 0;
		}
		1% {
			opacity: 1;
		}
		7% {
			opacity: 0;
			translate: -340px 266px;
		}
		100% {
			opacity: 0;
			translate: -340px 266px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.meteor {
			display: none;
		}
	}
</style>
