<script>
	import { onMount, tick } from 'svelte';
	import Flag from './Flag.svelte';
	import Icon from './Icon.svelte';
	import { signals } from '$lib/content.js';
	import { gsap, ScrollTrigger, SplitText } from '$lib/motion/gsap.js';
	import { reveal } from '$lib/motion/reveal.js';
	import { ui } from '$lib/state.svelte.js';

	const DWELL = 7.5;
	let root = $state();
	let quoteEl = $state();
	let barEl = $state();
	let idx = $state(0);
	let busy = false;
	let timer = null;
	let inView = false;
	let hover = false;
	let split = null;

	const q = $derived(signals.quotes[idx]);
	const pad = (n) => String(n).padStart(2, '0');

	function startTimer() {
		timer?.kill();
		if (ui.reduced || !barEl) return;
		timer = gsap.fromTo(barEl, { scaleX: 0 }, { scaleX: 1, duration: DWELL, ease: 'none', paused: !inView || hover, onComplete: () => go(1) });
	}

	async function go(dir) {
		if (busy) return;
		busy = true;
		const next = (idx + dir + signals.quotes.length) % signals.quotes.length;
		if (!ui.reduced && split) {
			await gsap.to(split.words, { yPercent: -110, duration: 0.45, stagger: 0.008, ease: 'power3.in' });
			await gsap.to(root.querySelectorAll('.who > *'), { autoAlpha: 0, duration: 0.2 });
		}
		split?.revert();
		idx = next;
		await tick();
		enter();
		busy = false;
		startTimer();
	}

	function enter() {
		if (ui.reduced) return;
		split = SplitText.create(quoteEl, { type: 'words', mask: 'words' });
		gsap.from(split.words, { yPercent: 110, duration: 1, stagger: 0.018, ease: 'helm' });
		gsap.fromTo(root.querySelectorAll('.who > *'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, delay: 0.35 });
		gsap.from(root.querySelectorAll('.flags .flag-wrap'), { yPercent: 120, duration: 0.9, stagger: 0.12, ease: 'back.out(1.6)', delay: 0.3 });
	}

	onMount(() => {
		const ctx = gsap.context(() => {
			reveal(root);
			if (ui.reduced) return;
			split = SplitText.create(quoteEl, { type: 'words', mask: 'words' });
			gsap.from(split.words, {
				yPercent: 110,
				duration: 1.1,
				stagger: 0.02,
				ease: 'helm',
				scrollTrigger: { trigger: quoteEl, start: 'top 80%', once: true }
			});
			ScrollTrigger.create({
				trigger: root,
				start: 'top 70%',
				end: 'bottom 30%',
				onToggle: (self) => {
					inView = self.isActive;
					if (!timer) startTimer();
					inView && !hover ? timer?.resume() : timer?.pause();
				}
			});
		}, root);
		return () => {
			timer?.kill();
			ctx.revert();
		};
	});

	function onEnter() {
		hover = true;
		timer?.pause();
	}
	function onLeave() {
		hover = false;
		if (inView) timer?.resume();
	}
</script>

