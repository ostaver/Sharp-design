<script>
	import { onMount } from 'svelte';
	import { bearing } from '$lib/content.js';
	import { gsap, ScrollTrigger } from '$lib/motion/gsap.js';
	import { reveal } from '$lib/motion/reveal.js';
	import { skyBus } from '$lib/gl/sky/bus.js';
	import { ui } from '$lib/state.svelte.js';

	let root = $state();
	let shipEl = $state();
	let hudEl = $state();
	let drift = $state('0.4');
	let wp = $state(1);

	onMount(() => {
		const q = gsap.utils.selector(root);
		const ctx = gsap.context(() => {
			reveal(root);

			// Stats count up once, to their real precision.
			q('.stat').forEach((el, i) => {
				const s = bearing.stats[i];
				const num = el.querySelector('.num');
				const o = { v: 0 };
				if (ui.reduced) return;
				gsap.to(o, {
					v: s.v,
					duration: 1.8,
					ease: 'power3.out',
					scrollTrigger: { trigger: el, start: 'top 88%', once: true },
					onUpdate: () => (num.textContent = o.v.toFixed(s.decimals || 0))
				});
			});

			if (!ui.reduced) {
				gsap.from(q('.hud .row'), {
					autoAlpha: 0,
					x: -10,
					duration: 0.9,
					stagger: 0.08,
					scrollTrigger: { trigger: root, start: 'top 45%', once: true }
				});
				gsap.fromTo(q('.hud .tick'), { drawSVG: 0 }, { drawSVG: '100%', duration: 1.2, scrollTrigger: { trigger: root, start: 'top 45%', once: true } });
			}
		}, root);

		// The ship's label rides the globe, frame by frame.
		let on = false;
		const st = ScrollTrigger.create({
			trigger: root,
			start: 'top 60%',
			end: 'bottom 40%',
			onToggle: (self) => (on = self.isActive)
		});
		const follow = () => {
			const sky = skyBus.sky;
			if (!sky || !shipEl) return;
			const s = sky.state;
			const vis = on && s.globeOn > 0.6;
			const p = sky.shipScreen();
			shipEl.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
			shipEl.style.opacity = vis && p.visible ? '1' : '0';
			if (hudEl) {
				hudEl.style.transform = `translate3d(${p.cx - p.r * 1.02}px, ${p.cy - p.r * 1.04}px, 0)`;
				hudEl.style.opacity = vis ? '1' : '0';
			}
			const d = 0.35 + 0.3 * Math.abs(Math.sin(s.ship * 17.0)) + (s.ship > 0.55 && s.ship < 0.6 ? 2.4 : 0);
			const ds = d.toFixed(1);
			if (ds !== drift) drift = ds;
			const w = Math.min(4, 1 + Math.floor(s.ship * 4));
			if (w !== wp) wp = w;
		};
		gsap.ticker.add(follow);

		return () => {
			gsap.ticker.remove(follow);
			st.kill();
			ctx.revert();
		};
	});
</script>

