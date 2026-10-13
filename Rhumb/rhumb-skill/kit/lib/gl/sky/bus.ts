import type { Sky } from './Sky';

// Lets the page choreography reach the sky without prop-drilling through components.
export interface SkyBus {
	sky: Sky | null;
}

export const skyBus: SkyBus = {
	sky: null
};
