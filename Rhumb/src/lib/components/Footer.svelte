<script>
	import { onMount } from 'svelte';
	import Mark from './Mark.svelte';
	import Icon from './Icon.svelte';
	import { footer, site } from '$lib/content.js';
	import { gsap, ScrollTrigger } from '$lib/motion/gsap.js';
	import { ui } from '$lib/state.svelte.js';
	import { setSea } from '$lib/audio/bell.js';
	import { scrollTo } from '$lib/motion/scroll.js';

	let root = $state();

	// In-page links glide back up the night; placeholder links (#) stay put.
	function go(e, href) {
		if (!href.startsWith('#')) return;
		e.preventDefault();
		if (href.length > 1) {
			scrollTo(href, { duration: 2.6 });
			history.replaceState(null, '', href);
		}
	}
	let canvas = $state();
	let plateReady = $state(false);

	onMount(() => {
		const q = gsap.utils.selector(root);
		let plate = null;
		let alive = true;
		let visible = false;

		const ctx = gsap.context(() => {
			if (!ui.reduced) {
				gsap.from(q('.brand-col > *, .col'), {
					autoAlpha: 0,
					y: 16,
					duration: 1.2,
					stagger: 0.07,
					scrollTrigger: { trigger: root, start: 'top 55%', once: true }
				});
				gsap.from(q('.colophon > *'), {
					autoAlpha: 0,
					duration: 1.2,
					stagger: 0.1,
					scrollTrigger: { trigger: q('.colophon')[0], start: 'top 98%', once: true }
				});
			}
			ScrollTrigger.create({
				trigger: root,
				start: 'top bottom',
				end: 'bottom top',
				onToggle: (self) => {
					visible = self.isActive;
					if (plate) plate.visible = visible;
					if (ui.sound) setSea(visible ? 1 : 0);
				},
				onUpdate: (self) => {
					if (plate) plate.enter = Math.min(1, self.progress * 1.8);
				}
			});
		}, root);

		// The engraving is loaded after the page settles; it's the last thing anyone sees.
		const load = async () => {
			if (!ui.gl) return;
			const { Plate } = await import('$lib/gl/plate/Plate.js');
			if (!alive) return;
			try {
				plate = new Plate(canvas, { reduced: ui.reduced });
				plate.visible = visible;
				const t = (_t, dt) => plate.render(Math.min(dt, 60) / 1000);
				gsap.ticker.add(t);
				plate._tick = t;
				plateReady = true;
			} catch (err) {
				console.warn('[rhumb] engraving disabled:', err);
			}
		};
		const idle = window.requestIdleCallback || ((f) => setTimeout(f, 600));
		const handle = idle(load, { timeout: 2500 });

		const onResize = () => plate?.resize();
		window.addEventListener('resize', onResize);

		return () => {
			alive = false;
			window.cancelIdleCallback?.(handle);
			window.removeEventListener('resize', onResize);
			if (plate) {
				gsap.ticker.remove(plate._tick);
				plate.destroy();
			}
			ctx.revert();
		};
	});

	$effect(() => {
		// sound switched while the footer is on screen
		if (!ui.sound) setSea(0);
	});
</script>

