<script>
	import { onMount } from 'svelte';
	import { instruments } from '$lib/content.js';
	import { gsap, ScrollTrigger } from '$lib/motion/gsap.js';
	import { reveal } from '$lib/motion/reveal.js';
	import { ui } from '$lib/state.svelte.js';

	let root = $state();

	// ---- data for the little instruments ----
	const rose = (cx, cy, n = 16) =>
		Array.from({ length: n }, (_, i) => {
			const a = (i / n) * Math.PI * 2;
			return { x1: cx, y1: cy, x2: cx + Math.cos(a) * 400, y2: cy + Math.sin(a) * 400 };
		});
	const roseA = rose(92, 92);
	const roseB = rose(262, 48);
	const nodes = [
		{ x: 92, y: 92, t: 'billing/' },
		{ x: 262, y: 48, t: 'ledger/' },
		{ x: 180, y: 128, t: 'api/' },
		{ x: 30, y: 36, t: 'jobs/' }
	];

	const code = [
		['export async function ', 'handleWebhook', '(req) {'],
		['  const evt = parse(req.body)', '', ''],
		['  return ', 'handleWebhook', '.retry(evt)'],
		['}', '', ''],
		['', '', ''],
		['router.post("/hook", ', 'handleWebhook', ')']
	];

	const depths = Array.from({ length: 34 }, (_, i) => {
		const x = i / 33;
		return 0.35 + 0.28 * Math.sin(x * 5.1 + 0.6) + 0.16 * Math.sin(x * 13.7) + 0.08 * Math.cos(x * 29.0);
	});

	const logLines = [
		['21:48:02', 'edit', 'packages/billing/adapter.ts'],
		['21:48:09', 'lsp', 'rename handleWebhook → onEvent'],
		['21:48:11', 'test', 'adapter.spec.ts · 14 passed'],
		['21:49:30', 'edit', 'services/ledger/replay.ts'],
		['21:49:41', 'test', 'replay.spec.ts · 3 failed'],
		['21:50:02', 'read', 'ledger/idempotency.ts:88'],
		['21:50:40', 'edit', 'ledger/idempotency.ts'],
		['21:50:47', 'test', 'replay.spec.ts · 9 passed'],
		['21:51:15', 'log', 'waypoint 2 · 38% · on bearing']
	];

	onMount(() => {
		const q = gsap.utils.selector(root);
		const ctx = gsap.context(() => {
			reveal(root);
			if (ui.reduced) return;

			gsap.from(q('.cell'), {
				autoAlpha: 0,
				y: 24,
				duration: 1.1,
				stagger: { each: 0.08, grid: [2, 3], from: 'start' },
				scrollTrigger: { trigger: q('.cells')[0], start: 'top 80%', once: true }
			});

			const loops = [];

			// Chart: a route is plotted across the rhumb-line net, node to node.
			const chart = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
			chart
				.fromTo(q('.v-chart .route'), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 2.4, ease: 'power2.inOut' })
				.fromTo(q('.v-chart .node'), { '--hot': 0 }, { '--hot': 1, duration: 0.3, stagger: 0.55, ease: 'steps(1)' }, 0.2)
				.to(q('.v-chart .route'), { drawSVG: '100% 100%', duration: 1.2, ease: 'power2.in' }, '+=0.8')
				.set(q('.v-chart .node'), { '--hot': 0 });
			loops.push(chart);

			// Helm: a symbol is renamed through the language server, every reference at once.
			const helm = gsap.timeline({ repeat: -1, repeatDelay: 1.4, paused: true });
			helm
				.to(q('.v-helm .sym'), { '--sel': 1, duration: 0.01, stagger: 0.12 }, 0.6)
				.set(q('.v-helm .hint'), { autoAlpha: 1 }, 0.6)
				.to(q('.v-helm .sym'), { duration: 0.7, scrambleText: { text: 'onEvent', chars: 'lowerCase', speed: 1 }, stagger: 0.1 }, 1.4)
				.to(q('.v-helm .sym'), { '--sel': 0, duration: 0.01 }, 2.6)
				.set(q('.v-helm .hint'), { autoAlpha: 0 }, 2.6)
				.to(q('.v-helm .sym'), { duration: 0.6, scrambleText: { text: 'handleWebhook', chars: 'lowerCase' }, stagger: 0.05 }, 4.2);
			loops.push(helm);

			// Soundings: a sweep reads the depth under each edit; the counter only ever goes up.
			const bars = q('.v-soundings .bar');
			const count = { v: 1180 };
			const sound = gsap.timeline({ repeat: -1, paused: true });
			sound
				.fromTo(q('.v-soundings .sweep'), { xPercent: 0, left: '0%' }, { left: '100%', duration: 3.4, ease: 'none' })
				.fromTo(bars, { '--lit': 1 }, { '--lit': 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, 0)
				.to(count, {
					v: 1284,
					duration: 3.4,
					ease: 'none',
					onUpdate: () => {
						const el = q('.v-soundings .count')[0];
						if (el) el.textContent = Math.round(count.v).toLocaleString('en-US');
					}
				}, 0);
			loops.push(sound);

			// Log: lines keep arriving at the bottom.
			const log = gsap.timeline({ repeat: -1, paused: true });
			log.to(q('.v-log .feed'), { yPercent: -50, duration: 16, ease: 'none' });
			loops.push(log);

			// Crew: branches leave the main line in their own worktrees; three come back.
			const crew = gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true });
			crew
				.fromTo(q('.v-crew .br'), { drawSVG: 0 }, { drawSVG: '100%', duration: 1.6, stagger: 0.35, ease: 'power1.inOut' })
				.fromTo(q('.v-crew .merge'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.35, stagger: 0.35, ease: 'back.out(3)' }, 1.3)
				.fromTo(q('.v-crew .rej'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'steps(2)' }, 2.1)
				.to(q('.v-crew .br, .v-crew .merge, .v-crew .rej'), { autoAlpha: 0, duration: 0.5 }, '+=1.4')
				.set(q('.v-crew .br, .v-crew .merge'), { autoAlpha: 1 });
			loops.push(crew);

			// Anchor: the cursor hauls back to waypoint 2, then sails on.
			const anchor = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });
			anchor
				.fromTo(q('.v-anchor .haul'), { top: '8%' }, { top: '86%', duration: 2.6, ease: 'none' })
				.to(q('.v-anchor .haul'), { top: '38%', duration: 0.7, ease: 'haul' }, '+=0.5')
				.set(q('.v-anchor .toast'), { autoAlpha: 1 }, '<')
				.set(q('.v-anchor .toast'), { autoAlpha: 0 }, '+=1.2');
			loops.push(anchor);

			// Only run the instruments while they're on screen.
			ScrollTrigger.create({
				trigger: q('.cells')[0],
				start: 'top bottom',
				end: 'bottom top',
				onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause()))
			});

			q('.cell').forEach((cell, i) => {
				cell.addEventListener('pointerenter', () => gsap.to(loops[i], { timeScale: 1.8, duration: 0.4 }));
				cell.addEventListener('pointerleave', () => gsap.to(loops[i], { timeScale: 1, duration: 0.6 }));
			});
		}, root);
		return () => ctx.revert();
	});
