<script>
	import { onMount } from 'svelte';
	import Install from './Install.svelte';
	import { hero, site } from '$lib/content.js';
	import { gsap, ScrollTrigger, SplitText, SCRAMBLE } from '$lib/motion/gsap.js';
	import { ui } from '$lib/state.svelte.js';

	let root = $state();
	let played = false;

	function intro() {
		if (played || !root) return;
		played = true;
		const q = gsap.utils.selector(root);

		if (ui.reduced) {
			gsap.set(q('[data-in]'), { autoAlpha: 1 });
			return;
		}

		const split = SplitText.create(q('h1 .ln'), { type: 'words,chars', mask: 'words', charsClass: 'ch' });
		const tl = gsap.timeline({ defaults: { ease: 'helm' } });
		tl.set(q('[data-in]'), { autoAlpha: 1 })
			.from(q('.eyebrow .dot'), { scale: 0, duration: 0.6 }, 0)
			.from(q('.eyebrow .t'), { duration: 1.1, scrambleText: { text: '', chars: SCRAMBLE, revealDelay: 0.2 } }, 0.05)
			.from(split.chars, { yPercent: 110, duration: 1.25, stagger: 0.016 }, 0.1)
			.from(q('.lede'), { autoAlpha: 0, y: 16, duration: 1.1 }, 0.55)
			.from(q('.strike'), { autoAlpha: 0, y: 12, duration: 1 }, 0.68)
			.fromTo(q('.strike s'), { '--cut': 0 }, { '--cut': 1, duration: 0.7, ease: 'power3.inOut' }, 1.25)
			.from(q('.install .tabs > *'), { autoAlpha: 0, y: 8, duration: 0.8, stagger: 0.06 }, 0.8)
			.from(q('.install .cmd'), { clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'haul' }, 0.9)
			.from(q('.install code'), { duration: 1.1, scrambleText: { text: '', chars: 'lowerCase', revealDelay: 0.3 } }, 1.1)
			.from(q('.models .label'), { autoAlpha: 0, duration: 0.8 }, 1.15)
			.from(q('.models li'), { autoAlpha: 0, y: 6, duration: 0.7, stagger: 0.05 }, 1.2)
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
		}, root);

		return () => ctx.revert();
	});

	$effect(() => {
		if (ui.ready) intro();
	});
</script>

<section id="heading" class="hero" aria-labelledby="hero-title" bind:this={root}>
	<div class="stage">
		<div class="hero-copy">
			<p class="eyebrow label" data-in><span class="dot" aria-hidden="true"></span><span class="t">{hero.eyebrow}</span></p>
			<h1 id="hero-title" data-in>
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
				<p class="label">{hero.modelsLabel}</p>
				<ul>
					{#each hero.models as m (m)}
						<li>{m}</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="chrome" aria-hidden="true">
			<span class="leeward" data-in>
				<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 1v11h9.5L3 1z" fill="currentColor" /><path d="M1 12.8h12" stroke="currentColor" stroke-width="1.2" /></svg>
				Leeward
			</span>
			<span class="legal label" data-in>{site.company} © {site.year}</span>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		z-index: 1;
		height: 230vh;
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
	}
	.models .label {
		font-size: 10px;
		color: var(--muted);
		margin-bottom: 12px;
	}
	.models ul {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 20px;
		max-width: 540px;
	}
	.models li {
		font-family: var(--f-mono);
		font-size: 12px;
		letter-spacing: 0.02em;
		color: var(--muted);
		transition: color 0.3s var(--ease);
	}
	.models li:hover {
		color: var(--text);
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
	.leeward {
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
		.models ul {
			gap: 4px 14px;
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
