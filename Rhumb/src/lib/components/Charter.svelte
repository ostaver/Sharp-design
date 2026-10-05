<script>
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { charter } from '$lib/content.js';
	import { gsap } from '$lib/motion/gsap.js';
	import { reveal } from '$lib/motion/reveal.js';
	import { ui } from '$lib/state.svelte.js';

	let root = $state();
	const ROMAN = ['I', 'II', 'III', 'IV'];

	onMount(() => {
		const q = gsap.utils.selector(root);
		const ctx = gsap.context(() => {
			reveal(root);
			if (ui.reduced) return;
			gsap.from(q('.tier'), {
				opacity: 0,
				y: 30,
				duration: 1.2,
				stagger: 0.12,
				scrollTrigger: { trigger: q('.tiers')[0], start: 'top 82%', once: true }
			});
			gsap.from(q('.tier .feats li'), {
				opacity: 0,
				x: -8,
				duration: 0.7,
				stagger: 0.03,
				delay: 0.4,
				scrollTrigger: { trigger: q('.tiers')[0], start: 'top 82%', once: true }
			});
		}, root);
		return () => ctx.revert();
	});
</script>

<section id="charter" class="charter" aria-labelledby="charter-title" bind:this={root}>
	<div class="wrap inner">
		<header class="head">
			<p class="sec-head label" data-r="fade">
				<span class="n">07</span><span>Charter</span><span class="rule"></span><span>07:15</span>
			</p>
			<div class="head-row">
				<h2 id="charter-title" class="h-section" data-r="lines">{charter.title[0]}</h2>
				<p class="lede" data-r="fade">{charter.lede}</p>
			</div>
		</header>

		<!-- Three articles of one charter party, not three cards: ruled columns, clauses in
		     the margin, the price set like a sum written in. -->
		<ul class="tiers">
			{#each charter.tiers as t, ti (t.id)}
				<li class="tier" class:featured={t.featured}>
					<p class="art label">Art. {ROMAN[ti]}{#if t.featured}<span class="note">most chartered</span>{/if}</p>
					<h3>{t.k}</h3>
					<p class="price">
						<span class="amt">{t.price}</span>
						<span class="per label">{t.per}</span>
					</p>
					<p class="tag">{t.t}</p>
					<ol class="feats">
						{#each t.features as f, fi (f)}
							<li><span class="cl" aria-hidden="true">§{fi + 1}</span><span>{f}</span></li>
						{/each}
					</ol>
					<a class="cta label" href="#landfall">
						<span>{t.cta}</span>
						<Icon name="arrow-r" size={14} />
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.charter {
		position: relative;
		z-index: 1;
		padding: clamp(100px, 16vh, 180px) 0 clamp(120px, 22vh, 240px);
	}
	.inner {
		padding-left: clamp(0px, 5vw, 64px);
	}
	.sec-head {
		margin-bottom: 28px;
	}
	.head-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 48px;
		align-items: end;
		margin-bottom: 56px;
	}
	.head-row .lede {
		max-width: 40ch;
		justify-self: end;
	}

	.tiers {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border-top: 1px solid var(--hair-2);
	}
	.tier {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 26px clamp(20px, 2.4vw, 34px) 30px;
		/* a dark ground under the type once the dawn bands climb behind it */
		background: linear-gradient(to bottom, rgba(5, 5, 7, 0.74), rgba(5, 5, 7, 0.5));
	}
	.tier + .tier {
		border-left: 1px solid var(--hair);
	}
	/* the featured article is ruled off in signal ink */
	.tier.featured::before {
		content: '';
		position: absolute;
		left: -1px;
		top: -1px;
		bottom: 0;
		width: 1px;
		background: linear-gradient(to bottom, var(--signal), rgba(255, 92, 210, 0.15));
	}
	.tier.featured::after {
		content: '';
		position: absolute;
		left: -1px;
		right: 0;
		top: -1px;
		height: 1px;
		background: var(--signal);
	}
	.art {
		display: flex;
		align-items: baseline;
		gap: 12px;
		font-size: 10px;
		color: var(--muted);
		margin-bottom: 20px;
	}
	.note {
		font-family: var(--f-serif);
		font-style: italic;
		font-size: 1.05rem;
		letter-spacing: 0;
		text-transform: none;
		color: var(--signal);
	}
	h3 {
		font-size: 1.12rem;
		font-weight: 540;
		letter-spacing: -0.02em;
		margin-bottom: 14px;
	}
	.price {
		display: flex;
		align-items: baseline;
		gap: 12px;
		margin-bottom: 12px;
	}
	.amt {
		font-family: var(--f-serif);
		font-size: clamp(3rem, 4.6vw, 4.4rem);
		letter-spacing: -0.02em;
		line-height: 0.95;
	}
	.per {
		font-size: 10px;
		color: var(--muted);
	}
	.tag {
		font-size: 0.95rem;
		color: var(--dim);
		margin-bottom: 24px;
		min-height: 3em;
	}
	.feats {
		display: grid;
		gap: 0;
		margin-bottom: 30px;
		flex: 1;
		align-content: start;
	}
	.feats li {
		display: grid;
		grid-template-columns: 3.2ch 1fr;
		align-items: baseline;
		padding: 9px 0;
		border-top: 1px dashed var(--hair);
		font-size: 0.92rem;
		line-height: 1.45;
		color: var(--text-2);
	}
	.cl {
		font-family: var(--f-mono);
		font-size: 10px;
		color: var(--faint);
	}
	.featured .cl {
		color: var(--signal-2);
	}
	/* The call to action is a signature line: a rule that draws on hover, not a box. */
	.cta {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		min-height: 48px;
		font-size: 10.5px;
		color: var(--text);
		border-bottom: 1px solid var(--hair-2);
		transition: color 0.3s var(--ease);
	}
	.cta::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: 1px;
		background: var(--signal);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.6s var(--ease);
	}
	.cta :global(svg) {
		transition: transform 0.45s var(--ease);
	}
	.cta:hover {
		color: var(--signal);
	}
	.cta:hover::after {
		transform: scaleX(1);
	}
	.cta:hover :global(svg) {
		transform: translateX(4px);
	}
	.featured .cta {
		padding: 0 16px;
		background: var(--signal);
		border-color: var(--signal);
		color: #140612;
	}
	.featured .cta::after {
		display: none;
	}
	.featured .cta:hover {
		background: #ff7fdd;
		color: #140612;
	}

	@media (max-width: 960px) {
		.tiers {
			grid-template-columns: 1fr;
			border-top: 0;
		}
		.tier {
			border-top: 1px solid var(--hair-2);
		}
		.tier + .tier {
			border-left: 0;
		}
		.tier.featured::before {
			display: none;
		}
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
</style>
