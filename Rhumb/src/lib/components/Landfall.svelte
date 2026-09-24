<script>
	import { onMount } from 'svelte';
	import Install from './Install.svelte';
	import Icon from './Icon.svelte';
	import { landfall, site } from '$lib/content.js';
	import { gsap, ScrollTrigger } from '$lib/motion/gsap.js';
	import { reveal } from '$lib/motion/reveal.js';
	import { paperFront } from '$lib/motion/choreo.js';
	import { scrollTo } from '$lib/motion/scroll.js';
	import { skyBus } from '$lib/gl/sky/bus.js';
	import { ui } from '$lib/state.svelte.js';

	let root = $state();
	let roseEl = $state();
	let roseWrap = $state();

	// A portolan wind rose: 32 rhumb lines, 8 principal winds, 8 half-winds, 16 quarter-winds.
	const C = 320;
	const polar = (deg, r) => {
		const a = ((deg - 90) * Math.PI) / 180;
		return [C + Math.cos(a) * r, C + Math.sin(a) * r];
	};
	const rays = Array.from({ length: 32 }, (_, i) => {
		const [x2, y2] = polar(i * 11.25, 980);
		return { x2, y2, major: i % 4 === 0 };
	});
	const ticks = Array.from({ length: 72 }, (_, i) => {
		const d = i * 5;
		const long = d % 45 === 0;
		const [x1, y1] = polar(d, 238);
		const [x2, y2] = polar(d, long ? 256 : 248);
		return { x1, y1, x2, y2, long };
	});
	// A point of the rose split along its axis: one half inked, the other left open.
	const point = (deg, len, w, at) => {
		const tip = polar(deg, len);
		const l = polar(deg - 90, w);
		const r = polar(deg + 90, w);
		const base = polar(deg, at);
		const lx = l[0] - C + base[0] - C + C;
		const ly = l[1] - C + base[1] - C + C;
		const rx = r[0] - C + base[0] - C + C;
		const ry = r[1] - C + base[1] - C + C;
		return {
			dark: `M${C} ${C} L${lx.toFixed(1)} ${ly.toFixed(1)} L${tip[0].toFixed(1)} ${tip[1].toFixed(1)} Z`,
			light: `M${C} ${C} L${rx.toFixed(1)} ${ry.toFixed(1)} L${tip[0].toFixed(1)} ${tip[1].toFixed(1)} Z`
		};
	};
	const points = [
		...[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((d) => ({ ...point(d, 112, 9, 22), k: 'q' })),
		...[45, 135, 225, 315].map((d) => ({ ...point(d, 168, 15, 32), k: 'h' })),
		...[0, 90, 180, 270].map((d) => ({ ...point(d, 232, 22, 42), k: 'p' }))
	];
	const letters = [
		{ t: 'N', d: 0 },
		{ t: 'E', d: 90 },
		{ t: 'S', d: 180 },
		{ t: 'W', d: 270 }
	].map((l) => {
		const [x, y] = polar(l.d, 282);
		return { ...l, x, y };
	});
	const needle = point(47, 250, 7, 30);
	const [nx, ny] = polar(47, 272);

	onMount(() => {
		const q = gsap.utils.selector(root);
		const inkable = q('[data-ink]');
		let drawn = false;
		let near = false;

		const ctx = gsap.context(() => {
			reveal(root, { start: 'top 60%' });
			if (ui.reduced) return;
			gsap.set(q('.rose .draw'), { drawSVG: 0 });
			gsap.set(q('.rose .fill'), { opacity: 0 });
		}, root);

		function drawRose() {
			if (drawn || !roseEl) return;
			drawn = true;
			if (ui.reduced) return;
			const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
			tl.to(q('.rose .rays .draw'), { drawSVG: '100%', duration: 2.2, stagger: { each: 0.02, from: 'random' } }, 0)
				.to(q('.rose .rings .draw'), { drawSVG: '100%', duration: 1.6, stagger: 0.15 }, 0.2)
				.to(q('.rose .pts .draw'), { drawSVG: '100%', duration: 1.1, stagger: 0.03 }, 0.5)
				.to(q('.rose .fill'), { opacity: 1, duration: 0.6, stagger: 0.02, ease: 'power1.out' }, 1.2)
				.to(q('.rose .ticks'), { opacity: 1, duration: 0.8 }, 0.9)
				.to(q('.rose .letters text'), { opacity: 1, duration: 0.6, stagger: 0.08 }, 1.4)
				.fromTo(q('.rose .needle'), { rotation: -38, svgOrigin: `${C} ${C}` }, { rotation: 0, svgOrigin: `${C} ${C}`, duration: 2.4, ease: 'elastic.out(1, 0.3)' }, 1.3)
				.to(q('.rose .needle, .rose .brg'), { opacity: 1, duration: 0.4 }, 1.3);
		}

		// Each block of text turns to ink at the moment the dawn front passes through it.
		const st = ScrollTrigger.create({
			trigger: root,
			start: 'top bottom',
			end: 'bottom top',
			onToggle: (self) => (near = self.isActive)
		});
		const tick = () => {
			if (!near) return;
			const sky = skyBus.sky;
			const front = sky ? paperFront(sky.state.paper) : ui.day ? 2 : -1;
			const vh = window.innerHeight;
			for (const el of inkable) {
				const r = el.getBoundingClientRect();
				// the rose starts printing as soon as the paper reaches its lower edge
				const c = 1 - (el === roseEl ? r.bottom - r.height * 0.1 : r.top + r.height * 0.5) / vh;
				const inked = front > c;
				if (inked !== el.hasAttribute('data-inked')) {
					el.toggleAttribute('data-inked', inked);
					if (inked && el === roseEl) drawRose();
				}
				// ...and only exists on paper: masked off above the dawn front
				if (el === roseEl) roseWrap.style.setProperty('--cut', `${(vh * (1 - front)).toFixed(1)}px`);
			}
		};
		gsap.ticker.add(tick);

		// The install block waits for daylight; a keyboard user who tabs into it early is
		// carried forward to the morning so they can see what they are focusing.
		const act = q('.act')[0];
		const onFocus = () => {
			if (act.hasAttribute('data-inked')) return;
			const top = root.getBoundingClientRect().top + window.scrollY;
			scrollTo(top + window.innerHeight * 1.5, { duration: 1.2 });
		};
		act.addEventListener('focusin', onFocus);

		return () => {
			act.removeEventListener('focusin', onFocus);
			gsap.ticker.remove(tick);
			st.kill();
			ctx.revert();
		};
	});
</script>

<section id="landfall" class="landfall" aria-labelledby="landfall-title" bind:this={root}>
	<div class="stage">
		<div class="rose-wrap" bind:this={roseWrap} aria-hidden="true">
			<svg class="rose" bind:this={roseEl} data-ink viewBox="0 0 640 640">
				<defs>
					<!-- the rhumb lines thin out into the paper instead of stopping at an edge -->
					<radialGradient id="rays-fade" gradientUnits="userSpaceOnUse" cx={C} cy={C} r="760">
						<stop offset="0.36" stop-color="#fff" />
						<stop offset="1" stop-color="#000" />
					</radialGradient>
					<mask id="rays-mask" maskUnits="userSpaceOnUse" x={C - 1000} y={C - 1000} width="2000" height="2000">
						<rect x={C - 1000} y={C - 1000} width="2000" height="2000" fill="url(#rays-fade)" />
					</mask>
				</defs>
				<g class="rays" mask="url(#rays-mask)">
					{#each rays as r, i (i)}
						<line class="draw" class:major={r.major} x1={C} y1={C} x2={r.x2} y2={r.y2} />
					{/each}
				</g>
				<g class="rings">
					<circle class="draw" cx={C} cy={C} r="262" />
					<circle class="draw" cx={C} cy={C} r="238" />
					<circle class="draw thin" cx={C} cy={C} r="150" />
					<circle class="draw thin" cx={C} cy={C} r="58" />
				</g>
				<g class="ticks">
					{#each ticks as t, i (i)}
						<line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} class:long={t.long} />
					{/each}
				</g>
				<g class="pts">
					{#each points as p, i (i)}
						<path class="fill k-{p.k}" d={p.dark} />
						<path class="draw" d={p.dark} />
						<path class="draw" d={p.light} />
					{/each}
				</g>
				<g class="letters">
					{#each letters as l (l.t)}
						<text x={l.x} y={l.y} text-anchor="middle" dominant-baseline="central">{l.t}</text>
					{/each}
				</g>
				<g class="needle">
					<path class="n-dark" d={needle.dark} />
					<path class="n-light" d={needle.light} />
					<circle cx={C} cy={C} r="9" class="hub" />
					<circle cx={C} cy={C} r="3" class="hub-in" />
				</g>
				<text class="brg" x={nx + 10} y={ny - 6}>047°</text>
			</svg>
		</div>

		<div class="wrap inner">
			<p class="sec-head label" data-ink>
				<span class="n">08</span><span>Landfall</span><span class="rule"></span><span>08:00</span>
			</p>
			<h2 id="landfall-title" class="title" data-r="lines" data-ink>
				{landfall.title[0]} <span class="b">{landfall.title[1]}</span>
			</h2>
			<p class="aside" data-ink>{landfall.aside}</p>
			<p class="lede" data-ink>{landfall.lede}</p>
			<div class="act" data-ink>
				<Install id="landfall-install" compact />
				<a class="docs label" href={site.github} target="_blank" rel="noreferrer">
					<Icon name="github" size={13} />
					<span>Star it on GitHub</span>
					<Icon name="arrow-ne" size={11} />
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.landfall {
		position: relative;
		height: 280vh;
		color: var(--text);
	}
	.stage {
		position: sticky;
		top: 0;
		height: 100vh;
		min-height: 640px;
		display: flex;
		align-items: center;
		overflow: hidden;
	}
	.inner {
		padding-left: clamp(0px, 5vw, 64px);
		position: relative;
		z-index: 1;
	}

	/* ---- dawn → ink ---- */
	.sec-head,
	.title,
	.title .b,
	.aside,
	.lede,
	.docs {
		transition: color 0.35s linear;
	}
	.sec-head {
		margin-bottom: 32px;
	}
	.sec-head:global([data-inked]) {
		color: var(--ink-2);
	}
	.sec-head:global([data-inked]) .n {
		color: var(--delft);
	}
	.sec-head:global([data-inked]) .rule {
		background: linear-gradient(90deg, rgba(22, 35, 75, 0.25), transparent);
	}

	.title {
		font-size: clamp(3.2rem, 8.2vw, 8.4rem);
		font-weight: 520;
		line-height: 0.92;
		letter-spacing: -0.055em;
		max-width: 11.5em;
	}
	.title .b {
		display: block;
		color: var(--signal);
	}
	.title:global([data-inked]) {
		color: var(--ink);
	}
	.title:global([data-inked]) .b {
		color: var(--delft);
	}

	.aside {
		font-family: var(--f-serif);
		font-style: italic;
		font-size: clamp(2.6rem, 6.4vw, 6.6rem);
		line-height: 1;
		letter-spacing: -0.02em;
		margin: 0.08em 0 0.5em 0.04em;
		color: var(--text-2);
	}
	.aside:global([data-inked]) {
		color: var(--delft);
	}

	.lede {
		max-width: 38ch;
		margin-bottom: 30px;
	}
	.act {
		display: grid;
		gap: 18px;
		max-width: 540px;
	}
	/* The practical bits wait for daylight. */
	:global(.js:not(.rm)) .lede,
	:global(.js:not(.rm)) .act {
		opacity: 0;
		transform: translateY(14px);
		transition:
			opacity 0.9s var(--ease),
			transform 1s var(--ease),
			color 0.35s linear;
	}
	:global(.js:not(.rm)) .act {
		transition-delay: 0.12s;
	}
	.lede:global([data-inked]),
	.act:global([data-inked]) {
		opacity: 1 !important;
		transform: none !important;
	}
	.lede:global([data-inked]) {
		color: var(--ink-2);
	}
	.docs {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		font-size: 10.5px;
		color: var(--text-2);
	}
	.docs :global(svg) {
		transition: transform 0.45s var(--ease);
	}
	.docs:hover :global(svg:last-child) {
		transform: translate(2px, -2px);
	}
	.act:global([data-inked]) .docs {
		color: var(--ink);
	}
	.act:global([data-inked]) .docs:hover {
		color: var(--delft);
	}

	/* ---- the rose ---- */
	.rose {
		position: absolute;
		right: 2vw;
		top: 50%;
		width: min(44vw, 70vh, 640px);
		height: auto;
		translate: 0 -50%;
		overflow: visible;
		pointer-events: none;
		color: var(--delft);
	}
	/* Two masks: only on paper (below the dawn front), and faded out before the stage's
	   foot so the rhumb lines never end on a hard edge where the footer begins. */
	.rose-wrap {
		--cut: 100%;
		position: absolute;
		inset: 0;
		pointer-events: none;
		-webkit-mask-image:
			linear-gradient(to bottom, transparent calc(var(--cut) - 40px), #000 calc(var(--cut) + 40px)),
			linear-gradient(to top, transparent, #000 24%);
		-webkit-mask-composite: source-in;
		mask-image:
			linear-gradient(to bottom, transparent calc(var(--cut) - 40px), #000 calc(var(--cut) + 40px)),
			linear-gradient(to top, transparent, #000 24%);
		mask-composite: intersect;
	}
	.rays line {
		stroke: rgba(31, 61, 145, 0.16);
		stroke-width: 0.6;
	}
	.rays line.major {
		stroke: rgba(31, 61, 145, 0.3);
	}
	.rings circle {
		fill: none;
		stroke: var(--delft);
		stroke-width: 1;
	}
	.rings .thin {
		stroke-width: 0.6;
		stroke-dasharray: 2 4;
	}
	.ticks {
		opacity: 0;
	}
	.ticks line {
		stroke: var(--delft);
		stroke-width: 0.7;
	}
	.ticks line.long {
		stroke-width: 1.2;
	}
	.pts .draw {
		fill: none;
		stroke: var(--ink);
		stroke-width: 0.9;
		stroke-linejoin: round;
	}
	.pts .fill {
		fill: var(--delft);
	}
	.pts .fill.k-q {
		fill: rgba(31, 61, 145, 0.55);
	}
	.letters text {
		font-family: var(--f-serif);
		font-style: italic;
		font-size: 22px;
		fill: var(--ink);
		opacity: 0;
	}
	.needle {
		opacity: 0;
	}
	.n-dark {
		fill: var(--ink);
	}
	.n-light {
		fill: var(--paper);
		stroke: var(--ink);
		stroke-width: 0.9;
	}
	.hub {
		fill: var(--paper);
		stroke: var(--ink);
		stroke-width: 1;
	}
	.hub-in {
		fill: var(--ink);
	}
	.brg {
		font-family: var(--f-mono);
		font-size: 13px;
		letter-spacing: 0.08em;
		fill: var(--ink);
		opacity: 0;
	}
	/* Before the paper arrives, the rose isn't there at all. */
	:global(.js) .rose:not([data-inked]) {
		visibility: hidden;
	}
	:global(.rm) .rose .ticks,
	:global(.rm) .rose .needle,
	:global(.rm) .rose .brg,
	:global(.rm) .rose .letters text {
		opacity: 1;
	}

	@media (max-width: 900px) {
		.rose-wrap {
			-webkit-mask-image: linear-gradient(to bottom, transparent calc(var(--cut) - 40px), #000 calc(var(--cut) + 40px));
			mask-image: linear-gradient(to bottom, transparent calc(var(--cut) - 40px), #000 calc(var(--cut) + 40px));
		}
		/* the rose drops below the text and is cropped by the edge of the page */
		.rose {
			width: 96vw;
			right: -34vw;
			top: auto;
			bottom: -30vw;
			translate: none;
			opacity: 0.5;
		}
	}
	@media (max-width: 640px) {
		.landfall {
			height: 240vh;
		}
	}
</style>
