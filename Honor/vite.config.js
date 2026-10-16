import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PARTIALS = resolve(import.meta.dirname, 'src/partials');

/**
 * Tiny HTML include plugin.
 *   <include src="components/button" variant="fill" label="Go"></include>
 * pulls src/partials/<src>.html and replaces {{key}} with the given attributes.
 * Partials may include other partials.
 */
function htmlIncludes() {
  const tag = /<include\s+([^>]*?)(?:\/>|>\s*<\/include\s*>)/g;
  const attrs = /([\w-]+)="([^"]*)"/g;
  const render = (html) =>
    html.replace(tag, (_, raw) => {
      const props = Object.fromEntries([...raw.matchAll(attrs)].map((m) => [m[1], m[2]]));
      const body = readFileSync(resolve(PARTIALS, props.src + '.html'), 'utf8').replace(
        /\{\{\s*([\w-]+)\s*\}\}/g,
        (__, k) => props[k] ?? '',
      );
      return render(body);
    });
  return {
    name: 'html-includes',
    handleHotUpdate({ file, server }) {
      if (file.startsWith(PARTIALS)) server.ws.send({ type: 'full-reload' });
    },
    transformIndexHtml: { order: 'pre', handler: render },
  };
}

export default defineConfig({
  plugins: [htmlIncludes()],
  server: { port: 3000, open: false },
});
