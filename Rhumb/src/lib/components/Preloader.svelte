<script>
	import { onMount } from 'svelte';
	import { gsap } from '$lib/motion/gsap.js';
	import { ui } from '$lib/state.svelte.js';
	import { skyBus } from '$lib/gl/sky/bus.js';
	import { lockScroll } from '$lib/motion/scroll.js';

	let { onDone = () => {} } = $props();

	let root = $state();
	let deg = $state(0);
	let gone = $state(false);

	// Loading is real work: fonts, and the first frames of the sky shader.
	function whenLoaded() {
		const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
		const frames = new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		const floor = new Promise((r) => setTimeout(r, 900));
		return Promise.all([fonts, frames, floor]);
	}

	onMount(() => {
		const html = document.documentElement;
		const skip = html.classList.contains('no-intro') || ui.reduced;
		const sky = skyBus.sky;

		if (skip) {
			if (sky) sky.state.intro = 1;
			gone = true;
			ui.ready = true;
			onDone();
			return;
		}

		lockScroll(true);
		const q = gsap.utils.selector(root);
		const readout = { v: 0 };
		const tl = gsap.timeline();

		tl.from(q('.rose path.pt'), { drawSVG: '50% 50%', duration: 0.9, stagger: 0.04, ease: 'power2.inOut' }, 0.1)
			.to(q('.rose path.pt'), { fillOpacity: 1, duration: 0.5, stagger: 0.03, ease: 'power1.out' }, 0.7)
			.from(q('.rose .ring'), { drawSVG: 0, duration: 1.1, ease: 'power2.inOut' }, 0.1)
			.from(q('.ticks line'), { autoAlpha: 0, duration: 0.02, stagger: 0.012 }, 0.2)
			.fromTo(q('.needle'), { rotation: 214, svgOrigin: '60 60' }, { rotation: 47, svgOrigin: '60 60', duration: 1.8, ease: 'elastic.out(1, 0.34)' }, 0.3)
			.to(readout, { v: 47, duration: 1.05, ease: 'power3.out', onUpdate: () => (deg = Math.round(readout.v)) }, 0.3)
			.from(q('.read'), { autoAlpha: 0, y: 6, duration: 0.6 }, 0.3);

		let cancelled = false;
		whenLoaded().then(() => {
			if (cancelled) return;
			const exit = gsap.timeline({
				delay: Math.max(0, 1.55 - tl.time()),
				onComplete: () => {
					gone = true;
					lockScroll(false);
				}
			});
			exit
				.to(q('.read'), { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0)
				.to(q('.rose'), { scale: 0.18, autoAlpha: 0, duration: 0.7, ease: 'power3.inOut' }, 0.05)
				// the curtain lifts in hard steps, like a screen redrawing
				.to(root, { '--lift': 1, duration: 0.72, ease: 'steps(8)' }, 0.2)
				.add(() => {
					ui.ready = true;
					onDone();
				}, 0.36);
			if (sky) exit.fromTo(sky.state, { intro: 0 }, { intro: 1, duration: 2.2, ease: 'power2.out' }, 0.22);
		});

		return () => {
			cancelled = true;
			tl.kill();
		};
	});
</script>

{#if !gone}
	<div class="pre" bind:this={root} aria-hidden="true">
		<svg class="rose" viewBox="0 0 120 120" width="120" height="120">
			<circle class="ring" cx="60" cy="60" r="44" />
			<g class="ticks">
				{#each Array.from({ length: 32 }, (_, i) => i) as i (i)}
					<line
						x1="60"
						y1={i % 4 === 0 ? 12 : 14}
						x2="60"
						y2="17"
						transform="rotate({i * 11.25} 60 60)"
					/>
				{/each}
			</g>
			<path class="pt" d="M60 20 64 55.5 60 60 56 55.5Z" />
			<path class="pt" d="M60 20 64 55.5 60 60 56 55.5Z" transform="rotate(90 60 60)" />
			<path class="pt" d="M60 20 64 55.5 60 60 56 55.5Z" transform="rotate(180 60 60)" />
			<path class="pt" d="M60 20 64 55.5 60 60 56 55.5Z" transform="rotate(270 60 60)" />
			<path class="pt" d="M60 37 62.4 57.6 60 60 57.6 57.6Z" transform="rotate(135 60 60)" />
			<path class="pt" d="M60 37 62.4 57.6 60 60 57.6 57.6Z" transform="rotate(225 60 60)" />
			<path class="pt" d="M60 37 62.4 57.6 60 60 57.6 57.6Z" transform="rotate(315 60 60)" />
			<path class="needle" d="M60 23 63.6 56 60 60 56.4 56Z" />
			<circle cx="60" cy="60" r="2.6" class="hub" />
		</svg>
		<p class="read label">
			<span>Taking a bearing</span>
			<span class="deg">{String(deg).padStart(3, '0')}°</span>
		</p>
	</div>
{/if}

<style>
	.pre {
		--lift: 0;
		position: fixed;
		inset: 0;
		z-index: 80;
		display: none;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 26px;
		background: var(--night);
		clip-path: inset(0 0 calc(var(--lift) * 100%) 0);
	}
	:global(.js) .pre {
		display: flex;
	}
	:global(.js.no-intro) .pre,
	:global(.js.rm) .pre {
		display: none;
	}
	.rose {
		overflow: visible;
		color: var(--text);
	}
	.ring {
		fill: none;
		stroke: var(--hair-3);
		stroke-width: 0.8;
	}
	.ticks line {
		stroke: var(--muted);
		stroke-width: 0.8;
	}
	.pt {
		fill: var(--text);
		fill-opacity: 0;
		stroke: var(--text);
		stroke-width: 0.7;
		stroke-linejoin: round;
	}
	.needle {
		fill: var(--signal);
		filter: drop-shadow(0 0 6px rgba(255, 92, 210, 0.45));
	}
	.hub {
		fill: var(--night);
		stroke: var(--text);
		stroke-width: 0.8;
	}
	.read {
		display: flex;
		gap: 18px;
		font-size: 10.5px;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}
	.deg {
		color: var(--text);
		min-width: 4ch;
	}
</style>
