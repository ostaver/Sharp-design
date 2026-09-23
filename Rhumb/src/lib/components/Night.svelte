<script>
	import { onMount } from 'svelte';
	import { night } from '$lib/content.js';
	import { gsap, ScrollTrigger } from '$lib/motion/gsap.js';
	import { reveal } from '$lib/motion/reveal.js';
	import { NIGHT_START, NIGHT_END } from '$lib/motion/choreo.js';
	import { fmtTime, watchName, bellsAt } from '$lib/time.js';
	import { strike } from '$lib/audio/bell.js';
	import { ui } from '$lib/state.svelte.js';

	const SPAN = NIGHT_END - NIGHT_START; // minutes
	const PX_PER_MIN = 9; // track scale on desktop
	const trackW = SPAN * PX_PER_MIN;

	const halfHours = Array.from({ length: SPAN / 30 + 1 }, (_, i) => NIGHT_START + i * 30);
	const quarters = Array.from({ length: SPAN / 15 + 1 }, (_, i) => NIGHT_START + i * 15);
	const watches = [
		{ from: NIGHT_START, to: 24 * 60, k: 'First watch' },
		{ from: 24 * 60, to: 28 * 60, k: 'Middle watch' },
		{ from: 28 * 60, to: NIGHT_END, k: 'Morning watch' }
	];
	const x = (t) => (t - NIGHT_START) * PX_PER_MIN;

	let root = $state();
	let trackEl = $state();
	let now = $state(NIGHT_START);

	onMount(() => {
		const q = gsap.utils.selector(root);
		const mm = gsap.matchMedia();
		const ctx = gsap.context(() => {
			reveal(root);
		}, root);

		mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
			const entries = q('.entry');
			let lastHalf = -1;
			const st = ScrollTrigger.create({
				trigger: root,
				start: 'top top',
				end: 'bottom bottom',
				scrub: true,
				onUpdate: (self) => {
					const t = NIGHT_START + self.progress * SPAN;
					trackEl.style.transform = `translate3d(${-self.progress * trackW}px,0,0)`;
					const tm = Math.floor(t);
					if (tm !== now) now = tm;
					// data attributes, not classes: Svelte owns the class list on these items
					let cur = -1;
					entries.forEach((el, i) => {
						const past = night.log[i].time <= t;
						el.toggleAttribute('data-past', past);
						if (past) cur = i;
					});
					entries.forEach((el, i) => el.toggleAttribute('data-cur', i === cur));
					const half = Math.floor(t / 30);
					if (lastHalf !== -1 && half !== lastHalf && self.isActive && self.direction > 0) strike(bellsAt(half * 30));
					lastHalf = half;
				}
			});
			gsap.from(q('.axis, .marker, .readout'), {
				autoAlpha: 0,
				duration: 1.2,
				stagger: 0.1,
				scrollTrigger: { trigger: root, start: 'top 60%', once: true }
			});
			return () => st.kill();
		});

		return () => {
			mm.revert();
			ctx.revert();
		};
	});
</script>

