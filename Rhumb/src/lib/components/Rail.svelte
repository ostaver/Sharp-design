<script>
	import { replaceState } from '$app/navigation';
	import Icon from './Icon.svelte';
	import { ui } from '$lib/state.svelte.js';
	import { sections } from '$lib/content.js';
	import { fmtTime } from '$lib/time.js';
	import { scrollTo } from '$lib/motion/scroll.js';

	function go(e, id) {
		e.preventDefault();
		scrollTo(`#${id}`);
		replaceState(`#${id}`, {});
	}
</script>

<nav class="rail" class:away={ui.foot} aria-label="Sections">
	<ol>
		{#each sections as s, i (s.id)}
			<li>
				<a href="#{s.id}" onclick={(e) => go(e, s.id)} aria-current={ui.section === i ? 'location' : undefined}>
					<Icon name={s.icon} size={16} />
					<span class="n" aria-hidden="true">{s.n}</span>
					<span class="tip">
						<span class="tn">{s.n}</span>
						{s.label}
						<span class="tt">{fmtTime(s.time)}</span>
					</span>
				</a>
			</li>
		{/each}
	</ol>
	<span class="ind" aria-hidden="true" style="--i:{ui.section}"></span>
</nav>

<style>
	.rail {
		--cell: 46px;
		position: fixed;
		left: 12px;
		top: 50%;
		z-index: 30;
		transform: translateY(-50%);
		border: 1px solid var(--hair);
		background: rgba(8, 8, 12, 0.5);
		-webkit-backdrop-filter: blur(6px);
		backdrop-filter: blur(6px);
		transition:
			background-color 0.6s var(--ease),
			border-color 0.6s var(--ease),
			opacity 0.6s var(--ease),
			translate 0.8s var(--ease);
	}
	/* out of the way over the footer, unless a keyboard user is on it */
	.rail.away:not(:focus-within) {
		opacity: 0;
		translate: -16px 0;
		pointer-events: none;
	}
	:global(.day) .rail {
		background: rgba(237, 229, 209, 0.6);
		border-color: rgba(22, 35, 75, 0.16);
	}
	ol {
		display: grid;
	}
	li + li {
		border-top: 1px solid var(--hair);
	}
	:global(.day) li + li {
		border-top-color: rgba(22, 35, 75, 0.12);
	}
	a {
		position: relative;
		display: grid;
		place-items: center;
		width: var(--cell);
		height: var(--cell);
		color: var(--muted);
		transition: color 0.35s var(--ease), background-color 0.35s var(--ease);
	}
	:global(.day) a {
		color: rgba(22, 35, 75, 0.45);
	}
	a:hover,
	a:focus-visible {
		color: var(--text);
		background: rgba(255, 255, 255, 0.03);
	}
	a[aria-current] {
		color: var(--text);
	}
	:global(.day) a:hover,
	:global(.day) a[aria-current] {
		color: var(--ink);
	}
	a:focus-visible {
		outline-offset: -3px;
	}
	.n {
		position: absolute;
		right: 4px;
		bottom: 3px;
		font-family: var(--f-mono);
		font-size: 7.5px;
		letter-spacing: 0.04em;
		color: var(--faint);
		transition: color 0.35s var(--ease);
	}
	a[aria-current] .n {
		color: var(--signal);
	}
	:global(.day) .n {
		color: rgba(22, 35, 75, 0.35);
	}
	:global(.day) a[aria-current] .n {
		color: var(--delft);
	}

	.ind {
		position: absolute;
		left: -1px;
		top: 0;
		width: 2px;
		height: var(--cell);
		background: var(--signal);
		transform: translateY(calc(var(--i) * (var(--cell) + 1px)));
		transition:
			transform 0.7s var(--ease),
			background-color 0.6s var(--ease);
	}
	:global(.day) .ind {
		background: var(--delft);
	}

	.tip {
		position: absolute;
		left: calc(100% + 10px);
		top: 50%;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 7px 10px;
		white-space: nowrap;
		font-family: var(--f-mono);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-2);
		background: var(--night-1);
		border: 1px solid var(--hair-2);
		opacity: 0;
		transform: translate(-6px, -50%);
		pointer-events: none;
		transition:
			opacity 0.25s var(--ease),
			transform 0.35s var(--ease);
	}
	:global(.day) .tip {
		background: var(--paper);
		color: var(--ink);
		border-color: rgba(22, 35, 75, 0.2);
	}
	.tn {
		color: var(--signal);
	}
	:global(.day) .tn {
		color: var(--delft);
	}
	.tt {
		color: var(--muted);
	}
	a:hover .tip,
	a:focus-visible .tip {
		opacity: 1;
		transform: translate(0, -50%);
	}

	@media (max-width: 1023px), (max-height: 520px) {
		.rail {
			display: none;
		}
	}
</style>
