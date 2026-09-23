<script>
	import { onMount } from 'svelte';
	import { install } from '$lib/content.js';
	import { gsap } from '$lib/motion/gsap.js';
	import { ui } from '$lib/state.svelte.js';

	let { id = 'install', compact = false } = $props();

	let active = $state(0);
	let copied = $state(false);
	let tabsEl = $state();
	let inkEl = $state();
	let codeEl = $state();
	let copyEl = $state();
	let copyTimer;

	const current = $derived(install[active]);

	function placeInk(animate = true) {
		const btn = tabsEl?.querySelectorAll('[role="tab"]')[active];
		if (!btn || !inkEl) return;
		const x = btn.offsetLeft;
		const w = btn.offsetWidth;
		if (animate && !ui.reduced) gsap.to(inkEl, { x, width: w, duration: 0.55, ease: 'helm' });
		else gsap.set(inkEl, { x, width: w });
	}

	function select(i, focus = false) {
		if (i === active) return;
		active = i;
		placeInk();
		const cmd = install[i].cmd;
		if (codeEl && !ui.reduced) {
			gsap.to(codeEl, {
				duration: 0.6,
				scrambleText: { text: cmd, chars: 'lowerCase', speed: 0.9, revealDelay: 0.08, tweenLength: true },
				ease: 'none'
			});
		} else if (codeEl) codeEl.textContent = cmd;
		if (focus) tabsEl.querySelectorAll('[role="tab"]')[i]?.focus();
	}

	function onKey(e) {
		const n = install.length;
		if (e.key === 'ArrowRight') select((active + 1) % n, true);
		else if (e.key === 'ArrowLeft') select((active - 1 + n) % n, true);
		else if (e.key === 'Home') select(0, true);
		else if (e.key === 'End') select(n - 1, true);
		else return;
		e.preventDefault();
	}

	async function copy() {
		const text = current.cmd;
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			const r = document.createRange();
			r.selectNodeContents(codeEl);
			const sel = getSelection();
			sel.removeAllRanges();
			sel.addRange(r);
			document.execCommand('copy');
			sel.removeAllRanges();
		}
		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 1800);
		if (!ui.reduced) {
			gsap.fromTo(copyEl, { '--flash': 1 }, { '--flash': 0, duration: 0.9, ease: 'power2.out' });
		}
	}

	onMount(() => {
		placeInk(false);
		const ro = new ResizeObserver(() => placeInk(false));
		ro.observe(tabsEl);
		document.fonts?.ready.then(() => placeInk(false));
		return () => {
			ro.disconnect();
			clearTimeout(copyTimer);
		};
	});
</script>

