<script>
	import { onMount } from 'svelte';
	import { gsap } from '$lib/motion/gsap.js';
	import { ui } from '$lib/state.svelte.js';
	import { skyBus } from '$lib/gl/sky/bus.js';
	import { lockScroll } from '$lib/motion/scroll.js';

	let { onDone = () => {} } = $props();

	let root = $state();
	let dial = $state();
	let needle = $state();
	let deg = $state(0);
	let gone = $state(false);

	// The drawing runs as CSS animations from the first paint, and the needle is its own
	// composited layer, so the bearing keeps swinging while scripts and shaders load
	// underneath. Script only decides when the needle may settle and the curtain lift.

	// elastic.out(1, 0.5), sampled for CSS linear()
	const SETTLE =
		'linear(0, 0.2, 0.428, 0.651, 0.845, 1, 1.109, 1.175, 1.202, 1.2, 1.177, 1.141, 1.101, 1.062, 1.027, 1, 0.981, 0.969, 0.964, 0.965, 0.969, 0.975, 0.982, 0.989, 0.995, 1, 1.003, 1.005, 1.006, 1.006, 1.006, 1.004, 1.003, 1.002, 1.001, 1, 0.999, 0.999, 0.999, 0.999, 1)';

	const wait = (ms) => new Promise((r) => setTimeout(r, ms));
	const frames = (n) => new Promise((r) => {
		const f = () => (--n <= 0 ? r() : requestAnimationFrame(f));
		requestAnimationFrame(f);
	});

	// The needle's current heading, read from its running animation (in degrees, near 047).
	function heading() {
		const m = getComputedStyle(needle).transform;
		const v = m && m !== 'none' ? m.slice(m.indexOf('(') + 1, -1).split(',').map(parseFloat) : [1, 0];
		const a = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
		return 47 + ((((a - 47) % 360) + 540) % 360) - 180;
	}

	// Loading is real work: fonts, and the sky shader linked and drawn once.
	async function whenLoaded(sky) {
		const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
		// never hold the page hostage to a slow driver: the sky boots in when it can
		const shader = sky ? Promise.race([sky.ready.catch(() => {}), wait(6000)]) : Promise.resolve();
		// let the first swing land before settling (Svelte scopes the keyframes' name)
		const swing = needle.getAnimations().find((a) => /swing$/.test(a.animationName));
		const landed = wait(swing ? Math.max(0, 1450 - (swing.currentTime ?? 0)) : 0);
		await Promise.all([fonts, shader, landed]);
		await frames(2);
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
		if (sky) sky.held = true;

		let cancelled = false;
		let raf = 0;
		const read = () => {
			deg = Math.round(heading());
			raf = requestAnimationFrame(read);
		};
		read();

		const anims = [];
		const timers = [];
		whenLoaded(sky).then(() => {
			if (cancelled) return;
			// the needle stops hunting and settles on the bearing
			const from = heading();
			needle.style.animation = 'none';
			needle.style.transform = 'rotate(47deg)';
			const settle = needle.animate([{ transform: `rotate(${from}deg)` }, { transform: 'rotate(47deg)' }], {
				duration: 900,
				easing: CSS.supports?.('animation-timing-function', SETTLE) ? SETTLE : 'cubic-bezier(0.34, 1.56, 0.64, 1)'
			});
			anims.push(settle);
			settle.finished
				.then(() => {
					cancelAnimationFrame(raf);
					deg = 47;
				})
				.catch(() => {});

			const t = 450; // exit begins while the needle is still ringing
			const q = (s) => root.querySelector(s);
			const opts = (delay, duration, easing) => ({ delay: t + delay, duration, easing, fill: 'forwards' });
			anims.push(
				q('.read').animate([{ opacity: 1 }, { opacity: 0 }], opts(0, 300, 'cubic-bezier(0.55, 0, 1, 0.45)')),
				dial.animate(
					[
						{ transform: 'scale(1)', opacity: 1 },
						{ transform: 'scale(0.18)', opacity: 0 }
					],
					opts(50, 700, 'cubic-bezier(0.65, 0, 0.35, 1)')
				)
			);
			// the curtain lifts in hard steps, like a screen redrawing
			const lift = root.animate([{ clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 100% 0)' }], opts(200, 720, 'steps(8)'));
			anims.push(lift);
			lift.finished
				.then(() => {
					gone = true;
					lockScroll(false);
				})
				.catch(() => {});

			timers.push(
				setTimeout(() => {
					if (sky) {
						sky.held = false;
						gsap.fromTo(sky.state, { intro: 0 }, { intro: 1, duration: 2.2, ease: 'power2.out' });
					}
				}, t + 220),
				setTimeout(() => {
					ui.ready = true;
					onDone();
				}, t + 360)
			);
		});

		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			timers.forEach(clearTimeout);
			anims.forEach((a) => a.cancel());
			if (sky) sky.held = false;
		};
	});
</script>

