<script>
	import { FLAGS } from '$lib/flags.js';

	/** One signal flag, hoisted on a short halyard. */
	let { letter, size = 26 } = $props();
	const shapes = $derived(FLAGS[letter.toUpperCase()] ?? []);
</script>

<svg class="flag" width={size} height={(size * 16) / 24} viewBox="0 0 24 16" aria-hidden="true">
	{#each shapes as s, i (i)}
		{#if s.t === 'rect'}
			<rect {...s.a} class="c-{s.c}" />
		{:else if s.t === 'path'}
			<path {...s.a} class="c-{s.c}" />
		{:else}
			<circle {...s.a} class="c-{s.c}" />
		{/if}
	{/each}
	<rect x="0.25" y="0.25" width="23.5" height="15.5" class="edge" />
</svg>

<style>
	.flag {
		shape-rendering: crispEdges;
	}
	.c-r {
		fill: var(--flag-r);
	}
	.c-b {
		fill: var(--flag-b);
	}
	.c-y {
		fill: var(--flag-y);
	}
	.c-w {
		fill: var(--flag-w);
	}
	.c-k {
		fill: var(--flag-k);
	}
	.edge {
		fill: none;
		stroke: color-mix(in srgb, var(--text) 28%, transparent);
		stroke-width: 0.5;
	}
</style>
