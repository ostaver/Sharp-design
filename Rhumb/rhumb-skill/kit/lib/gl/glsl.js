import common from './glsl/common.glsl?raw';

const chunks = { common };

// Resolves `#include name` lines against the shared chunks above.
export function glsl(src) {
	return src.replace(/^[ \t]*#include (\w+)[ \t]*$/gm, (_, k) => {
		if (!(k in chunks)) throw new Error(`glsl: unknown chunk "${k}"`);
		return chunks[k];
	});
}

export const fullscreenVert = /* glsl */ `#version 300 es
in vec2 position;
void main() {
	gl_Position = vec4(position, 0.0, 1.0);
}
`;

// WebGL2 support, checked on a throwaway canvas so the real one stays untouched.
let support;
export function hasWebGL2() {
	if (support !== undefined) return support;
	try {
		const c = document.createElement('canvas');
		const gl = c.getContext('webgl2');
		support = !!gl;
		gl?.getExtension('WEBGL_lose_context')?.loseContext();
	} catch {
		support = false;
	}
	return support;
}
