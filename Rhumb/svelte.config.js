import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Fully prerendered: the page is readable as plain HTML before any script runs.
		adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
		// Relative asset paths, so the build can be dropped into any folder or host.
		paths: { relative: true }
	}
};

export default config;
