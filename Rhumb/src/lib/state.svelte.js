// Page-wide UI state, shared between components (Svelte 5 runes).
export const ui = $state({
	ready: false, // preloader has handed over; intro timelines may play
	section: 0, // index into `sections`
	clock: 20 * 60, // ship's time in minutes; runs past 24:00 through the night
	sound: false,
	day: false, // landfall: the page has turned to paper
	scrolled: false, // past the very top: the nav gets its backing
	foot: false, // the engraved footer fills the view: chrome steps aside
	menu: false,
	gl: true,
	reduced: false
});
