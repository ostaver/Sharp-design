// How far the letterbox is closed, 0 (open) to 1 (2.39:1 bars in).
// `intro` is the opening shot, tweened by the hero; `scroll` is the dive, set by the choreo.
export interface CineState {
	intro: number;
	scroll: number;
}

export const cine: CineState = {
	intro: 0,
	scroll: 0
};