{#if !gone}
	<div class="pre" bind:this={root} aria-hidden="true">
		<div class="dial" bind:this={dial}>
			<svg class="rose" viewBox="0 0 120 120" width="120" height="120">
				<circle class="ring" cx="60" cy="60" r="44" pathLength="1" />
				<g class="ticks">
					{#each Array.from({ length: 32 }, (_, i) => i) as i (i)}
						<line
							x1="60"
							y1={i % 4 === 0 ? 12 : 14}
							x2="60"
							y2="17"
							transform="rotate({i * 11.25} 60 60)"
							style="--i: {i}"
						/>
					{/each}
				</g>
				{#each [0, 90, 180, 270] as r, i (r)}
					<path class="pt" d="M60 20 64 55.5 60 60 56 55.5Z" transform="rotate({r} 60 60)" pathLength="1" style="--i: {i}" />
				{/each}
				{#each [135, 225, 315] as r, i (r)}
					<path class="pt" d="M60 37 62.4 57.6 60 60 57.6 57.6Z" transform="rotate({r} 60 60)" pathLength="1" style="--i: {i + 4}" />
				{/each}
			</svg>
			<svg class="needle" bind:this={needle} viewBox="0 0 120 120" width="120" height="120">
				<path d="M60 23 63.6 56 60 60 56.4 56Z" />
				<circle cx="60" cy="60" r="2.6" class="hub" />
			</svg>
		</div>
		<p class="read label">
			<span>Taking a bearing</span>
			<span class="deg">{String(((deg % 360) + 360) % 360).padStart(3, '0')}°</span>
		</p>
	</div>
{/if}

<style>
	.pre {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: none;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 26px;
		background: var(--night);
	}
	:global(.js) .pre {
		display: flex;
	}
	:global(.js.no-intro) .pre,
	:global(.js.rm) .pre {
		display: none;
	}
	.dial {
		position: relative;
		width: 120px;
		height: 120px;
		will-change: transform, opacity;
	}
	.rose {
		overflow: visible;
		color: var(--text);
	}
	.ring {
		fill: none;
		stroke: var(--hair-3);
		stroke-width: 0.8;
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation: ring 1.1s cubic-bezier(0.45, 0, 0.55, 1) 0.1s forwards;
	}
	.ticks line {
		stroke: var(--muted);
		stroke-width: 0.8;
		opacity: 0;
		animation: on 0.02s linear calc(0.2s + var(--i) * 12ms) forwards;
	}
	/* each point is drawn outward from the middle of its outline, then inked */
	.pt {
		fill: var(--text);
		fill-opacity: 0;
		stroke: var(--text);
		stroke-width: 0.7;
		stroke-linejoin: round;
		stroke-dasharray: 0 1;
		stroke-dashoffset: -0.5;
		animation:
			point 0.9s cubic-bezier(0.45, 0, 0.55, 1) calc(0.1s + var(--i) * 40ms) forwards,
			ink 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) calc(0.7s + var(--i) * 30ms) forwards;
	}
	/* Hunts around the bearing until the page is ready; script then settles it on 047°. */
	.needle {
		position: absolute;
		inset: 0;
		overflow: visible;
		transform: rotate(214deg);
		will-change: transform;
		filter: drop-shadow(0 0 6px rgba(255, 92, 210, 0.45));
		animation:
			swing 1.6s cubic-bezier(0.2, 1.3, 0.35, 1) 0.3s forwards,
			hunt 2.6s ease-in-out 1.9s infinite;
		/* elastic.out(1, 0.34), where CSS linear() is supported */
		animation:
			swing 1.8s
				linear(0, 0.198, 0.462, 0.738, 0.983, 1.168, 1.283, 1.328, 1.314, 1.258, 1.179, 1.094, 1.016, 0.956, 0.917, 0.9, 0.902, 0.917, 0.941, 0.967, 0.991, 1.011, 1.024, 1.03, 1.031, 1.027, 1.02, 1.011, 1.004, 0.997, 0.993, 0.991, 0.99, 0.992, 0.994, 0.996, 0.998, 1.001, 1.002, 1.003, 1.003, 1.003, 1.002, 1.001, 1.001, 1, 0.999, 0.999, 1)
				0.3s forwards,
			hunt 2.6s ease-in-out 2.1s infinite;
	}
	.needle path {
		fill: var(--signal);
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
		opacity: 0;
		animation: read 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
	}
	.deg {
		color: var(--text);
		min-width: 4ch;
	}

	@keyframes ring {
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes on {
		to {
			opacity: 1;
		}
	}
	@keyframes point {
		to {
			stroke-dasharray: 1 0;
			stroke-dashoffset: 0;
		}
	}
	@keyframes ink {
		to {
			fill-opacity: 1;
		}
	}
	@keyframes swing {
		from {
			transform: rotate(214deg);
		}
		to {
			transform: rotate(47deg);
		}
	}
	@keyframes hunt {
		0%,
		100% {
			transform: rotate(47deg);
		}
		28% {
			transform: rotate(56deg);
		}
		72% {
			transform: rotate(39deg);
		}
	}
	@keyframes read {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