<section id="night" class="night" aria-labelledby="night-title" bind:this={root}>
	<div class="stage">
		<header class="wrap head">
			<p class="sec-head label" data-r="fade">
				<span class="n">05</span><span>The night</span><span class="rule"></span><span>21:00 → 06:00</span>
			</p>
			<div class="head-row">
				<h2 id="night-title" class="h-section" data-r="lines">
					{night.title[0]} <span class="dim">{night.title[1]}</span>
				</h2>
				<p class="lede" data-r="fade">{night.lede}</p>
			</div>
		</header>

		<div class="viewport">
			<div class="readout" aria-hidden="true">
				<span class="t">{fmtTime(now)}</span>
				<span class="label w">{watchName(now)}</span>
				<span class="label b">{bellsAt(now)} bell{bellsAt(now) > 1 ? 's' : ''}</span>
			</div>
			<span class="marker" aria-hidden="true"></span>

			<div class="track" bind:this={trackEl} style="--w:{trackW}px">
				<div class="axis" aria-hidden="true">
					{#each watches as w (w.k)}
						<span class="watch" style="left:{x(w.from)}px;width:{x(w.to) - x(w.from)}px"><span class="label">{w.k}</span></span>
					{/each}
					{#each quarters as t (t)}
						<span class="q" class:half={t % 30 === 0} class:hour={t % 60 === 0} style="left:{x(t)}px"></span>
					{/each}
					{#each halfHours as t (t)}
						<span class="hh" style="left:{x(t)}px">
							{#if t % 60 === 0}<span class="hl">{fmtTime(t)}</span>{/if}
							<span class="bells">
								{#each Array.from({ length: bellsAt(t) }, (_, i) => i) as b (b)}
									<i class:gap={b % 2 === 1}></i>
								{/each}
							</span>
						</span>
					{/each}
				</div>

				<ol class="log">
					{#each night.log as e, i (i)}
						<li
							class="entry"
							class:up={i % 2 === 0}
							class:bad={e.bad}
							class:good={e.good}
							style="left:{x(e.time)}px"
						>
							<span class="stem" aria-hidden="true"></span>
							<div class="card">
								<p class="meta">
									<time class="tm">{fmtTime(e.time)}</time>
									<span class="tag label">{e.tag}</span>
								</p>
								<h3>{e.k}</h3>
								<p class="t">{e.t}</p>
								{#if e.d}<p class="d">{e.d}</p>{/if}
							</div>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</div>
</section>

<style>
	.night {
		position: relative;
		z-index: 1;
		height: 560vh;
	}
	.stage {
		position: sticky;
		top: 0;
		height: 100vh;
		min-height: 620px;
		overflow: hidden;
		display: grid;
		grid-template-rows: auto 1fr;
		padding-top: 96px;
	}
	.head {
		padding-left: clamp(0px, 5vw, 64px);
	}
	.sec-head {
		margin-bottom: 24px;
	}
	.head-row {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
		gap: 48px;
		align-items: end;
	}
	.head-row .lede {
		max-width: 36ch;
		justify-self: end;
	}

	.viewport {
		position: relative;
		--mx: 34vw;
		--axis: 56%;
	}
	.marker {
		position: absolute;
		left: var(--mx);
		top: 8%;
		bottom: 6%;
		width: 1px;
		background: linear-gradient(to bottom, transparent, var(--signal) 12%, var(--signal) 88%, transparent);
		box-shadow: 0 0 12px rgba(255, 92, 210, 0.5);
		z-index: 2;
	}
	.readout {
		position: absolute;
		left: calc(var(--mx) + 14px);
		top: 6%;
		display: flex;
		align-items: baseline;
		gap: 14px;
		z-index: 3;
		font-variant-numeric: tabular-nums;
	}
	.readout .t {
		font-family: var(--f-mono);
		font-size: 22px;
		letter-spacing: 0.02em;
		color: var(--text);
	}
	.readout .w {
		font-size: 10px;
		color: var(--signal);
	}
	.readout .b {
		font-size: 10px;
		color: var(--muted);
	}

	.track {
		position: absolute;
		left: var(--mx);
		top: 0;
		bottom: 0;
		width: var(--w);
		will-change: transform;
	}
	.axis {
		position: absolute;
		left: 0;
		right: 0;
		top: var(--axis);
		height: 1px;
		background: var(--hair-2);
	}
	.watch {
		position: absolute;
		top: 34px;
		height: 1px;
		background: var(--hair);
	}
	.watch .label {
		position: absolute;
		left: 10px;
		top: 8px;
		font-size: 9.5px;
		color: var(--faint);
		white-space: nowrap;
	}
	.watch::before {
		content: '';
		position: absolute;
		left: 0;
		top: -4px;
		height: 9px;
		width: 1px;
		background: var(--hair-3);
	}
	.q {
		position: absolute;
		top: -3px;
		width: 1px;
		height: 7px;
		background: var(--hair-2);
	}
	.q.half {
		top: -6px;
		height: 13px;
		background: var(--hair-3);
	}
	.q.hour {
		top: -10px;
		height: 21px;
		background: var(--muted);
	}
	.hh {
		position: absolute;
		top: 14px;
		transform: translateX(-50%);
		display: grid;
		justify-items: center;
		gap: 6px;
	}
	.hl {
		font-family: var(--f-mono);
		font-size: 10.5px;
		color: var(--dim);
		letter-spacing: 0.04em;
	}
	.bells {
		display: flex;
		gap: 2px;
	}
	.bells i {
		width: 3px;
		height: 3px;
		background: var(--faint);
	}
	.bells i.gap {
		margin-right: 3px;
	}
	.bells i.gap:last-child {
		margin-right: 0;
	}

	.log {
		position: absolute;
		inset: 0;
	}
	.entry {
		position: absolute;
		top: var(--axis);
		width: 0;
	}
	.stem {
		position: absolute;
		left: 0;
		width: 1px;
		height: 44px;
		top: 0;
		background: var(--hair-2);
		transition: background-color 0.4s var(--ease);
	}
	.entry.up .stem {
		top: auto;
		bottom: 0;
	}
	.entry::before {
		content: '';
		position: absolute;
		left: -3px;
		top: -3px;
		width: 7px;
		height: 7px;
		background: var(--night);
		border: 1px solid var(--muted);
		z-index: 1;
		transition: all 0.4s var(--ease);
	}
	.card {
		position: absolute;
		left: -1px;
		width: 262px;
		padding: 14px 16px 16px;
		border-left: 1px solid var(--hair-2);
		background: linear-gradient(90deg, rgba(7, 7, 10, 0.94), rgba(7, 7, 10, 0.78));
		-webkit-backdrop-filter: blur(3px);
		backdrop-filter: blur(3px);
		opacity: 0.4;
		transition:
			opacity 0.5s var(--ease),
			border-color 0.5s var(--ease),
			transform 0.6s var(--ease);
	}
	.entry:not(.up) .card {
		top: 44px;
	}
	.entry.up .card {
		bottom: 44px;
	}
	.entry:global([data-past]) .card {
		opacity: 0.72;
	}
	.entry:global([data-cur]) .card {
		opacity: 1;
		border-left-color: var(--signal);
		transform: translateY(0);
	}
	.entry:global([data-past])::before {
		background: var(--text-2);
		border-color: var(--text-2);
	}
	.entry:global([data-cur])::before {
		background: var(--signal);
		border-color: var(--signal);
		box-shadow: 0 0 10px var(--signal);
	}
	.entry:global([data-cur]) .stem {
		background: var(--signal);
	}
	.meta {
		display: flex;
		align-items: baseline;
		gap: 12px;
		margin-bottom: 8px;
	}
	.tm {
		font-family: var(--f-mono);
		font-size: 12px;
		color: var(--text);
		letter-spacing: 0.03em;
	}
	.tag {
		font-size: 9.5px;
		color: var(--rim);
	}
	.bad .tag {
		color: var(--red);
	}
	.good .tag {
		color: var(--teal);
	}
	h3 {
		font-size: 1.06rem;
		font-weight: 520;
		letter-spacing: -0.02em;
		line-height: 1.25;
		margin-bottom: 5px;
	}
	.card .t {
		font-size: 0.86rem;
		line-height: 1.5;
		color: var(--dim);
	}
	.card .d {
		margin-top: 8px;
		font-family: var(--f-mono);
		font-size: 11px;
		color: var(--teal);
	}

	/* Stacked log for small screens and reduced motion. */
	@media (max-width: 860px), (prefers-reduced-motion: reduce) {
		.night {
			height: auto;
		}
		.stage {
			position: relative;
			height: auto;
			min-height: 0;
			overflow: visible;
			padding: 120px 0 80px;
		}
		.head {
			padding-left: 0;
		}
		.head-row {
			grid-template-columns: 1fr;
			gap: 20px;
		}
		.head-row .lede {
			justify-self: start;
		}
		.viewport {
			width: min(var(--wrap), 100% - 2 * var(--gutter));
			margin: 48px auto 0;
		}
		.marker,
		.readout,
		.axis {
			display: none;
		}
		.track {
			position: relative;
			left: 0;
			width: auto;
			transform: none !important;
		}
		.log {
			position: relative;
			display: grid;
			border-left: 1px solid var(--hair-2);
		}
		.entry {
			position: relative;
			left: 0 !important;
			top: 0;
			width: auto;
			padding: 0 0 26px 22px;
		}
		.entry::before {
			left: -4px;
			top: 6px;
			background: var(--text-2);
			border-color: var(--text-2);
		}
		.stem {
			display: none;
		}
		.card,
		.entry.up .card,
		.entry:not(.up) .card {
			position: relative;
			top: 0;
			bottom: 0;
			width: auto;
			opacity: 1;
			background: none;
			border: 0;
			padding: 0;
		}
	}
	@media (max-height: 760px) and (min-width: 861px) {
		.head-row .lede {
			display: none;
		}
		.viewport {
			--axis: 58%;
		}
	}
</style>