</script>

<section id="instruments" class="instruments" aria-labelledby="instruments-title" bind:this={root}>
	<div class="wrap inner">
		<header class="head">
			<p class="sec-head label" data-r="fade">
				<span class="n">03</span><span>Instruments</span><span class="rule"></span><span>20:20</span>
			</p>
			<div class="head-row">
				<h2 id="instruments-title" class="h-section" data-r="lines">
					{instruments.title[0]} <span class="dim">{instruments.title[1]}</span>
				</h2>
				<p class="lede" data-r="fade">{instruments.lede}</p>
			</div>
		</header>

		<ul class="cells">
			{#each instruments.items as it, i (it.id)}
				<li class="cell">
					<div class="viz v-{it.id}" aria-hidden="true">
						{#if it.id === 'chart'}
							<svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice">
								<g class="net">
									{#each roseA as l, j (j)}<line {...l} />{/each}
									{#each roseB as l, j (j)}<line {...l} class:alt={true} />{/each}
								</g>
								<circle cx="92" cy="92" r="16" class="ring" />
								<circle cx="262" cy="48" r="11" class="ring" />
								<path class="route" d="M30 36 L92 92 L180 128 L262 48" />
								{#each nodes as n, j (j)}
									<g class="node" style="--hot:0">
										<rect x={n.x - 2.5} y={n.y - 2.5} width="5" height="5" />
										<rect class="hot" x={n.x - 2.5} y={n.y - 2.5} width="5" height="5" />
										<text x={n.x + 7} y={n.y - 5}>{n.t}</text>
									</g>
								{/each}
							</svg>
						{:else if it.id === 'helm'}
							<div class="editor">
								{#each code as ln, j (j)}
									<div class="cl">
										<span class="ln">{j + 1}</span>
										<span>{ln[0]}{#if ln[1]}<span class="sym" style="--sel:0">{ln[1]}</span>{/if}{ln[2]}</span>
									</div>
								{/each}
								<span class="hint">lsp · rename symbol · 3 refs</span>
							</div>
						{:else if it.id === 'soundings'}
							<div class="sounder">
								{#each depths as d, j (j)}
									<span class="bar" style="--d:{d};--lit:0"></span>
								{/each}
								<span class="sweep"></span>
								<span class="readout"><span class="count">1,180</span> passing · 0 failing</span>
							</div>
						{:else if it.id === 'log'}
							<div class="logview">
								<div class="feed">
									{#each [0, 1] as rep (rep)}
										{#each logLines as l, j (j)}
											<div class="lr"><span class="ts">{l[0]}</span><span class="tag tag-{l[1]}">{l[1]}</span><span class="tx">{l[2]}</span></div>
										{/each}
									{/each}
								</div>
							</div>
						{:else if it.id === 'crew'}
							<svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid meet">
								<line x1="10" y1="75" x2="310" y2="75" class="main" />
								<path class="br" d="M40 75 C60 75 62 30 90 30 L170 30 C200 30 204 75 226 75" />
								<path class="br" d="M58 75 C78 75 80 52 106 52 L190 52 C214 52 218 75 238 75" />
								<path class="br" d="M76 75 C96 75 98 100 124 100 L204 100 C226 100 230 75 250 75" />
								<path class="br rejected" d="M94 75 C114 75 116 124 142 124 L214 124" />
								<circle class="merge" cx="226" cy="75" r="3.5" />
								<circle class="merge" cx="238" cy="75" r="3.5" />
								<circle class="merge" cx="250" cy="75" r="3.5" />
								<g class="rej"><path d="M210 120l8 8M218 120l-8 8" /></g>
								<text x="12" y="68">main</text>
								<text x="222" y="140" class="rejt">1 red · not brought aboard</text>
							</svg>
						{:else if it.id === 'anchor'}
							<div class="chain">
								<span class="rope"></span>
								{#each ['wp 1', 'wp 2', 'wp 3', 'wp 4'] as w, j (w)}
									<span class="cp" style="top:{12 + j * 24}%"><i></i>{w}</span>
								{/each}
								<span class="haul"></span>
								<span class="toast">⌘ ⇧ Z · hauled back to wp 2</span>
							</div>
						{/if}
					</div>
					<div class="txt">
						<p class="idx label">03.{i + 1}</p>
						<h3>{it.k}</h3>
						<p class="t">{it.t}</p>
						<p class="m label">{it.m}</p>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.instruments {
		position: relative;
		z-index: 1;
		padding: clamp(96px, 16vh, 180px) 0 clamp(80px, 14vh, 160px);
	}
	.inner {
		padding-left: clamp(0px, 5vw, 64px);
	}
	.sec-head {
		margin-bottom: 28px;
	}
	.head-row {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
		gap: 48px;
		align-items: end;
		margin-bottom: 56px;
	}
	.head-row .lede {
		max-width: 42ch;
		justify-self: end;
	}

	.cells {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border-top: 1px solid var(--hair);
		border-left: 1px solid var(--hair);
	}
	.cell {
		position: relative;
		border-right: 1px solid var(--hair);
		border-bottom: 1px solid var(--hair);
		background: rgba(7, 7, 10, 0.62);
		transition: background-color 0.5s var(--ease);
	}
	.cell::after {
		content: '';
		position: absolute;
		inset: -1px;
		border: 1px solid var(--signal);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.4s var(--ease);
	}
	.cell:hover {
		background: rgba(12, 10, 16, 0.8);
	}
	.cell:hover::after {
		opacity: 0.55;
	}
	.viz {
		position: relative;
		height: 164px;
		overflow: hidden;
		border-bottom: 1px solid var(--hair);
		font-family: var(--f-mono);
	}
	.viz svg {
		width: 100%;
		height: 100%;
	}
	.txt {
		padding: 20px 22px 24px;
	}
	.idx {
		font-size: 10px;
		color: var(--signal);
		margin-bottom: 12px;
	}
	h3 {
		font-size: 1.3rem;
		font-weight: 520;
		letter-spacing: -0.03em;
		margin-bottom: 8px;
	}
	.t {
		font-size: 0.94rem;
		line-height: 1.55;
		color: var(--dim);
		margin-bottom: 16px;
		max-width: 38ch;
	}
	.m {
		font-size: 10px;
		color: var(--muted);
	}

	/* chart */
	.v-chart line {
		stroke: rgba(255, 255, 255, 0.07);
		stroke-width: 0.6;
	}
	.v-chart line.alt {
		stroke: rgba(147, 160, 255, 0.1);
	}
	.v-chart .ring {
		fill: none;
		stroke: rgba(255, 255, 255, 0.18);
		stroke-width: 0.6;
		stroke-dasharray: 1.5 2.5;
	}
	.v-chart .route {
		fill: none;
		stroke: var(--signal);
		stroke-width: 1.3;
	}
	.v-chart .node rect {
		fill: var(--night);
		stroke: var(--text-2);
		stroke-width: 0.8;
	}
	.v-chart .node {
		--hot: 0;
	}
	.v-chart .node text {
		font-size: 8px;
		fill: var(--muted);
		letter-spacing: 0.04em;
	}
	.v-chart .node rect.hot {
		fill: var(--signal);
		stroke: var(--signal);
		opacity: var(--hot);
	}

	/* helm */
	.editor {
		position: absolute;
		inset: 0;
		padding: 18px 18px;
		font-size: 11px;
		line-height: 1.85;
		color: var(--dim);
		white-space: pre;
	}
	.cl {
		display: flex;
		gap: 14px;
	}
	.cl .ln {
		width: 1.5ch;
		text-align: right;
		color: var(--faint);
	}
	.sym {
		--sel: 0;
		color: var(--text);
		background: rgba(255, 92, 210, calc(var(--sel) * 0.22));
		box-shadow: inset 0 -1px 0 rgba(255, 92, 210, calc(var(--sel) * 0.9));
	}
	.hint {
		position: absolute;
		right: 14px;
		bottom: 12px;
		font-size: 9px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--signal);
		padding: 4px 7px;
		border: 1px solid rgba(255, 92, 210, 0.35);
		background: rgba(10, 8, 14, 0.9);
		visibility: hidden;
	}

	/* soundings */
	.sounder {
		position: absolute;
		inset: 18px 18px 30px;
		display: flex;
		align-items: flex-start;
		gap: 3px;
	}
	.bar {
		flex: 1;
		height: calc(var(--d) * 100%);
		background: linear-gradient(
			to bottom,
			rgba(147, 160, 255, calc(0.18 + var(--lit) * 0.6)),
			rgba(147, 160, 255, 0.02)
		);
		border-top: 1px solid rgba(147, 160, 255, calc(0.4 + var(--lit) * 0.6));
	}
	.sweep {
		position: absolute;
		top: -6px;
		bottom: -6px;
		width: 1px;
		background: var(--signal);
		box-shadow: 0 0 10px var(--signal);
	}
	.readout {
		position: absolute;
		left: 0;
		bottom: -22px;
		font-size: 9.5px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.count {
		color: var(--teal);
		font-variant-numeric: tabular-nums;
	}

	/* log */
	.logview {
		position: absolute;
		inset: 0;
		padding: 0 18px;
		mask-image: linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent);
	}
	.feed {
		padding-top: 12px;
	}
	.lr {
		display: grid;
		grid-template-columns: 7.5ch 4.5ch 1fr;
		gap: 10px;
		font-size: 10.5px;
		line-height: 2.05;
		white-space: nowrap;
		color: var(--dim);
	}
	.ts {
		color: var(--faint);
	}
	.tx {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.tag {
		color: var(--muted);
	}
	.tag-test {
		color: var(--teal);
	}
	.tag-lsp {
		color: var(--rim);
	}
	.tag-edit {
		color: var(--signal);
	}

	/* crew */
	.v-crew .main {
		stroke: var(--text-2);
		stroke-width: 1.2;
	}
	.v-crew .br {
		fill: none;
		stroke: var(--rim);
		stroke-width: 1;
	}
	.v-crew .br.rejected {
		stroke: var(--signal);
		stroke-dasharray: 3 3;
	}
	.v-crew .merge {
		fill: var(--teal);
	}
	.v-crew .rej path {
		stroke: var(--signal);
		stroke-width: 1.4;
	}
	.v-crew text {
		font-size: 8.5px;
		fill: var(--muted);
		letter-spacing: 0.06em;
	}
	.v-crew .rejt {
		fill: var(--signal);
		opacity: 0.8;
	}

	/* anchor */
	.chain {
		position: absolute;
		inset: 14px 0 14px 40%;
	}
	.rope {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 1px;
		background: repeating-linear-gradient(to bottom, var(--hair-3) 0 3px, transparent 3px 6px);
	}
	.cp {
		position: absolute;
		left: -3px;
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 9.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
		transform: translateY(-50%);
	}
	.cp i {
		width: 7px;
		height: 7px;
		border: 1px solid var(--text-2);
		background: var(--night);
	}
	.haul {
		position: absolute;
		left: -30px;
		top: 8%;
		width: 24px;
		height: 1px;
		background: var(--signal);
		box-shadow: 0 0 8px var(--signal);
		transform: translateY(-50%);
	}
	.haul::before {
		content: '';
		position: absolute;
		left: -5px;
		top: -2px;
		width: 5px;
		height: 5px;
		background: var(--signal);
	}
	.toast {
		position: absolute;
		left: -40%;
		right: 14px;
		bottom: -2px;
		text-align: center;
		font-size: 9px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--signal);
		visibility: hidden;
	}

	@media (max-width: 1100px) {
		.cells {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 860px) {
		.head-row {
			grid-template-columns: 1fr;
			gap: 20px;
		}
		.head-row .lede {
			justify-self: start;
		}
		.inner {
			padding-left: 0;
		}
	}
	@media (max-width: 620px) {
		.cells {
			grid-template-columns: 1fr;
		}
		.viz {
			height: 148px;
		}
	}
</style>