<section id="signals" class="signals" aria-labelledby="signals-title" bind:this={root}>
	<div class="wrap inner">
		<div class="side">
			<p class="sec-head label" data-r="fade">
				<span class="n">06</span><span>Signals</span><span class="rule"></span><span>06:30</span>
			</p>
			<h2 id="signals-title" class="h-section" data-r="lines">
				{signals.title[0]} <span class="dim">{signals.title[1]}</span>
			</h2>
			<div class="ctrl" data-r="fade" role="group" aria-label="Testimonials">
				<button type="button" class="arrow" onclick={() => go(-1)} aria-label="Previous signal">
					<Icon name="arrow-l" size={15} />
				</button>
				<span class="count label" aria-live="polite">
					<span class="cur">{pad(idx + 1)}</span> / {pad(signals.quotes.length)}
				</span>
				<button type="button" class="arrow" onclick={() => go(1)} aria-label="Next signal">
					<Icon name="arrow-r" size={15} />
				</button>
				<span class="bar" aria-hidden="true"><span bind:this={barEl}></span></span>
			</div>
		</div>

		<figure
			class="quote"
			onpointerenter={onEnter}
			onpointerleave={onLeave}
			onfocusin={onEnter}
			onfocusout={onLeave}
		>
			<blockquote>
				{#key idx}
					<p bind:this={quoteEl}>“{q.q}”</p>
				{/key}
			</blockquote>
			<figcaption class="who">
				<span class="flags" aria-hidden="true">
					{#each q.flag.split('') as l, i (idx + '-' + i)}
						<span class="flag-wrap"><span class="halyard"></span><Flag letter={l} size={28} /></span>
					{/each}
				</span>
				<span class="name">{q.name}</span>
				<span class="role">{q.role} · {q.org}</span>
			</figcaption>
		</figure>
	</div>

	<div class="fleet" aria-label="Crews running Ostarev overnight">
		<ul class="belt">
			{#each [0, 1] as rep (rep)}
				{#each signals.fleet as f (f)}
					<li aria-hidden={rep === 1 ? 'true' : undefined}>{f}</li>
				{/each}
			{/each}
		</ul>
	</div>
</section>

<style>
	.signals {
		position: relative;
		z-index: 1;
		padding: clamp(120px, 20vh, 220px) 0 clamp(80px, 12vh, 140px);
	}
	.inner {
		padding-left: clamp(0px, 5vw, 64px);
		display: grid;
		grid-template-columns: minmax(0, 4fr) minmax(0, 7fr);
		gap: clamp(40px, 6vw, 110px);
		align-items: start;
	}
	.sec-head {
		margin-bottom: 28px;
	}
	h2 {
		font-size: clamp(2.1rem, 3.5vw, 3.4rem);
		margin-bottom: 44px;
	}
	.ctrl {
		display: grid;
		grid-template-columns: auto auto auto 1fr;
		align-items: center;
		gap: 10px;
	}
	.arrow {
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		border: 1px solid var(--hair-2);
		color: var(--text-2);
		transition:
			border-color 0.3s var(--ease),
			color 0.3s var(--ease);
	}
	.arrow:hover {
		border-color: var(--signal);
		color: var(--signal);
	}
	.count {
		min-width: 9ch;
		text-align: center;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}
	.count .cur {
		color: var(--text);
	}
	.bar {
		height: 1px;
		background: var(--hair);
		margin-left: 12px;
		position: relative;
		overflow: hidden;
	}
	.bar span {
		position: absolute;
		inset: 0;
		background: var(--signal);
		transform-origin: left;
		transform: scaleX(0);
	}

	.quote {
		margin: 0;
		padding-top: 6px;
	}
	/* Tall enough for the longest quote; shorter ones sit down on the byline. */
	blockquote {
		margin: 0;
		min-height: 5.9em;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		font-size: clamp(1.55rem, 2.75vw, 2.7rem);
	}
	blockquote p {
		font-weight: 440;
		line-height: 1.16;
		letter-spacing: -0.032em;
		color: var(--text);
		text-wrap: pretty;
		text-indent: -0.42em;
	}
	/* The hanging indent is inherited: every inline-block word mask would shift its own
	   first letter out of its clip. Only the paragraph's first line should hang. */
	blockquote p :global(*) {
		text-indent: 0;
	}
	.who {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto auto;
		column-gap: 18px;
		margin-top: 36px;
		align-items: center;
	}
	.flags {
		grid-row: 1 / 3;
		display: flex;
		gap: 6px;
		align-self: end;
	}
	.flag-wrap {
		position: relative;
		display: block;
		padding-top: 10px;
		overflow: hidden;
	}
	.halyard {
		position: absolute;
		left: 0;
		top: 0;
		width: 1px;
		height: 100%;
		background: var(--muted);
	}
	.name {
		font-weight: 540;
		letter-spacing: -0.01em;
	}
	.role {
		font-size: 0.9rem;
		color: var(--muted);
	}

	.fleet {
		margin-top: clamp(80px, 14vh, 150px);
		border-block: 1px solid var(--hair);
		overflow: hidden;
		mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
	}
	.belt {
		display: flex;
		width: max-content;
		animation: belt 46s linear infinite;
	}
	.fleet:hover .belt {
		animation-play-state: paused;
	}
	.belt li {
		padding: 22px 44px;
		font-family: var(--f-mono);
		font-size: 12.5px;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: var(--muted);
		white-space: nowrap;
		position: relative;
	}
	.belt li::after {
		content: '◆';
		position: absolute;
		right: -5px;
		font-size: 7px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--faint);
	}
	@keyframes belt {
		to {
			transform: translateX(-50%);
		}
	}

	@media (max-width: 900px) {
		.inner {
			grid-template-columns: 1fr;
			padding-left: 0;
		}
		h2 {
			margin-bottom: 28px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.belt {
			animation: none;
			flex-wrap: wrap;
			justify-content: center;
			width: auto;
		}
		/* the second copy only exists to make the loop seamless */
		.belt li[aria-hidden='true'] {
			display: none;
		}
	}
</style>