<div class="install" class:compact>
	<div class="tabs" bind:this={tabsEl}>
		<div class="tablist" role="tablist" aria-label="Install with" tabindex="-1" onkeydown={onKey}>
			{#each install as m, i (m.id)}
				<button
					type="button"
					role="tab"
					id="{id}-tab-{m.id}"
					class="label"
					aria-selected={active === i}
					aria-controls="{id}-panel"
					tabindex={active === i ? 0 : -1}
					onclick={() => select(i)}>{m.label}</button
				>
			{/each}
		</div>
		<span class="os label" aria-live="polite">{current.os}</span>
		<span class="ink" bind:this={inkEl} aria-hidden="true"></span>
	</div>
	<div class="cmd" role="tabpanel" id="{id}-panel" aria-labelledby="{id}-tab-{current.id}">
		<span class="prompt" aria-hidden="true">$</span>
		<code bind:this={codeEl}>{install[0].cmd}</code>
		<button class="copy label" type="button" bind:this={copyEl} onclick={copy} aria-label="Copy the install command">
			<span class="copy-t">{copied ? 'Copied' : 'Copy'}</span>
		</button>
		<span class="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</span>
	</div>
</div>

<style>
	/* Theme tokens: night by default, ink on paper once the page (or this block) turns to day. */
	.install {
		--i-tab: var(--muted);
		--i-tab-hover: var(--text-2);
		--i-tab-on: var(--text);
		--i-accent: var(--signal);
		--i-glow: var(--signal-glow);
		--i-line: var(--hair-2);
		--i-line-2: var(--hair);
		--i-bg: rgba(10, 10, 14, 0.72);
		--i-code: var(--text);
		--i-copy: var(--dim);
		width: 100%;
		max-width: 540px;
	}
	:global(.day) .install,
	:global([data-inked]) .install {
		--i-tab: var(--ink-2);
		--i-tab-hover: var(--ink);
		--i-tab-on: var(--ink);
		--i-accent: var(--delft);
		--i-glow: transparent;
		--i-line: rgba(22, 35, 75, 0.3);
		--i-line-2: rgba(22, 35, 75, 0.18);
		--i-bg: rgba(237, 229, 209, 0.72);
		--i-code: var(--ink);
		--i-copy: var(--ink-2);
	}
	.tabs {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 10px;
	}
	.tablist {
		display: flex;
		gap: 2px;
	}
	[role='tab'] {
		position: relative;
		padding: 8px 9px 9px;
		min-height: 34px;
		font-size: 10.5px;
		letter-spacing: 0.17em;
		color: var(--i-tab);
		transition: color 0.3s var(--ease);
	}
	[role='tab']:first-child {
		padding-left: 7px;
	}
	[role='tab']:hover {
		color: var(--i-tab-hover);
	}
	[role='tab'][aria-selected='true'] {
		color: var(--i-tab-on);
	}
	[role='tab']:focus-visible {
		outline-offset: -2px;
	}
	.ink {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 1px;
		width: 40px;
		background: var(--i-accent);
		box-shadow: 0 0 8px var(--i-glow);
		transition: background-color 0.35s linear;
	}
	.os {
		font-size: 10px;
		color: var(--i-tab);
		white-space: nowrap;
		transition: color 0.35s linear;
	}

	.cmd {
		--flash: 0;
		display: grid;
		grid-template-columns: 42px 1fr auto;
		align-items: stretch;
		min-height: 50px;
		border: 1px solid var(--i-line);
		background: var(--i-bg);
		-webkit-backdrop-filter: blur(4px);
		backdrop-filter: blur(4px);
		transition:
			background-color 0.35s linear,
			border-color 0.35s linear;
	}
	.prompt {
		display: grid;
		place-items: center;
		border-right: 1px solid var(--i-line-2);
		color: var(--i-accent);
		font-family: var(--f-mono);
		font-size: 14px;
		transition: color 0.35s linear;
	}
	code {
		align-self: center;
		padding: 0 16px;
		font-size: 13.5px;
		letter-spacing: 0.005em;
		color: var(--i-code);
		white-space: nowrap;
		overflow-x: auto;
		scrollbar-width: none;
		transition: color 0.35s linear;
	}
	code::-webkit-scrollbar {
		display: none;
	}
	.copy {
		position: relative;
		display: grid;
		place-items: center;
		min-width: 86px;
		padding: 0 16px;
		border-left: 1px solid var(--i-line-2);
		font-size: 10.5px;
		color: var(--i-copy);
		transition:
			color 0.3s var(--ease),
			background-color 0.3s var(--ease);
		background: rgba(255, 92, 210, calc(var(--flash) * 0.22));
	}
	.copy:hover {
		color: var(--i-accent);
		background-color: rgba(255, 255, 255, 0.03);
	}
	.copy:focus-visible {
		outline-offset: -3px;
	}

	.compact .cmd {
		min-height: 46px;
	}

	@media (max-width: 520px) {
		[role='tab'] {
			padding-inline: 6px;
			letter-spacing: 0.12em;
		}
		.os {
			display: none;
		}
		.cmd {
			grid-template-columns: 34px 1fr auto;
		}
		code {
			font-size: 12.5px;
			padding: 0 12px;
		}
		.copy {
			min-width: 68px;
			padding: 0 10px;
		}
	}
</style>
