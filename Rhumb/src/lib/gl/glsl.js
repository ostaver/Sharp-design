import { Program } from 'ogl';
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

/**
 * OGL's Program asks for the compile and link status the moment it hands the shaders to
 * the driver, which stalls the main thread until a large shader has finished compiling
 * (up to seconds on some GPUs) and freezes everything on screen. This one only queues the
 * work; `ready` resolves once the driver has linked it, off the main thread wherever
 * KHR_parallel_shader_compile is available. Don't draw with it before then.
 */
export class AsyncProgram extends Program {
	constructor(gl, options) {
		super(gl, options);
		this.ready = whenLinked(gl, this.program).then(() => this.#introspect());
	}

	setShaders({ vertex, fragment }) {
		const gl = this.gl;
		gl.shaderSource(this.vertexShader, vertex);
		gl.compileShader(this.vertexShader);
		gl.shaderSource(this.fragmentShader, fragment);
		gl.compileShader(this.fragmentShader);
		gl.linkProgram(this.program);
	}

	// The second half of OGL's setShaders: status checks and active uniforms/attributes.
	#introspect() {
		const gl = this.gl;
		if (gl.isContextLost()) throw new Error('context lost');
		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			const logs = [gl.getShaderInfoLog(this.vertexShader), gl.getShaderInfoLog(this.fragmentShader), gl.getProgramInfoLog(this.program)];
			throw new Error(logs.filter(Boolean).join('\n'));
		}

		this.uniformLocations = new Map();
		const numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < numUniforms; i++) {
			const uniform = gl.getActiveUniform(this.program, i);
			this.uniformLocations.set(uniform, gl.getUniformLocation(this.program, uniform.name));
			const split = uniform.name.match(/(\w+)/g);
			uniform.uniformName = split[0];
			uniform.nameComponents = split.slice(1);
		}

		this.attributeLocations = new Map();
		const locations = [];
		const numAttribs = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
		for (let i = 0; i < numAttribs; i++) {
			const attribute = gl.getActiveAttrib(this.program, i);
			const location = gl.getAttribLocation(this.program, attribute.name);
			if (location === -1) continue;
			locations[location] = attribute.name;
			this.attributeLocations.set(attribute, location);
		}
		this.attributeOrder = locations.join('');
	}
}

function whenLinked(gl, program) {
	const ext = gl.getExtension('KHR_parallel_shader_compile');
	// Without the extension the link blocks wherever it happens; at least let a frame
	// (the preloader) reach the screen first.
	if (!ext) return new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
	return new Promise((resolve) => {
		const poll = () => {
			if (gl.isContextLost() || gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) resolve();
			else requestAnimationFrame(poll);
		};
		poll();
	});
}