<section id="bearing" class="bearing" aria-labelledby="bearing-title" bind:this={root}>
	<div class="stage">
		<div class="wrap inner">
			<div class="copy">
				<p class="sec-head label" data-r="fade">
					<span class="n">04</span><span>Bearing</span><span class="rule"></span><span>20:40</span>
				</p>
				<h2 id="bearing-title" class="h-section" data-r="lines">
					{bearing.title[0]} <span class="dim">{bearing.title[1]}</span>
				</h2>
				<p class="lede" data-r="fade">{bearing.lede}</p>
				<dl class="def" data-r="fade">
					<dt><span class="w">{bearing.definition.word}</span> <span class="ipa">/rʌm laɪn/</span> <span class="pos">{bearing.definition.pos}</span></dt>
					<dd>{bearing.definition.text}</dd>
				</dl>
			</div>

			<ul class="stats">
				{#each bearing.stats as s, i (i)}
					<li class="stat" data-r="fade" data-delay={i * 0.1}>
						<p class="v"><span class="num">{s.decimals ? s.v.toFixed(s.decimals) : s.v}</span><span class="suf">{s.suffix}</span></p>
						<p class="t">{s.t}</p>
					</li>
				{/each}
				<li class="src label" data-r="fade">{bearing.source}</li>
			</ul>
		</div>
	</div>

	<!-- Readouts pinned to the globe in the sky canvas. -->
	<div class="hud" bind:this={hudEl} aria-hidden="true">
		<svg class="tick" width="54" height="54" viewBox="0 0 54 54"><path d="M53 1H1v52" /></svg>
		<div class="row"><span class="k">brg</span><span class="v">047°</span></div>
		<div class="row"><span class="k">drift</span><span class="v">{drift}°</span></div>
		<div class="row"><span class="k">fix</span><span class="v">every 30 min</span></div>
	</div>
	<div class="ship" bind:this={shipEl} aria-hidden="true">
		<span class="lbl">rhumb · wp {wp}/4</span>
	</div>
</section>

<style>
	.bearing {
		position: relative;
		z-index: 1;
		height: 230vh;
	}
	.stage {
		position: sticky;
		top: 0;
		min-height: 100vh;
		display: flex;
		align-items: center;
		padding: 100px 0 48px;
	}
	.inner {
		padding-left: clamp(0px, 5vw, 64px);
		display: grid;
		gap: 64px;
	}
	.copy {
		max-width: 540px;
	}
	.sec-head {
		margin-bottom: 28px;
	}
	h2 {
		margin-bottom: 26px;
	}
	.lede {
		max-width: 47ch;
	}

	.def {
		margin-top: 34px;
		padding: 18px 0 0;
		border-top: 1px solid var(--hair);
		max-width: 46ch;
	}
	.def dt {
		display: flex;
		align-items: baseline;
		gap: 10px;
		margin-bottom: 6px;
	}
	.def .w {
		font-family: var(--f-serif);
		font-style: italic;
		font-size: 1.55rem;
		letter-spacing: -0.01em;
		color: var(--text);
	}
	.def .ipa {
		font-family: var(--f-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.def .pos {
		font-family: var(--f-serif);
		font-style: italic;
		color: var(--signal);
	}
	.def dd {
		font-family: var(--f-serif);
		font-size: 1.2rem;
		line-height: 1.4;
		color: var(--dim);
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 176px));
		gap: 0 32px;
		align-items: end;
	}
	.stat {
		border-top: 1px solid var(--hair-2);
		padding-top: 16px;
	}
	.v {
		font-size: clamp(2.2rem, 3.4vw, 3.3rem);
		font-weight: 480;
		letter-spacing: -0.045em;
		line-height: 1;
		font-variant-numeric: tabular-nums;
		margin-bottom: 10px;
	}
	.suf {
		color: var(--signal);
		font-size: 0.55em;
		letter-spacing: -0.02em;
		margin-left: 2px;
	}
	.stat .t {
		font-size: 0.86rem;
		line-height: 1.45;
		color: var(--muted);
	}
	.src {
		grid-column: 1 / -1;
		margin-top: 18px;
		font-size: 9.5px;
		color: var(--muted);
		line-height: 1.6;
	}

	.hud,
	.ship {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 2;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.4s var(--ease);
		will-change: transform;
	}
	.hud {
		padding: 14px 0 0 14px;
		font-family: var(--f-mono);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.hud .tick {
		position: absolute;
		left: 0;
		top: 0;
	}
	.hud .tick path {
		fill: none;
		stroke: var(--hair-3);
	}
	.row {
		display: flex;
		gap: 12px;
		line-height: 1.9;
	}
	.row .k {
		color: var(--muted);
		width: 5ch;
	}
	.row .v {
		color: var(--text);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		font-weight: 400;
		margin: 0;
	}
	.ship {
		transition: opacity 0.25s linear;
	}
	.ship .lbl {
		position: absolute;
		left: 14px;
		top: -20px;
		white-space: nowrap;
		font-family: var(--f-mono);
		font-size: 9.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text);
		padding: 3px 6px;
		background: rgba(5, 5, 7, 0.75);
		border-left: 1px solid var(--signal);
	}

	@media (max-width: 1100px) {
		.stats {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			max-width: 560px;
		}
	}
	/* Small screens: the globe holds the top of the view; the text slides up over it on
	   a dark ground so it never has to be read against the dither. */
	@media (max-width: 860px) {
		.bearing {
			height: auto;
		}
		.stage {
			position: relative;
			padding: 62vh 0 80px;
			background: linear-gradient(to bottom, rgba(5, 5, 7, 0) calc(62vh - 70px), rgba(5, 5, 7, 0.93) 62vh);
		}
		.inner {
			padding: 12px 0 0;
			gap: 44px;
		}
		.stats {
			grid-template-columns: 1fr;
			gap: 22px;
		}
		.hud,
		.ship {
			display: none;
		}
	}
</style>
