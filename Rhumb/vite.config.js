import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// gsap ships ES modules without "type": "module"; let Vite transform it for SSR.
	ssr: { noExternal: ['gsap'] },
	build: {
		target: 'es2022',
		// The two shader modules are the bulk of the bundle; keep them in their own chunk.
		chunkSizeWarningLimit: 700
	}
});
