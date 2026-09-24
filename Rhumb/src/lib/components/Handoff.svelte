<script>
	import { onMount } from 'svelte';
	import { handoff } from '$lib/content.js';
	import { gsap, ScrollTrigger, SplitText } from '$lib/motion/gsap.js';
	import { ui } from '$lib/state.svelte.js';
	import { reveal } from '$lib/motion/reveal.js';

	let root = $state();
	let step = $state(0);

	const SPIN = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
	const cmdLine = handoff.session.find((l) => l.kind === 'cmd');

	onMount(() => {
		const q = gsap.utils.selector(root);
		const mm = gsap.matchMedia();

		const ctx = gsap.context(() => {
			reveal(root);
			if (ui.reduced) return;

			const build = () => {
				const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
				const lines = q('.tl');
				gsap.set(lines, { opacity: 0 });

				const typed = q('.cmd .typed')[0];
				const n = { v: 0 };
				tl.addLabel('brief')
					.set(q('.tl.path'), { opacity: 1 }, 0)
					.set(q('.tl.cmd'), { opacity: 1 }, 0.1)
					.to(n, {
						v: cmdLine.text.length,
						duration: 2.2,
						onUpdate: () => typed.style.setProperty('--n', Math.round(n.v))
					}, 0.2)
					.set(q('.tl.cmd'), { '--caret': 0 }, '+=0.2');

				tl.addLabel('chart', '+=0.3');
				q('.tl.task').forEach((row, i) => {
					const spin = row.querySelector('.spin');
					const s = row.querySelector('.s');
					const v = row.querySelector('.v');
					const f = { v: 0 };
					tl.set(row, { opacity: 1 }, `chart+=${i * 1.05}`)
						.fromTo(v, { '--n': 0 }, { '--n': v.textContent.length, duration: 0.5, snap: { '--n': 1 } }, '<')
						.to(f, {
							v: 1,
							duration: 0.9,
							onUpdate: () => {
								spin.textContent = f.v >= 1 ? '◆' : SPIN[Math.floor(f.v * 24) % SPIN.length];
								row.toggleAttribute('data-done', f.v >= 1);
							}
						}, '<')
						.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.01 }, '>');
				});

				tl.addLabel('bearing', '+=0.4');
				q('.tl.bearing, .tl.wp').forEach((row, i) => {
					tl.set(row, { opacity: 1 }, `bearing+=${i * 0.28}`);
				});
				tl.set(q('.tl.gap'), { opacity: 1 }, 0);
				tl.set(q('.tl.ask'), { opacity: 1 }, '+=0.5')
					.fromTo(q('.tl.ask .ans'), { opacity: 0 }, { opacity: 1, duration: 0.01 }, '+=0.6')
					.set(q('.tl.ok'), { opacity: 1 }, '+=0.35')
					.to({}, { duration: 0.8 });

				const d = tl.duration();
				const marks = [tl.labels.chart / d, tl.labels.bearing / d];
				return { tl, marks };
			};

			mm.add('(min-width: 900px)', () => {
				const { tl, marks } = build();
				ScrollTrigger.create({
					trigger: root,
					start: 'top top',
					end: 'bottom bottom',
					scrub: 0.4,
					animation: tl,
					onUpdate: (self) => {
						const p = tl.progress();
						step = p < marks[0] ? 0 : p < marks[1] ? 1 : 2;
					}
				});
			});

			mm.add('(max-width: 899px)', () => {
				const { tl, marks } = build();
				tl.eventCallback('onUpdate', () => {
					const p = tl.progress();
					step = p < marks[0] ? 0 : p < marks[1] ? 1 : 2;
				});
				ScrollTrigger.create({
					trigger: q('.term')[0],
					start: 'top 75%',
					once: true,
					onEnter: () => gsap.to(tl, { progress: 1, duration: tl.duration() * 0.55, ease: 'none' })
				});
			});
		}, root);

		return () => {
			mm.revert();
			ctx.revert();
		};
	});
</script>

