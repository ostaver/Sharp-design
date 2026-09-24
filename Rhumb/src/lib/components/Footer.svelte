<script>
	import { replaceState } from '$app/navigation';
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
			replaceState(href, {});
		}
	}

	onMount(() => {
		const q = gsap.utils.selector(root);

		const ctx = gsap.context(() => {
			if (!ui.reduced) {
				gsap.from(q('.brand-col > *, .col'), {
					opacity: 0,
					y: 16,
					duration: 1.2,
					stagger: 0.07,
					scrollTrigger: { trigger: root, start: 'top 55%', once: true }
				});
				gsap.from(q('.colophon > *'), {
					opacity: 0,
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
	<div class="wash" aria-hidden="true"></div>

	<div class="over">
		<div class="brand-col">
			<a class="brand" href="#heading" aria-label="Ostarev, back to the top" onclick={(e) => go(e, '#heading')}>
				<Mark size={24} />
				<span class="word">ostarev</span>
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

	<div class="wash-room" aria-hidden="true"></div>

	<div class="colophon">
		<span class="copy">© {site.year} {site.company}</span>
		<span class="caption">{footer.caption}</span>
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
	/* A flat print of the morning: paper at the top (continuous with landfall), warming
	   through a dawn blush into Delft blue, under a fixed grain. It stops short of the
	   bottom, leaving a margin for the caption, as on a print. No canvas, no drawing. */
	.wash {
		--grain-ink: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.086 0 0 0 0 0.137 0 0 0 0 0.294 2.6 0 0 0 -1.25'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
		--grain-paper: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='31' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.98 0 0 0 0 0.92 0 0 0 0 0.8 0 2.6 0 0 -1.3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
		position: absolute;
		inset: 0 0 var(--margin) 0;
		background:
			radial-gradient(120% 55% at 72% 62%, rgba(255, 195, 144, 0.38), transparent 70%),
			linear-gradient(
				to bottom,
				var(--paper) 0%,
				var(--paper) 34%,
				#eedac2 52%,
				#d6c9cc 64%,
				#9aa6cd 76%,
				#4f69b4 89%,
				var(--delft) 100%
			),
			var(--paper);
	}
	/* grain: ink specks that read on the paper, paper specks that read on the blue */
	.wash::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--grain-ink) 0 0 / 240px 240px;
		/* none where the paper meets landfall, so the join stays seamless */
		-webkit-mask-image: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.25) 30%, #000 70%);
		mask-image: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.25) 30%, #000 70%);
		opacity: 0.5;
	}
	.wash::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--grain-paper) 60px 90px / 240px 240px;
		box-shadow: inset 0 -1px 0 rgba(22, 35, 75, 0.35);
		-webkit-mask-image: linear-gradient(to bottom, transparent 45%, #000 85%);
		mask-image: linear-gradient(to bottom, transparent 45%, #000 85%);
		opacity: 0.5;
	}

	/* Links sit on the paper at the top of the wash. */
	.over {
		position: relative;
		width: min(1240px, 100% - 2 * var(--gutter));
		margin-inline: auto;
		padding-top: clamp(56px, 8vh, 96px);
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
	.wash-room {
		display: none;
	}

	/* Narrow screens: links on bare paper first, then the wash deepens beneath them. */
	@media (max-width: 720px) {
		.foot {
			--band: min(100vw, 440px);
			--margin: 116px;
			min-height: 0;
		}
		.wash {
			top: auto;
			height: var(--band);
		}
		.wash-room {
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
