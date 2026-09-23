// Ship's time helpers. Minutes run past 24:00 through the night (e.g. 26:15 is 02:15).

const wrap = (min) => ((Math.floor(min) % 1440) + 1440) % 1440;

export function fmtTime(min) {
	const m = wrap(min);
	return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function watchName(min) {
	const h = Math.floor(wrap(min) / 60);
	if (h >= 20) return 'First watch';
	if (h < 4) return 'Middle watch';
	if (h < 8) return 'Morning watch';
	if (h < 12) return 'Forenoon watch';
	if (h < 16) return 'Afternoon watch';
	if (h < 18) return 'First dog watch';
	return 'Last dog watch';
}

// Bells last struck: one per half hour into the four-hour watch, eight at its end.
export function bellsAt(min) {
	const b = Math.floor((wrap(min) % 240) / 30);
	return b === 0 ? 8 : b;
}
