<script>
	import { replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import Mark from './Mark.svelte';
	import { footer, site } from '$lib/content.js';
	import { gsap, ScrollTrigger } from '$lib/motion/gsap.js';
	import { ui } from '$lib/state.svelte.js';
	import { setSea } from '$lib/audio/bell.js';
	import { scrollTo } from '$lib/motion/scroll.js';

	let root = $state();

	const elsewhere = [
		{ t: 'GitHub', href: site.github },
		{ t: 'Discord', href: site.discord },
		{ t: 'X', href: site.x }
	];

	// In-page links glide back up the night; placeholder links (#) stay put.
	function go(e, href) {
		if (!href.startsWith('#')) return;
		e.preventDefault();
		if (href.length > 1) {
			scrollTo(href, { duration: 2.6 });
			replaceState(href, {});
		}
	}

	onMount(() => {
		const q = gsap.utils.selector(root);

		const ctx = gsap.context(() => {
			if (!ui.reduced) {
				const st = (el, start = 'top 88%') => ({ trigger: el, start, once: true });
				gsap.from(q('.head .rule'), { scaleX: 0, transformOrigin: 'left', duration: 1.6, ease: 'haul', scrollTrigger: st(q('.head')[0]) });
				gsap.from(q('.head > :not(.rule), .lead > *'), { opacity: 0, y: 16, duration: 1.3, stagger: 0.08, scrollTrigger: st(q('.head')[0]) });
				// the billing comes up column by column, like a card of credits
				gsap.from(q('.role'), { opacity: 0, y: 22, duration: 1.3, stagger: 0.07, scrollTrigger: st(q('.roll')[0]) });
				gsap.from(q('.title'), {
					yPercent: 22,
					opacity: 0,
					duration: 2.2,
					ease: 'helm',
					scrollTrigger: st(q('.endcard')[0], 'top 45%')
				});
				gsap.from(q('.colophon > *'), { opacity: 0, duration: 1.4, stagger: 0.1, delay: 0.6, scrollTrigger: st(q('.endcard')[0], 'top 45%') });
			}
			ScrollTrigger.create({
				trigger: root,
				start: 'top bottom',
				end: 'bottom top',
				onToggle: (self) => {
					if (ui.sound) setSea(self.isActive ? 1 : 0);
				}
			});
		}, root);

		return () => ctx.revert();
	});

	$effect(() => {
		// sound switched while the footer is on screen
		if (!ui.sound) setSea(0);
	});
</script>

<footer class="foot" bind:this={root} aria-label="Site">
	<div class="frame credits">
		<p class="head label">
			<a class="brand" href="#heading" aria-label="Ostarev, back to the top" onclick={(e) => go(e, '#heading')}>
				<Mark size={16} />
			</a>
			<span>{footer.kicker}</span>
			<span class="rule" aria-hidden="true"></span>
			<span class="tm">08:00</span>
		</p>

		<div class="body">
			<div class="lead">
				<p class="relieved">{footer.relieved}</p>
				<p class="after">{footer.after}</p>
			</div>

			<nav class="roll" aria-label="Footer">
				{#each footer.columns as c (c.h)}
					<div class="role">
						<h2 class="label">{c.h}</h2>
						<ul>
							{#each c.links as l (l.t)}
								<li><a href={l.href} onclick={(e) => go(e, l.href)}>{l.t}</a></li>
							{/each}
						</ul>
					</div>
				{/each}
				<div class="role">
					<h2 class="label">Elsewhere</h2>
					<ul>
						{#each elsewhere as l (l.t)}
							<li>
								<a href={l.href} target="_blank" rel="noreferrer">{l.t}<span class="ne" aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>
							</li>
						{/each}
					</ul>
				</div>
			</nav>
		</div>
	</div>

	<!-- The end card: a grainy morning sky, and the name set edge to edge across it. -->
	<div class="endcard">
		<div class="frame card-in">
			<p class="title" aria-hidden="true">ostarev</p>
			<div class="colophon">
				<span>© {site.year} {site.company}</span>
				<span class="mid">{footer.coords}</span>
				<span class="end">{footer.sculp}</span>
			</div>
		</div>
	</div>
</footer>

<style>
	.foot {
		position: relative;
		z-index: 2;
		isolation: isolate;
		color: var(--ink);
		background: var(--paper);
		overflow: hidden;
	}
	/* Same gutters as the page: nothing floats on its own axis in the middle of a wide screen. */
	.frame {
		width: calc(100% - 2 * var(--gutter));
		margin-inline: auto;
	}

	/* ---- credits ---- */
	.credits {
		padding: clamp(120px, 20vh, 240px) 0 clamp(72px, 10vh, 140px);
	}
	.head {
		display: flex;
		align-items: center;
		gap: 14px;
		font-size: clamp(10px, 0.28vw + 5.5px, 12px);
		letter-spacing: 0.24em;
		color: var(--ink-2);
		margin-bottom: clamp(48px, 8vh, 96px);
	}
	.head .rule {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, rgba(22, 35, 75, 0.28), rgba(22, 35, 75, 0.08));
	}
	.head .tm {
		color: var(--delft);
	}
	.brand {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		margin: -8px -4px -8px -8px;
		color: var(--ink);
	}
	.brand :global(.mark) {
		transition: transform 0.9s var(--ease);
	}
	.brand:hover :global(.mark) {
		transform: rotate(-47deg);
	}

	.body {
		display: grid;
		grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
		gap: clamp(48px, 6vw, 140px);
		align-items: start;
	}
	.relieved {
		font-family: var(--f-serif);
		font-style: italic;
		font-size: clamp(2.4rem, 3.9vw, 5.6rem);
		line-height: 1;
		letter-spacing: -0.02em;
		color: var(--delft);
		text-wrap: balance;
	}
	.after {
		margin-top: 0.9em;
		max-width: 30ch;
		font-size: clamp(1rem, 0.3vw + 0.9rem, 1.3rem);
		line-height: 1.5;
		color: var(--ink-2);
	}

	.roll {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: clamp(28px, 2.6vw, 56px) clamp(20px, 2vw, 44px);
		padding-top: 0.6em;
	}
	.role h2 {
		font-size: clamp(9.5px, 0.22vw + 6px, 11.5px);
		letter-spacing: 0.22em;
		color: var(--ink-2);
		padding-bottom: 12px;
		margin-bottom: 14px;
		border-bottom: 1px solid rgba(22, 35, 75, 0.14);
	}
	.role ul {
		display: grid;
		gap: 2px;
	}
	.role a {
		display: inline-flex;
		align-items: baseline;
		gap: 5px;
		font-size: clamp(0.94rem, 0.24vw + 0.84rem, 1.2rem);
		font-weight: 440;
		letter-spacing: -0.01em;
		line-height: 1.75;
		color: var(--ink);
		background-image: linear-gradient(currentColor, currentColor);
		background-size: 0% 1px;
		background-repeat: no-repeat;
		background-position: 0 88%;
		transition:
			background-size 0.45s var(--ease),
			color 0.3s var(--ease);
	}
	.role a:hover {
		color: var(--delft);
		background-size: 100% 1px;
	}
	.ne {
		font-size: 0.75em;
		opacity: 0.55;
	}
	.foot :focus-visible {
		outline-color: var(--delft);
	}

	/* ---- the end card: paper where landfall left off, deepening into Delft ---- */
	.endcard {
		position: relative;
		isolation: isolate;
		/* sky enough above the name for the gradient to breathe, and no more */
		padding-top: clamp(180px, 30vh, 420px);
		background: linear-gradient(
			180deg,
			var(--paper) 0%,
			#e4d6bf 12%,
			#c8c2c4 26%,
			#93a1c9 42%,
			#5a74bd 58%,
			#2f4a9e 74%,
			#1f3d91 86%,
			#15205a 100%
		);
		color: var(--paper);
	}
	.endcard::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background: var(--grain) 0 0 / 180px 180px;
		mix-blend-mode: overlay;
		opacity: 0.55;
		/* none at the seam, where the page-wide grain already matches the paper */
		-webkit-mask-image: linear-gradient(to bottom, transparent 4%, #000 34%);
		mask-image: linear-gradient(to bottom, transparent 4%, #000 34%);
	}
	.card-in {
		container-type: inline-size;
		padding-bottom: clamp(18px, 2.4vh, 32px);
	}
	/* Set to the frame's width, so the name meets both gutters on any screen. */
	.title {
		font-size: min(32cqw, 60vh);
		font-weight: 560;
		letter-spacing: -0.065em;
		line-height: 0.74;
		margin-left: -0.045em;
		color: var(--paper);
		opacity: 0.95;
		white-space: nowrap;
	}
	.colophon {
		margin-top: clamp(22px, 3.4vh, 44px);
		padding-top: 14px;
		border-top: 1px solid rgba(237, 229, 209, 0.2);
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 16px;
		font-family: var(--f-mono);
		font-size: clamp(10px, 0.26vw + 6px, 12px);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgba(237, 229, 209, 0.7);
	}
	.colophon .end {
		text-align: right;
	}

	@media (max-width: 1180px) {
		.body {
			grid-template-columns: 1fr;
		}
		.lead {
			max-width: 640px;
		}
	}
	@media (max-width: 760px) {
		.roll {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.endcard {
			padding-top: clamp(200px, 34svh, 320px);
		}
		.colophon {
			grid-template-columns: 1fr;
			gap: 6px;
		}
		.colophon .end {
			text-align: left;
		}
	}
</style>
