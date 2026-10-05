<script>
	import { onMount } from 'svelte';
	import SkyCanvas from '$lib/components/SkyCanvas.svelte';
	import Preloader from '$lib/components/Preloader.svelte';
	import Cinema from '$lib/components/Cinema.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Handoff from '$lib/components/Handoff.svelte';
	import Instruments from '$lib/components/Instruments.svelte';
	import Bearing from '$lib/components/Bearing.svelte';
	import Night from '$lib/components/Night.svelte';
	import Signals from '$lib/components/Signals.svelte';
	import Charter from '$lib/components/Charter.svelte';
	import Landfall from '$lib/components/Landfall.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { site } from '$lib/content.js';
	import { ui } from '$lib/state.svelte.js';
	import { gsap, ScrollTrigger } from '$lib/motion/gsap.js';
	import { startScroll, stopScroll, scrollTo } from '$lib/motion/scroll.js';
	import { createChoreo } from '$lib/motion/choreo.js';
	import { revealOnFocus } from '$lib/motion/focus.js';

	// Decided before any child mounts, so every section reads the same answer.
	if (typeof window !== 'undefined') {
		ui.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	onMount(() => {
		if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
		startScroll({ reduced: ui.reduced });
		const stopFocus = revealOnFocus();
		const choreo = createChoreo();
		const tick = () => choreo.update();
		gsap.ticker.add(tick);

		let refreshT;
		const refresh = () => {
			clearTimeout(refreshT);
			refreshT = setTimeout(() => ScrollTrigger.refresh(), 60);
		};
		document.fonts?.ready.then(refresh);
		document.fonts?.addEventListener?.('loadingdone', refresh);
		window.addEventListener('load', refresh);

		// Deep links: land on the section once layout has settled.
		const hash = location.hash.slice(1);
		if (hash && document.getElementById(hash)) {
			setTimeout(() => scrollTo(`#${hash}`, { immediate: true }), 120);
		}

		return () => {
			stopFocus();
			gsap.ticker.remove(tick);
			document.fonts?.removeEventListener?.('loadingdone', refresh);
			window.removeEventListener('load', refresh);
			choreo.destroy();
			stopScroll();
		};
	});

	$effect(() => {
		const html = document.documentElement;
		html.classList.toggle('day', ui.day);
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', ui.day ? '#ede5d1' : '#050507');
	});
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={site.title} />
	<meta property="og:description" content={site.description} />
	<meta property="og:image" content="og.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<a class="skiplink" href="#main">Skip to content</a>
<div id="lvh-probe" aria-hidden="true"></div>

<SkyCanvas />
<Preloader />
<Cinema />
<Nav />
<Rail />

<main id="main" tabindex="-1">
	<Hero />
	<Handoff />
	<Instruments />
	<Bearing />
	<Night />
	<Signals />
	<Charter />
	<Landfall />
</main>

<Footer />
