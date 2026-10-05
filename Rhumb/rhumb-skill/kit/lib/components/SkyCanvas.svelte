<script>
	import { onMount } from 'svelte';
	import { Sky } from '$lib/gl/sky/Sky.js';
	import { skyConfig } from '$lib/sky.config.js';
	import { skyBus } from '$lib/gl/sky/bus.js';
	import { hasWebGL2 } from '$lib/gl/glsl.js';
	import { gsap } from '$lib/motion/gsap.js';
	import { ui } from '$lib/state.svelte.js';

	let canvas;

	onMount(() => {
		if (!hasWebGL2()) {
			ui.gl = false;
			return;
		}
		let sky;
		try {
			sky = new Sky(canvas, { ...skyConfig, reduced: ui.reduced });
		} catch (err) {
			console.warn('[sky] disabled:', err);
			ui.gl = false;
			return;
		}
		skyBus.sky = sky;

		const tick = (_t, dtMs) => sky.render(Math.min(dtMs, 60) / 1000);
		gsap.ticker.add(tick);

		let raf = 0;
		const onResize = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => sky.resize());
		};
		const onVis = () => (sky.visible = !document.hidden);
		window.addEventListener('resize', onResize);
		document.addEventListener('visibilitychange', onVis);

		return () => {
			gsap.ticker.remove(tick);
			window.removeEventListener('resize', onResize);
			document.removeEventListener('visibilitychange', onVis);
			sky.destroy();
			skyBus.sky = null;
		};
	});
</script>

<div
	class="sky"
	class:off={!ui.gl}
	class:past={ui.section > 0}
	class:day={ui.day}
	style:--limb-x={skyConfig.layout.planet === 'left' ? '-13%' : '113%'}
	aria-hidden="true"
>
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.sky {
		position: fixed;
		inset: 0 auto auto 0;
		width: 100vw;
		height: 100lvh;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
		background: var(--night);
	}
	canvas {
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		width: 100%;
		height: 100%;
	}
	/* Without WebGL: a flat planet limb and a little dust, drawn with gradients. */
	.sky.off canvas {
		display: none;
	}
	.sky.off {
		background:
			radial-gradient(
				circle at var(--limb-x) 169%,
				var(--signal-2) 0 56%,
				var(--rim) 56.3%,
				color-mix(in srgb, var(--rim) 25%, transparent) 57%,
				transparent 64%
			),
			radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--text) 5%, transparent), transparent 40%),
			var(--night);
		transition: background-color 0.8s var(--ease);
	}
	/* past the hero the planet sets; at landfall the page turns to paper */
	.sky.off.past {
		background: var(--night);
	}
	.sky.off.day {
		background: var(--paper);
	}
</style>
