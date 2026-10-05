<script>
	import { onMount } from 'svelte';
	import { gsap } from '$lib/motion/gsap.js';
	import { cine } from '$lib/motion/cine.js';
	import { ui } from '$lib/state.svelte.js';

	/** One log line shown in the bottom bar deep in the dive, e.g. '20:03 · descending through the upper air'. */
	let { subtitle = '' } = $props();

	let root = $state();

	onMount(() => {
		if (ui.reduced) return;
		// The page opens on a letterboxed frame; the hero intro lifts the bars.
		if (!document.documentElement.classList.contains('no-intro')) cine.intro = 1;
		let lb = -1;
		let sub = -1;
		const tick = () => {
			let v = Math.max(cine.intro, cine.scroll);
			if (v < 0.002) v = 0;
			if (Math.abs(v - lb) > 0.001) {
				lb = v;
				root.style.setProperty('--lb', v.toFixed(4));
			}
			if (Math.abs(cine.scroll - sub) > 0.001) {
				sub = cine.scroll;
				root.style.setProperty('--sub', sub.toFixed(4));
			}
		};
		gsap.ticker.add(tick);
		return () => gsap.ticker.remove(tick);
	});
</script>

<!-- The grain blends against the page itself, so it has to live outside the frame's
     stacking context; inside it, overlay would only see the transparent vignette. -->
<div class="grain" class:day={ui.day} aria-hidden="true"></div>
<div class="cinema" class:day={ui.day} bind:this={root} aria-hidden="true">
	<div class="vignette"></div>
	<div class="bar top"></div>
	<div class="bar bot"><p class="subtitle label">{subtitle}</p></div>
</div>

<style>
	.cinema {
		--lb: 0;
		--sub: 0;
		position: fixed;
		inset: 0;
		z-index: 37;
		pointer-events: none;
	}

	/* ---- lens: a soft fall-off to the corners, cool at night, warm on paper ---- */
	.vignette,
	.vignette::after {
		position: absolute;
		inset: 0;
		transition: opacity 1.2s var(--ease);
	}
	.vignette {
		background: radial-gradient(130% 110% at 50% 46%, transparent 52%, var(--vignette-night) 100%);
	}
	.vignette::after {
		content: '';
		background: radial-gradient(130% 110% at 50% 46%, transparent 58%, var(--vignette-day) 100%);
		opacity: 0;
	}
	.day .vignette {
		background: none;
	}
	.day .vignette::after {
		opacity: 1;
	}

	/* ---- film grain, stepped like a projector, on the compositor only ---- */
	.grain {
		position: fixed;
		inset: 0;
		z-index: 36;
		overflow: hidden;
		pointer-events: none;
		mix-blend-mode: overlay;
		opacity: 0.22;
		transition: opacity 1.2s var(--ease);
	}
	.grain::before {
		content: '';
		position: absolute;
		inset: -60px;
		background: var(--grain) 0 0 / 200px 200px;
		animation: grain 0.9s steps(1) infinite;
	}
	.grain.day {
		opacity: 0.34;
	}
	@keyframes grain {
		0% { transform: translate(0, 0); }
		17% { transform: translate(-23px, 11px); }
		33% { transform: translate(14px, -29px); }
		50% { transform: translate(-9px, 31px); }
		67% { transform: translate(27px, 6px); }
		83% { transform: translate(-31px, -17px); }
	}

	/* ---- letterbox: 2.39:1 on a landscape screen, a firm band on a phone ---- */
	.bar {
		position: absolute;
		left: 0;
		right: 0;
		height: clamp(0px, calc((100vh - 100vw / 2.39) / 2), 12vh);
		min-height: 56px;
		background: var(--bars);
		transform: scaleY(var(--lb));
		will-change: transform;
	}
	.top {
		top: 0;
		transform-origin: top;
	}
	.bot {
		bottom: 0;
		transform-origin: bottom;
		display: grid;
		place-items: center;
	}
	/* a subtitle for the descent, counter-scaled so it never squashes */
	.subtitle {
		font-size: 10.5px;
		letter-spacing: 0.24em;
		color: var(--text-2);
		text-align: center;
		padding-inline: var(--gutter);
		transform: scaleY(calc(1 / max(var(--lb), 0.01)));
		opacity: clamp(0, calc((var(--sub) - 0.82) * 6), 1);
	}

	/* Phones: no blended grain over a live WebGL canvas; the vignette is enough. */
	@media (pointer: coarse), (max-width: 860px) {
		.grain {
			display: none;
		}
	}
	@media (max-width: 520px) {
		.subtitle {
			font-size: 9.5px;
			letter-spacing: 0.12em;
			white-space: nowrap;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.grain::before {
			animation: none;
		}
		.bar {
			display: none;
		}
	}
	@media print {
		.grain,
		.cinema {
			display: none;
		}
	}
</style>