<section id="hand-off" class="handoff" aria-labelledby="handoff-title" bind:this={root}>
	<div class="stage">
		<div class="grid">
			<div class="left">
				<p class="sec-head label" data-r="fade">
					<span class="n">02</span><span>Hand-off</span><span class="rule"></span><span>20:10</span>
				</p>
				<h2 id="handoff-title" class="h-section" data-r="lines">
					{handoff.title[0]} <span class="dim">{handoff.title[1]}</span>
				</h2>
				<p class="lede" data-r="fade">{handoff.lede}</p>
				<ol class="steps">
					{#each handoff.steps as s, i (s.k)}
						<li class:active={step === i} class:past={step > i} data-r="fade">
							<span class="i label">0{i + 1}</span>
							<div>
								<h3>{s.k}</h3>
								<p>{s.t}</p>
							</div>
						</li>
					{/each}
				</ol>
			</div>

			<figure class="term" data-r="term">
				<figcaption class="bar">
					<span class="label">ostarev — ~/tidewater/billing</span>
					<span class="label live"><i aria-hidden="true"></i>zsh · 96×28</span>
				</figcaption>
				<div class="body x-fade">
					{#each handoff.session as l, i (i)}
						{#if l.kind === 'path'}
							<div class="tl path"><span class="c-dim">{l.text}</span> <span class="c-rim">({l.branch})</span></div>
						{:else if l.kind === 'cmd'}
							<div class="tl cmd">
								<span class="pr" aria-hidden="true">$</span>
								<span class="typed" style="--n:{l.text.length}">{l.text}</span>
							</div>
						{:else if l.kind === 'gap'}
							<div class="tl gap" aria-hidden="true"></div>
						{:else if l.kind === 'task'}
							<div class="tl task">
								<span class="spin" aria-hidden="true">◆</span>
								<span class="k">{l.k}</span>
								<span class="v" style="--n:{l.v.length}">{l.v}</span>
								<span class="s" class:noted={l.s === 'noted'}>{l.s}</span>
							</div>
						{:else if l.kind === 'bearing'}
							<div class="tl bearing"><span class="k">bearing {l.deg}</span> <span class="v">{l.text}</span></div>
						{:else if l.kind === 'wp'}
							<div class="tl wp">
								<span class="tree" aria-hidden="true">{l.last ? '└─' : '├─'}</span>
								<span class="n">{l.n}</span>
								<span class="v">{l.text}</span>
								<span class="where">{l.where}</span>
							</div>
						{:else if l.kind === 'ask'}
							<div class="tl ask">
								<span class="q" aria-hidden="true">?</span>
								{l.text} <span class="c-dim">[Y/n]</span> <span class="ans">{l.answer}</span>
							</div>
						{:else if l.kind === 'ok'}
							<div class="tl ok"><span class="c-teal" aria-hidden="true">✓</span> {l.text}</div>
						{/if}
					{/each}
				</div>
			</figure>
		</div>
	</div>
</section>

<style>
	.handoff {
		position: relative;
		z-index: 1;
		height: 290vh;
	}
	.stage {
		position: sticky;
		top: 0;
		min-height: 100vh;
		display: flex;
		align-items: center;
		padding: 96px 0 56px;
	}
	.grid {
		width: min(1180px, 100% - 2 * var(--gutter));
		margin-inline: auto;
		padding-left: clamp(0px, 5vw, 64px);
		display: grid;
		grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
		gap: clamp(32px, 5vw, 80px);
		align-items: center;
	}
	.sec-head {
		margin-bottom: 28px;
	}
	h2 {
		margin-bottom: 24px;
	}
	.lede {
		max-width: 46ch;
		margin-bottom: 36px;
	}

	.steps {
		display: grid;
		border-top: 1px solid var(--hair);
	}
	.steps li {
		display: grid;
		grid-template-columns: 44px 1fr;
		gap: 4px;
		padding: 16px 0 16px;
		border-bottom: 1px solid var(--hair);
		position: relative;
	}
	.steps li::before {
		content: '';
		position: absolute;
		left: 0;
		top: -1px;
		height: 1px;
		width: 100%;
		background: var(--signal);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.9s var(--ease);
	}
	.steps li.active::before {
		transform: scaleX(1);
	}
	.steps .i {
		color: var(--faint);
		padding-top: 4px;
		transition: color 0.4s var(--ease);
	}
	.steps h3 {
		font-size: 1.02rem;
		font-weight: 520;
		letter-spacing: -0.015em;
		color: var(--muted);
		transition: color 0.4s var(--ease);
	}
	.steps p {
		font-size: 0.92rem;
		line-height: 1.55;
		color: var(--faint);
		max-width: 44ch;
		margin-top: 4px;
		transition: color 0.4s var(--ease);
	}
	.steps li.active .i {
		color: var(--signal);
	}
	.steps li.active h3,
	.steps li.past h3 {
		color: var(--text);
	}
	.steps li.active p {
		color: var(--dim);
	}
	.steps li.past .i {
		color: var(--muted);
	}

	/* ---- terminal ---- */
	.term {
		border: 1px solid var(--hair-2);
		background: rgba(7, 7, 10, 0.86);
		-webkit-backdrop-filter: blur(10px);
		backdrop-filter: blur(10px);
		box-shadow:
			0 40px 120px -40px rgba(0, 0, 0, 0.9),
			inset 0 1px 0 rgba(255, 255, 255, 0.04);
		font-family: var(--f-mono);
		font-size: 13px;
		line-height: 1.75;
		color: var(--text-2);
		min-width: 0;
	}
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 11px 16px;
		border-bottom: 1px solid var(--hair);
		color: var(--muted);
	}
	.bar .label {
		font-size: 9.5px;
		letter-spacing: 0.16em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.live {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.live i {
		width: 5px;
		height: 5px;
		background: var(--teal);
	}
	.body {
		padding: 20px 22px 24px;
		min-height: 468px;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.tl {
		white-space: nowrap;
		min-height: 1.75em;
	}
	.gap {
		height: 0.9em;
		min-height: 0;
	}
	.c-dim {
		color: var(--muted);
	}
	.c-rim {
		color: var(--rim);
	}
	.c-teal {
		color: var(--teal);
	}
	.pr {
		color: var(--signal);
		margin-right: 0.6ch;
	}
	.cmd {
		--caret: 1;
		color: var(--text);
	}
	.typed,
	.task .v {
		--n: 0;
		display: inline-block;
		vertical-align: top;
		max-width: calc(var(--n) * 1ch);
		overflow: hidden;
		white-space: pre;
	}
	.cmd::after {
		content: '';
		display: inline-block;
		width: 0.6ch;
		height: 1.1em;
		margin-left: 1px;
		vertical-align: -0.2em;
		background: var(--text);
		opacity: var(--caret);
		animation: caret 1.05s steps(1) infinite;
	}
	@keyframes caret {
		50% {
			background: transparent;
		}
	}

	.task {
		display: grid;
		grid-template-columns: 2.2ch 11ch minmax(0, 1fr) auto;
		align-items: baseline;
		padding-left: 1ch;
	}
	.task .spin {
		color: var(--signal);
	}
	.task:global([data-done]) .spin {
		color: var(--muted);
	}
	.task .k {
		color: var(--text);
	}
	.task .v {
		color: var(--dim);
		max-width: min(100%, calc(var(--n) * 1ch));
	}
	.task .s {
		color: var(--teal);
		padding-left: 2ch;
	}
	.task .s.noted {
		color: var(--amber);
	}
	.bearing {
		padding-left: 1ch;
	}
	.bearing .k {
		color: var(--signal);
		margin-right: 1.4ch;
	}
	.bearing .v {
		color: var(--text);
	}
	.wp {
		display: grid;
		grid-template-columns: 3ch 2.4ch minmax(0, 1fr) auto;
		padding-left: 1ch;
	}
	.wp .tree {
		color: var(--faint);
	}
	.wp .n {
		color: var(--rim);
	}
	.wp .v {
		color: var(--text-2);
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.wp .where {
		color: var(--muted);
		padding-left: 2ch;
	}
	.ask {
		padding-left: 1ch;
		color: var(--text);
	}
	.ask .q {
		color: var(--signal);
		margin-right: 0.8ch;
	}
	.ask .ans {
		color: var(--signal);
	}
	.ok {
		padding-left: 1ch;
		color: var(--text);
	}

	@media (max-width: 1100px) {
		.term {
			font-size: 12px;
		}
		.task {
			grid-template-columns: 2.2ch 10ch minmax(0, 1fr) auto;
		}
	}
	@media (max-width: 899px) {
		.handoff {
			height: auto;
		}
		.stage {
			position: relative;
			padding: 120px 0 80px;
		}
		.grid {
			grid-template-columns: 1fr;
			padding-left: 0;
		}
		.body {
			min-height: 0;
			padding: 16px 14px 20px;
		}
		.term {
			font-size: 11.5px;
		}
		.wp .where {
			display: none;
		}
		.wp {
			grid-template-columns: 3ch 2.4ch minmax(0, 1fr);
		}
		.task {
			grid-template-columns: 2.2ch 10ch minmax(0, 1fr);
		}
		.task .s {
			display: none;
		}
	}
</style>
