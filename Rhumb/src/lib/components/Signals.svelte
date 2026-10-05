<script>
	import { onMount, tick } from 'svelte';
	import Flag from './Flag.svelte';
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
		return goTo((idx + dir + signals.quotes.length) % signals.quotes.length);
	}

	async function goTo(next) {
		if (busy || next === idx) return;
		busy = true;
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
		split = SplitText.create(quoteEl, { type: 'words', mask: 'words', aria: 'none' });
		gsap.from(split.words, { yPercent: 110, duration: 1, stagger: 0.018, ease: 'helm' });
		gsap.fromTo(root.querySelectorAll('.who > *'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, delay: 0.35 });
		gsap.from(root.querySelectorAll('.flags .flag-wrap'), { yPercent: 120, duration: 0.9, stagger: 0.12, ease: 'back.out(1.6)', delay: 0.3 });
	}

	onMount(() => {
		const ctx = gsap.context(() => {
			reveal(root);
			if (ui.reduced) return;
			split = SplitText.create(quoteEl, { type: 'words', mask: 'words', aria: 'none' });
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
			<!-- Each signal is picked by its hoist: the one flying is the one you're reading. -->
			<div class="hoists" data-r="fade" role="group" aria-label="Signals from the morning watch">
				{#each signals.quotes as s, i (i)}
					<button
						type="button"
						class="hoist"
						class:on={idx === i}
						aria-pressed={idx === i}
						aria-label="Signal {i + 1} of {signals.quotes.length}, from {s.name}, {s.org}"
						onclick={() => goTo(i)}
					>
						<span class="line" aria-hidden="true"></span>
						<span class="set" aria-hidden="true">
							{#each s.flag.split('') as l, j (j)}<Flag letter={l} size={22} />{/each}
						</span>
						<span class="n label" aria-hidden="true">{pad(i + 1)}</span>
					</button>
				{/each}
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

	<!-- The crews, set as a sentence in the log rather than a belt of logos. -->
	<div class="wrap fleet" data-r="fade">
		<p class="fleet-k label">{signals.fleetLabel}</p>
		<p class="port">
			{#each signals.fleet as f, i (f)}<span class="crew">{f}</span>{#if i < signals.fleet.length - 2}<span class="sep">{', '}</span>{:else if i === signals.fleet.length - 2}<span class="sep">{' and '}</span>{/if}{/each}<span class="sep">.</span>
		</p>
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
	.hoists {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		position: relative;
		padding-bottom: 14px;
	}
	/* A hoist: flags on a halyard. Lowered and faded until it's the one flying. */
	.hoist {
		position: relative;
		display: grid;
		justify-items: start;
		gap: 8px;
		min-width: 60px;
		min-height: 76px;
		padding: 6px 14px 0 13px;
		text-align: left;
	}
	.hoist .line {
		position: absolute;
		left: 6px;
		top: 0;
		bottom: 0;
		width: 1px;
		background: var(--hair-2);
		transition: background-color 0.4s var(--ease);
	}
	.hoist .set {
		display: flex;
		flex-direction: column;
		gap: 3px;
		transform: translateY(14px);
		opacity: 0.45;
		filter: saturate(0.35);
		transition:
			transform 0.8s var(--ease),
			opacity 0.5s var(--ease),
			filter 0.5s var(--ease);
	}
	.hoist .n {
		font-size: 9.5px;
		color: var(--faint);
		transition: color 0.4s var(--ease);
	}
	.hoist:hover .set {
		opacity: 0.7;
		transform: translateY(8px);
	}
	.hoist.on .set {
		transform: none;
		opacity: 1;
		filter: none;
	}
	.hoist.on .line {
		background: var(--muted);
	}
	.hoist.on .n {
		color: var(--signal);
	}
	.bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 1px;
		background: var(--hair);
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
		margin-top: clamp(96px, 16vh, 170px);
		padding-top: 22px;
		border-top: 1px solid var(--hair);
		display: grid;
		grid-template-columns: minmax(0, 4fr) minmax(0, 7fr);
		gap: clamp(40px, 6vw, 110px);
		padding-left: clamp(0px, 5vw, 64px);
		box-sizing: border-box;
	}
	.fleet-k {
		color: var(--muted);
		padding-top: 0.7em;
	}
	.port {
		font-family: var(--f-serif);
		font-size: clamp(1.5rem, 2.4vw, 2.3rem);
		line-height: 1.25;
		letter-spacing: -0.01em;
		color: var(--text-2);
		text-wrap: balance;
	}
	.crew {
		font-style: italic;
		color: var(--text);
		transition: color 0.3s var(--ease);
	}
	.crew:hover {
		color: var(--signal);
	}
	.sep {
		color: var(--muted);
	}

	@media (max-width: 900px) {
		.inner {
			grid-template-columns: 1fr;
			padding-left: 0;
		}
		h2 {
			margin-bottom: 28px;
		}
		.fleet {
			grid-template-columns: 1fr;
			gap: 14px;
			padding-left: 0;
		}
	}
</style>
