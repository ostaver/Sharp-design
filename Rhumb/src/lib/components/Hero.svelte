<script>
	import { onMount } from 'svelte';
	import Install from './Install.svelte';
	import { hero, site } from '$lib/content.js';
	import { gsap, ScrollTrigger, SplitText, SCRAMBLE } from '$lib/motion/gsap.js';
	import { ui } from '$lib/state.svelte.js';
	import { cine } from '$lib/motion/cine.js';

	let root = $state();
	let modelEl = $state();
	let mi = $state(0);
	let played = false;
	const pad = (n) => String(n).padStart(2, '0');

	function intro() {
		if (played || !root) return;
		played = true;
		const q = gsap.utils.selector(root);

		if (ui.reduced) {
			gsap.set(q('[data-in]'), { autoAlpha: 1 });
			return;
		}

		// aria: 'none' — SplitText's default puts aria-label on the line span, which has no role to carry a name; the h1 is named instead.
		const split = SplitText.create(q('h1 .ln'), { type: 'words,chars', mask: 'words', wordsClass: 'w', charsClass: 'ch', aria: 'none' });
		const wide = window.matchMedia('(min-width: 861px) and (pointer: fine)').matches;
		const tl = gsap.timeline({ defaults: { ease: 'helm' } });
		// Opening shot: the frame starts letterboxed and opens out as the title lands.
		tl.to(cine, { intro: 0, duration: 2.1, ease: 'power3.inOut' }, 0.35);
		if (wide) tl.fromTo(q('h1'), { filter: 'blur(14px)' }, { filter: 'blur(0px)', duration: 1.9, ease: 'power2.out', clearProps: 'filter' }, 0.1);
		tl.set(q('[data-in]'), { autoAlpha: 1 }, 0)
			.from(q('.eyebrow .dot'), { scale: 0, duration: 0.6 }, 0)
			.from(q('.eyebrow .t'), { duration: 1.1, scrambleText: { text: '', chars: SCRAMBLE, revealDelay: 0.2 } }, 0.05)
			.from(split.chars, { yPercent: 125, duration: 1.25, stagger: 0.016 }, 0.1)
			.from(q('.lede'), { autoAlpha: 0, y: 16, duration: 1.1 }, 0.55)
			.from(q('.strike'), { autoAlpha: 0, y: 12, duration: 1 }, 0.68)
			.fromTo(q('.strike s'), { '--cut': 0 }, { '--cut': 1, duration: 0.7, ease: 'power3.inOut' }, 1.25)
			.from(q('.install .tabs > *'), { autoAlpha: 0, y: 8, duration: 0.8, stagger: 0.06 }, 0.8)
			.from(q('.install .cmd'), { clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'haul' }, 0.9)
			.from(q('.install code'), { duration: 1.1, scrambleText: { text: '', chars: 'lowerCase', revealDelay: 0.3 } }, 1.1)
			.from(q('.helm > *'), { autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 1.15)
			.from(q('.chrome > *'), { autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 1.3);
	}

	onMount(() => {
		const q = gsap.utils.selector(root);
		// The copy lifts away while the camera falls into the planet.
		const ctx = gsap.context(() => {
			if (ui.reduced) return;
			gsap.to(q('.hero-copy'), {
				yPercent: -18,
				autoAlpha: 0,
				ease: 'none',
				scrollTrigger: { trigger: root, start: 'top top', end: '21% top', scrub: true }
			});
			gsap.to(q('.chrome'), {
				autoAlpha: 0,
				ease: 'none',
				scrollTrigger: { trigger: root, start: 'top top', end: '14% top', scrub: true }
			});
			const through = { trigger: q('.through')[0], start: 'top 78%', once: true };
			gsap.from(q('.through .plumb'), { scaleY: 0, transformOrigin: 'top', duration: 1.2, ease: 'haul', scrollTrigger: through });
			gsap.from(q('.through .label'), { opacity: 0, y: 10, duration: 1, stagger: 0.12, delay: 0.3, scrollTrigger: through });
		}, root);

		// Every model takes a turn at the helm, only while the hero is on screen.
		let helm = null;
		const turn = () => {
			mi = (mi + 1) % hero.models.length;
			gsap.to(modelEl, { duration: 0.9, scrambleText: { text: hero.models[mi], chars: SCRAMBLE, speed: 0.6 } });
			helm = gsap.delayedCall(2.6, turn);
		};
		const helmST = ui.reduced
			? null
			: ScrollTrigger.create({
					trigger: root,
					start: 'top bottom',
					end: '30% top',
					onToggle: (self) => {
						helm?.kill();
						helm = self.isActive ? gsap.delayedCall(2.6, turn) : null;
					}
				});

		return () => {
			helm?.kill();
			helmST?.kill();
			ctx.revert();
		};
	});

	$effect(() => {
		if (ui.ready) intro();
	});
</script>

<section id="heading" class="hero" aria-labelledby="hero-title" bind:this={root}>
	<div class="stage">
		<div class="hero-copy">
			<p class="eyebrow label" data-in><span class="dot" aria-hidden="true"></span><span class="t">{hero.eyebrow}</span></p>
			<h1 id="hero-title" aria-label="{hero.lines.join(' ')}." data-in>
				<span class="ln l1">{hero.lines[0]}</span>
				<span class="ln l2">{hero.lines[1]}</span>
				<span class="ln l3">{hero.lines[2]}<span class="stop">.</span></span>
			</h1>
			<p class="lede" data-in>{hero.lede}</p>
			<p class="strike" data-in>
				{hero.strike.before}<s>{hero.strike.struck}</s>{hero.strike.after}
			</p>
			<div class="install-wrap" data-in>
				<Install id="hero-install" />
			</div>
			<div class="models" data-in>
				<p class="helm" aria-hidden="true">
					<span class="label k">{hero.modelsLabel}</span>
					<span class="model" bind:this={modelEl}>{hero.models[0]}</span>
					<span class="rule"></span>
					<span class="label idx">{pad(mi + 1)}/{pad(hero.models.length)}</span>
				</p>
				<p class="sr-only">Works with any model: {hero.models.join(', ')}.</p>
			</div>
		</div>

		<div class="chrome" aria-hidden="true">
			<span class="maker" data-in>
				<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 1v11h9.5L3 1z" fill="currentColor" /><path d="M1 12.8h12" stroke="currentColor" stroke-width="1.2" /></svg>
				Leftovers
			</span>
			<span class="legal label" data-in>{site.company} © {site.year}</span>
		</div>
	</div>

	<!-- The first log line, in the clear air below the dive. -->
	<div class="through" aria-hidden="true">
		<span class="plumb"></span>
		<p class="label">{hero.through[0]}</p>
		<p class="label sub">{hero.through[1]}</p>
	</div>
</section>

<style>
	.hero {
		position: relative;
		z-index: 1;
		height: 205vh;
	}
	.stage {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100svh;
		min-height: 640px;
		display: flex;
		align-items: center;
		overflow: clip;
	}
	.hero-copy {
		width: min(1080px, 100% - 2 * var(--gutter));
		margin-inline: auto;
		padding: 88px 0 56px 110px;
		position: relative;
	}
	/* A patch of deeper night behind the copy: the planet's dust thins out where the
	   small type sits, and fades away with the copy on the dive. */
	.hero-copy::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset: -4% -12% -8% 2%;
		pointer-events: none;
		background: radial-gradient(ellipse 58% 56% at 38% 64%, rgba(5, 5, 7, 0.8), rgba(5, 5, 7, 0.52) 52%, transparent 78%);
	}
	:global(.js) [data-in] {
		visibility: hidden;
	}
	:global(.js.rm) [data-in],
	:global(.js.no-intro) [data-in] {
		visibility: visible;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 26px;
		color: var(--teal);
		font-size: 10.5px;
		letter-spacing: 0.24em;
	}
	.dot {
		width: 6px;
		height: 6px;
		background: var(--teal);
		box-shadow: 0 0 10px rgba(63, 209, 174, 0.7);
		animation: blink 2.4s steps(1) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0.25;
		}
	}

	h1 {
		display: flex;
		flex-direction: column;
		font-size: clamp(3rem, 6.35vw, 6.4rem);
		font-weight: 520;
		line-height: 0.95;
		letter-spacing: -0.048em;
		margin: 0 0 30px -0.06em;
	}
	.ln {
		display: block;
		padding-bottom: 0.04em;
	}
	.l1 {
		color: var(--text);
	}
	.l2 {
		color: #b9b8c3;
	}
	.l3 {
		color: var(--signal);
	}
	.stop {
		color: var(--text);
	}
	h1 :global(.ch) {
		display: inline-block;
		will-change: transform;
	}

	.lede {
		max-width: 44ch;
		font-size: clamp(1rem, 0.3vw + 0.94rem, 1.1rem);
		line-height: 1.6;
		color: var(--dim);
	}
	.strike {
		margin: 6px 0 38px;
		font-size: clamp(1rem, 0.3vw + 0.94rem, 1.1rem);
		color: var(--text);
	}
	s {
		--cut: 1;
		position: relative;
		text-decoration: none;
		color: var(--text-2);
	}
	s::after {
		content: '';
		position: absolute;
		left: -2px;
		right: -2px;
		top: 54%;
		height: 1.5px;
		background: currentColor;
		transform: scaleX(var(--cut));
		transform-origin: left;
	}

	.install-wrap {
		max-width: 540px;
	}

	.models {
		margin-top: 30px;
		max-width: 540px;
	}
	/* One readout instead of a wall of names: whoever has the helm, in turn. */
	.helm {
		display: flex;
		align-items: baseline;
		gap: 14px;
	}
	.helm .k {
		font-size: 10px;
		color: var(--muted);
		white-space: nowrap;
	}
	.helm .rule {
		flex: 1;
		height: 1px;
		align-self: center;
		background: linear-gradient(90deg, var(--hair-2), var(--hair));
	}
	.model {
		font-family: var(--f-serif);
		font-style: italic;
		font-size: 1.5rem;
		line-height: 1;
		letter-spacing: -0.01em;
		color: var(--text);
		min-width: 5.4em;
		white-space: nowrap;
	}
	.helm .idx {
		font-size: 9.5px;
		color: var(--faint);
		font-variant-numeric: tabular-nums;
	}

	.chrome {
		position: absolute;
		inset: auto 0 0 0;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding: 0 18px 18px;
		pointer-events: none;
	}
	.maker {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 13px;
		font-weight: 560;
		letter-spacing: -0.02em;
		color: var(--text);
	}
	.legal {
		font-size: 9.5px;
		letter-spacing: 0.2em;
		color: var(--muted);
		padding: 7px 10px;
		border: 1px solid var(--hair);
		background: rgba(10, 10, 14, 0.6);
	}

	.through {
		position: absolute;
		left: 0;
		right: 0;
		top: 163vh;
		display: grid;
		justify-items: center;
		gap: 9px;
		text-align: center;
		pointer-events: none;
	}
	.plumb {
		width: 1px;
		height: 72px;
		margin-bottom: 8px;
		background: linear-gradient(to bottom, transparent, var(--hair-3) 60%, var(--signal));
	}
	.through .label {
		font-size: 10.5px;
		letter-spacing: 0.24em;
		color: var(--dim);
	}
	.through .sub {
		font-size: 9.5px;
		color: var(--muted);
	}
	/* without the dive the copy never clears the stage, so there is no quiet stretch */
	:global(.rm) .through {
		display: none;
	}

	@media (max-width: 1180px) {
		.hero-copy {
			padding-left: 64px;
		}
	}
	@media (max-width: 1023px) {
		.hero-copy {
			padding-left: 0;
		}
	}
	@media (max-width: 640px) {
		.hero {
			height: 190vh;
		}
		.through {
			top: 150vh;
		}
		.hero-copy {
			padding-top: 96px;
			padding-bottom: 120px;
			align-self: flex-start;
		}
		.stage {
			align-items: flex-start;
		}
		h1 {
			font-size: clamp(2.6rem, 11.5vw, 3.6rem);
			margin-bottom: 22px;
		}
		.strike {
			margin-bottom: 30px;
		}
		.chrome {
			padding: 0 16px 14px;
		}
	}
	@media (max-height: 760px) and (min-width: 641px) {
		h1 {
			font-size: clamp(2.8rem, 5.2vw, 5rem);
			margin-bottom: 22px;
		}
		.strike {
			margin-bottom: 26px;
		}
		.models {
			margin-top: 22px;
		}
	}
</style>
