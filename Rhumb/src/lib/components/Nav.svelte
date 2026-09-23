<script>
	import Mark from './Mark.svelte';
	import Icon from './Icon.svelte';
	import { ui } from '$lib/state.svelte.js';
	import { site, sections } from '$lib/content.js';
	import { fmtTime, watchName, bellsAt } from '$lib/time.js';
	import { setSound, strike } from '$lib/audio/bell.js';
	import { scrollTo, lockScroll } from '$lib/motion/scroll.js';
	import { tick } from 'svelte';

	const time = $derived(fmtTime(ui.clock));
	const watch = $derived(watchName(ui.clock));
	const bells = $derived(bellsAt(ui.clock));

	let menuEl = $state();
	let menuBtn = $state();

	function toggleSound() {
		ui.sound = !ui.sound;
		setSound(ui.sound);
		if (ui.sound) strike(2);
	}

	async function setMenu(open) {
		ui.menu = open;
		lockScroll(open);
		await tick();
		if (open) menuEl?.querySelector('a, button')?.focus();
		else menuBtn?.focus();
	}

	function go(e, id) {
		e.preventDefault();
		if (ui.menu) {
			ui.menu = false;
			lockScroll(false);
		}
		scrollTo(`#${id}`);
		history.replaceState(null, '', `#${id}`);
	}

	function onMenuKey(e) {
		if (e.key === 'Escape') return setMenu(false);
		if (e.key !== 'Tab') return;
		const f = [...menuEl.querySelectorAll('a, button')];
		const first = f[0];
		const last = f[f.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}
</script>

<header class="nav" class:scrolled={ui.scrolled} class:away={ui.foot && !ui.menu}>
	<div class="bar">
		<a class="brand" href="#heading" onclick={(e) => go(e, 'heading')} aria-label="Rhumb, back to the top">
			<Mark size={22} />
			<span class="word">rhumb</span>
		</a>

		<div class="clock" aria-label="Ship's time {time}, {watch}, {bells} bells" role="img">
			<span class="t">{time}</span>
			<span class="w label">{watch}</span>
			<span class="bells" aria-hidden="true">
				{#each [0, 1, 2, 3] as p (p)}
					<span class="pair">
						<i class:on={bells > p * 2}></i>
						<i class:on={bells > p * 2 + 1}></i>
					</span>
				{/each}
			</span>
		</div>

		<nav class="links" aria-label="Primary">
			<a class="label" href={site.docs}>Docs</a>
			<a class="label" href="#night" onclick={(e) => go(e, 'night')}>Night log</a>
			<a class="ext" href={site.discord} target="_blank" rel="noreferrer" aria-label="Discord (opens in a new tab)">
				<Icon name="discord" size={15} />
				<Icon name="arrow-ne" size={9} class="ne" />
			</a>
			<a class="ext" href={site.github} target="_blank" rel="noreferrer" aria-label="GitHub, 18.2 thousand stars (opens in a new tab)">
				<Icon name="github" size={14} />
				<span class="stars label">18.2k</span>
				<Icon name="arrow-ne" size={9} class="ne" />
			</a>
			<button class="sound" type="button" aria-pressed={ui.sound} onclick={toggleSound} aria-label="Ship's bell sound">
				<Icon name={ui.sound ? 'bell' : 'bell-off'} size={15} />
				<span class="tip label" aria-hidden="true">{ui.sound ? 'Bells on' : 'Bells off'}</span>
			</button>
		</nav>

		<button
			class="menu-btn"
			type="button"
			bind:this={menuBtn}
			aria-expanded={ui.menu}
			aria-controls="menu"
			onclick={() => setMenu(!ui.menu)}
		>
			<span class="label">{ui.menu ? 'Close' : 'Menu'}</span>
			<Icon name={ui.menu ? 'close' : 'menu'} size={16} />
		</button>
	</div>
</header>

<div
	id="menu"
	class="menu"
	class:open={ui.menu}
	bind:this={menuEl}
	aria-hidden={!ui.menu}
	inert={!ui.menu}
	role="dialog"
	aria-modal="true"
	aria-label="Sections"
	tabindex="-1"
	onkeydown={onMenuKey}
>
	<ol>
		{#each sections as s, i (s.id)}
			<li style="--i:{i}">
				<a href="#{s.id}" onclick={(e) => go(e, s.id)} aria-current={ui.section === i ? 'true' : undefined}>
					<span class="n label">{s.n}</span>
					<span class="k">{s.label}</span>
					<span class="tm label">{fmtTime(s.time)}</span>
				</a>
			</li>
		{/each}
	</ol>
	<div class="menu-foot">
		<a class="label" href={site.docs}>Docs</a>
		<a class="label" href={site.github} target="_blank" rel="noreferrer">GitHub ↗</a>
		<a class="label" href={site.discord} target="_blank" rel="noreferrer">Discord ↗</a>
		<button class="label" type="button" aria-pressed={ui.sound} onclick={toggleSound}>Bells {ui.sound ? 'on' : 'off'}</button>
	</div>
</div>

<style>
	.nav {
		position: fixed;
		inset: 0 0 auto 0;
		z-index: 40;
		pointer-events: none;
		color: var(--text);
		transition:
			color 0.6s var(--ease),
			opacity 0.6s var(--ease),
			transform 0.8s var(--ease);
	}
	/* A soft backing once content starts passing underneath: dark glass, fading out downward. */
	.nav::before {
		content: '';
		position: absolute;
		inset: 0 0 -34px 0;
		background: linear-gradient(to bottom, rgba(5, 5, 7, 0.9), rgba(5, 5, 7, 0.62) 58%, rgba(5, 5, 7, 0));
		-webkit-backdrop-filter: blur(7px);
		backdrop-filter: blur(7px);
		-webkit-mask-image: linear-gradient(to bottom, #000 52%, transparent);
		mask-image: linear-gradient(to bottom, #000 52%, transparent);
		opacity: 0;
		transition:
			opacity 0.5s var(--ease),
			background 0.6s var(--ease);
	}
	.nav.scrolled::before {
		opacity: 1;
	}
	.nav.away {
		opacity: 0;
		transform: translateY(-16px);
	}
	.nav.away .bar {
		pointer-events: none;
	}
	:global(.day) .nav {
		color: var(--ink);
	}
	:global(.day) .nav::before {
		background: linear-gradient(to bottom, rgba(237, 229, 209, 0.92), rgba(237, 229, 209, 0.6) 58%, rgba(237, 229, 209, 0));
	}
	.bar {
		position: relative;
	}
	.bar {
		pointer-events: auto;
		width: min(1080px, 100% - 2 * var(--gutter));
		height: 68px;
		margin-inline: auto;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 24px;
	}

	.brand {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 6px 4px 6px 0;
	}
	.word {
		font-size: 17px;
		font-weight: 600;
		letter-spacing: -0.035em;
		line-height: 1;
		transform: translateY(-1px);
	}
	.brand :global(.mark) {
		transition: transform 0.9s var(--ease);
	}
	.brand:hover :global(.mark) {
		transform: rotate(-47deg);
	}

	.clock {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		color: var(--dim);
		font-variant-numeric: tabular-nums;
	}
	:global(.day) .clock {
		color: var(--ink-2);
	}
	.clock .t {
		font-family: var(--f-mono);
		font-size: 12.5px;
		letter-spacing: 0.06em;
		color: var(--text);
	}
	:global(.day) .clock .t {
		color: var(--ink);
	}
	.clock .w {
		font-size: 10px;
		min-width: 13ch;
	}
	.bells {
		display: inline-flex;
		gap: 5px;
	}
	.pair {
		display: inline-flex;
		gap: 2px;
	}
	.pair i {
		width: 4px;
		height: 4px;
		background: var(--faint);
		transition: background-color 0.4s var(--ease);
	}
	.pair i.on {
		background: var(--signal);
	}
	:global(.day) .pair i {
		background: rgba(22, 35, 75, 0.2);
	}
	:global(.day) .pair i.on {
		background: var(--delft);
	}

	.links {
		justify-self: end;
		display: flex;
		align-items: center;
		gap: 22px;
	}
	.links a,
	.links button {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		min-height: 36px;
		color: inherit;
		opacity: 0.86;
		transition: opacity 0.3s var(--ease), color 0.3s var(--ease);
	}
	.links a:hover,
	.links button:hover {
		opacity: 1;
		color: var(--signal);
	}
	:global(.day) .links a:hover,
	:global(.day) .links button:hover {
		color: var(--delft);
	}
	.links :global(.ne) {
		opacity: 0.6;
		transform: translateY(-3px);
	}
	.stars {
		font-size: 10px;
		letter-spacing: 0.08em;
		opacity: 0.75;
	}
	.sound {
		width: 36px;
		justify-content: center;
		border: 1px solid var(--hair-2);
		min-height: 30px !important;
		height: 30px;
		transition: border-color 0.3s var(--ease);
	}
	.sound[aria-pressed='true'] {
		color: var(--signal);
		border-color: color-mix(in srgb, var(--signal) 50%, transparent);
	}
	:global(.day) .sound {
		border-color: rgba(22, 35, 75, 0.25);
	}
	.sound .tip {
		position: absolute;
		top: calc(100% + 10px);
		right: 0;
		white-space: nowrap;
		font-size: 10px;
		padding: 6px 8px;
		background: var(--night-2);
		border: 1px solid var(--hair-2);
		color: var(--text-2);
		opacity: 0;
		transform: translateY(-4px);
		pointer-events: none;
		transition: opacity 0.25s var(--ease), transform 0.25s var(--ease);
	}
	.sound:hover .tip,
	.sound:focus-visible .tip {
		opacity: 1;
		transform: none;
	}

	.menu-btn {
		display: none;
		justify-self: end;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		padding-left: 12px;
	}

	/* ---- mobile menu ---- */
	.menu {
		position: fixed;
		inset: 0;
		z-index: 35;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 96px var(--gutter) 32px;
		background:
			radial-gradient(rgba(255, 255, 255, 0.06) 0.8px, transparent 1.2px) 0 0 / 4px 4px,
			rgba(5, 5, 7, 0.97);
		clip-path: inset(0 0 100% 0);
		visibility: hidden;
		transition:
			clip-path 0.7s var(--ease),
			visibility 0s linear 0.7s;
	}
	.menu.open {
		clip-path: inset(0 0 0 0);
		visibility: visible;
		transition: clip-path 0.7s var(--ease);
	}
	.menu ol {
		display: grid;
	}
	.menu li {
		border-top: 1px solid var(--hair);
		opacity: 0;
		transform: translateY(12px);
		transition:
			opacity 0.5s var(--ease),
			transform 0.5s var(--ease);
	}
	.menu.open li {
		opacity: 1;
		transform: none;
		transition-delay: calc(0.12s + var(--i) * 0.04s);
	}
	.menu li:last-child {
		border-bottom: 1px solid var(--hair);
	}
	.menu li a {
		display: grid;
		grid-template-columns: 3ch 1fr auto;
		align-items: baseline;
		gap: 14px;
		padding: 13px 0;
	}
	.menu .n {
		color: var(--signal);
	}
	.menu .k {
		font-size: clamp(1.5rem, 7vw, 2.2rem);
		letter-spacing: -0.035em;
		line-height: 1.05;
	}
	.menu .tm {
		color: var(--muted);
	}
	.menu a[aria-current='true'] .k {
		color: var(--signal);
	}
	.menu-foot {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 22px;
		color: var(--dim);
	}
	.menu-foot a,
	.menu-foot button {
		min-height: 44px;
		display: inline-flex;
		align-items: center;
	}

	@media (max-width: 860px) {
		.bar {
			grid-template-columns: 1fr auto;
		}
		.clock,
		.links {
			display: none;
		}
		.menu-btn {
			display: inline-flex;
		}
	}
	@media (min-width: 861px) {
		.menu {
			display: none;
		}
	}
	@media (max-width: 1100px) and (min-width: 861px) {
		.clock .w {
			display: none;
		}
	}
</style>
