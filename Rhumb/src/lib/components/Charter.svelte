<script>
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { charter } from '$lib/content.js';
	import { gsap } from '$lib/motion/gsap.js';
	import { reveal } from '$lib/motion/reveal.js';
	import { ui } from '$lib/state.svelte.js';

	let root = $state();

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
			gsap.from(q('.tier li'), {
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

		<ul class="tiers">
			{#each charter.tiers as t (t.id)}
				<li class="tier" class:featured={t.featured}>
					{#if t.featured}<span class="badge label">Most chartered</span>{/if}
					<h3>{t.k}</h3>
					<p class="price">
						<span class="amt">{t.price}</span>
						<span class="per label">{t.per}</span>
					</p>
					<p class="tag">{t.t}</p>
					<ul class="feats">
						{#each t.features as f (f)}
							<li><Icon name="check" size={13} /><span>{f}</span></li>
						{/each}
					</ul>
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
		border-left: 1px solid var(--hair);
	}
	.tier {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 30px 28px 28px;
		border: 1px solid var(--hair);
		border-left: 0;
		background: rgba(7, 7, 10, 0.64);
		-webkit-backdrop-filter: blur(3px);
		backdrop-filter: blur(3px);
		transition: background-color 0.5s var(--ease);
	}
	.tier:hover {
		background: rgba(12, 10, 16, 0.8);
	}
	.tier.featured {
		background: rgba(22, 8, 20, 0.72);
	}
	.tier.featured::before {
		content: '';
		position: absolute;
		inset: -1px -1px auto -1px;
		height: 2px;
		background: var(--signal);
		box-shadow: 0 0 18px var(--signal);
	}
	.badge {
		position: absolute;
		top: 18px;
		right: 18px;
		font-size: 9.5px;
		color: var(--signal);
		padding: 5px 8px;
		border: 1px solid rgba(255, 92, 210, 0.35);
	}
	h3 {
		font-size: 1.12rem;
		font-weight: 540;
		letter-spacing: -0.02em;
		margin-bottom: 26px;
	}
	.price {
		display: flex;
		align-items: baseline;
		gap: 12px;
		margin-bottom: 10px;
	}
	.amt {
		font-size: clamp(2.3rem, 3.4vw, 3.2rem);
		font-weight: 480;
		letter-spacing: -0.05em;
		line-height: 1;
	}
	.per {
		font-size: 10px;
		color: var(--muted);
	}
	.tag {
		font-size: 0.95rem;
		color: var(--dim);
		margin-bottom: 26px;
		min-height: 3em;
	}
	.feats {
		display: grid;
		gap: 11px;
		padding-top: 22px;
		border-top: 1px solid var(--hair);
		margin-bottom: 34px;
		flex: 1;
	}
	.feats li {
		display: grid;
		grid-template-columns: 18px 1fr;
		align-items: start;
		font-size: 0.92rem;
		line-height: 1.45;
		color: var(--text-2);
	}
	.feats :global(svg) {
		margin-top: 3px;
		color: var(--teal);
	}
	.cta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		min-height: 48px;
		padding: 0 16px;
		border: 1px solid var(--hair-2);
		font-size: 10.5px;
		color: var(--text);
		transition:
			border-color 0.3s var(--ease),
			color 0.3s var(--ease),
			background-color 0.3s var(--ease);
	}
	.cta :global(svg) {
		transition: transform 0.45s var(--ease);
	}
	.cta:hover {
		border-color: var(--signal);
		color: var(--signal);
	}
	.cta:hover :global(svg) {
		transform: translateX(4px);
	}
	.featured .cta {
		background: var(--signal);
		border-color: var(--signal);
		color: #140612;
	}
	.featured .cta:hover {
		background: #ff7fdd;
		color: #140612;
	}

	@media (max-width: 960px) {
		.tiers {
			grid-template-columns: 1fr;
			border-left: 0;
		}
		.tier {
			border-left: 1px solid var(--hair);
			border-top: 0;
		}
		.tier:first-child {
			border-top: 1px solid var(--hair);
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