<footer class="foot" bind:this={root} aria-label="Site">
	<div class="plate" class:ready={plateReady} aria-hidden="true">
		<canvas bind:this={canvas}></canvas>
	</div>

	<div class="over">
		<div class="brand-col">
			<a class="brand" href="#heading" aria-label="Rhumb, back to the top" onclick={(e) => go(e, '#heading')}>
				<Mark size={24} />
				<span class="word">rhumb</span>
			</a>
			<ul class="social">
				<li><a href={site.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Icon name="github" size={18} /></a></li>
				<li><a href={site.discord} target="_blank" rel="noreferrer" aria-label="Discord"><Icon name="discord" size={19} /></a></li>
				<li><a href={site.x} target="_blank" rel="noreferrer" aria-label="X"><Icon name="x" size={16} /></a></li>
			</ul>
		</div>

		<nav class="cols" aria-label="Footer">
			{#each footer.columns as c (c.h)}
				<div class="col">
					<h2>{c.h}</h2>
					<ul>
						{#each c.links as l (l.t)}
							<li><a href={l.href} onclick={(e) => go(e, l.href)}>{l.t}</a></li>
						{/each}
					</ul>
				</div>
			{/each}
		</nav>
	</div>

	<div class="plate-room" aria-hidden="true"></div>

	<div class="colophon">
		<span class="copy">© {site.year} {site.company}</span>
		<span class="caption">{footer.plate}</span>
		<span class="sculp">{footer.coords} · {footer.sculp}</span>
	</div>
</footer>

<style>
	.foot {
		--margin: 60px;
		position: relative;
		z-index: 2;
		min-height: max(100vh, 720px);
		color: var(--ink);
		background: var(--paper);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	/* The image stops short of the bottom, leaving a margin for the caption, as on a print. */
	.plate {
		position: absolute;
		inset: 0 0 var(--margin) 0;
		background:
			repeating-linear-gradient(to bottom, rgba(31, 61, 145, 0.1) 0 1px, transparent 1px 4px) 0 100% / 100% 36% no-repeat,
			var(--paper);
	}
	.plate.ready {
		background: var(--paper);
	}
	.plate::after {
		content: '';
		position: absolute;
		inset: 0;
		box-shadow: inset 0 -1px 0 rgba(22, 35, 75, 0.35);
		pointer-events: none;
	}
	.plate canvas {
		display: block;
	}

	/* Links sit in the open sky on the left; the headland keeps the right of the plate. */
	.over {
		position: relative;
		width: min(1240px, 100% - 2 * var(--gutter));
		margin-inline: auto;
		padding-top: clamp(64px, 10vh, 110px);
		display: grid;
		grid-template-columns: 190px minmax(0, 720px);
		gap: 40px;
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 30px;
	}
	.word {
		font-size: 21px;
		font-weight: 600;
		letter-spacing: -0.04em;
	}
	.social {
		display: grid;
		gap: 6px;
		justify-items: start;
	}
	.social a {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		margin-left: -7px;
		color: var(--ink);
		transition: color 0.3s var(--ease), transform 0.4s var(--ease);
	}
	.social a:hover {
		color: var(--delft);
		transform: translateX(3px);
	}

	.cols {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 32px;
	}
	.col h2 {
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.01em;
		margin-bottom: 18px;
	}
	.col ul {
		display: grid;
		gap: 9px;
	}
	.col a {
		font-size: 13.5px;
		color: #2b3558;
		background-image: linear-gradient(currentColor, currentColor);
		background-size: 0% 1px;
		background-repeat: no-repeat;
		background-position: 0 100%;
		transition:
			background-size 0.45s var(--ease),
			color 0.3s var(--ease);
	}
	.col a:hover {
		color: var(--delft);
		background-size: 100% 1px;
	}
	:global(.day) .foot :focus-visible,
	.foot :focus-visible {
		outline-color: var(--delft);
	}

	.colophon {
		position: relative;
		width: min(1240px, 100% - 2 * var(--gutter));
		height: var(--margin);
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 24px;
		align-items: center;
		font-size: 12px;
		color: var(--ink-2);
	}
	.caption {
		font-family: var(--f-serif);
		font-style: italic;
		font-size: 16px;
		color: var(--ink);
		text-align: center;
	}
	.sculp {
		text-align: right;
		font-family: var(--f-mono);
		font-size: 10px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.copy {
		font-family: var(--f-mono);
		font-size: 10px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	@media (max-width: 1000px) {
		.over {
			grid-template-columns: 1fr;
			gap: 36px;
		}
		.brand-col {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.brand {
			margin-bottom: 0;
		}
		.social {
			display: flex;
			gap: 8px;
		}
	}
	.plate-room {
		display: none;
	}

	/* Narrow screens: links on bare paper first, then the plate as a band beneath them. */
	@media (max-width: 720px) {
		.foot {
			--band: min(125vw, 560px);
			--margin: 116px;
			min-height: 0;
		}
		.plate {
			top: auto;
			height: var(--band);
		}
		.plate-room {
			display: block;
			height: calc(var(--band) + 24px);
		}
		.cols {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 30px 20px;
		}
		.colophon {
			grid-template-columns: 1fr;
			gap: 4px;
			align-content: center;
			padding-top: 8px;
			text-align: left;
		}
		.caption,
		.sculp {
			text-align: left;
		}
	}
</style>
