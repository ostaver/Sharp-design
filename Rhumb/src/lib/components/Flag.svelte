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
		fill: #ff5a7e;
	}
	.c-b {
		fill: #6d7cf5;
	}
	.c-y {
		fill: #ffc766;
	}
	.c-w {
		fill: #ecebf2;
	}
	.c-k {
		fill: #0b0b10;
	}
	.edge {
		fill: none;
		stroke: rgba(255, 255, 255, 0.28);
		stroke-width: 0.5;
	}
</style>
