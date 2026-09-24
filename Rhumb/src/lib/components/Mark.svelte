<script>
	/** Ostarev's mark: an eight-point wind rose whose north-east point is a needle on 047°. */
	let { size = 22, class: cls = '' } = $props();
</script>

<svg class="mark {cls}" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
	<g fill="currentColor">
		<path d="M16 1.2 17.9 14.1 16 16 14.1 14.1Z" />
		<path d="M16 1.2 17.9 14.1 16 16 14.1 14.1Z" transform="rotate(90 16 16)" />
		<path d="M16 1.2 17.9 14.1 16 16 14.1 14.1Z" transform="rotate(180 16 16)" />
		<path d="M16 1.2 17.9 14.1 16 16 14.1 14.1Z" transform="rotate(270 16 16)" />
		<path d="M16 7.4 17.1 14.9 16 16 14.9 14.9Z" transform="rotate(135 16 16)" />
		<path d="M16 7.4 17.1 14.9 16 16 14.9 14.9Z" transform="rotate(225 16 16)" />
		<path d="M16 7.4 17.1 14.9 16 16 14.9 14.9Z" transform="rotate(315 16 16)" />
	</g>
	<path class="needle" d="M16 2.6 17.7 14.3 16 16 14.3 14.3Z" transform="rotate(47 16 16)" />
	<circle cx="16" cy="16" r="1.5" class="hub" />
</svg>

<style>
	.needle {
		fill: var(--signal);
		transition: fill 0.6s var(--ease);
	}
	.hub {
		fill: var(--night);
		transition: fill 0.6s var(--ease);
	}
	:global(.day) .needle {
		fill: var(--delft);
	}
	:global(.day) .hub {
		fill: var(--paper);
	}
</style>
