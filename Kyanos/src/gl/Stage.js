// One fixed canvas behind the page. Every WebGL layer is a mesh in this scene, drawn with
// an orthographic camera measured in CSS pixels so meshes can sit exactly on DOM rects.
import { Renderer, Camera, Transform, Program, Mesh, Triangle, RenderTarget } from 'ogl';
import { fullscreenVert, noiseFrag } from './glsl.js';

export class Stage {
  constructor(canvas) {
    this.renderer = new Renderer({
      canvas,
      dpr: Math.min(window.devicePixelRatio || 1, 1.75),
      alpha: false,
      depth: false,
      antialias: false,
      powerPreference: 'high-performance',
    });
    if (!this.renderer.isWebgl2) throw new Error('WebGL2 is required');

    const gl = (this.gl = this.renderer.gl);
    gl.clearColor(0.071, 0.184, 0.471, 1);

    this.camera = new Camera(gl, { left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10 });
    this.camera.position.z = 1;
    this.scene = new Transform();
    this.triangle = new Triangle(gl);
    this.layers = [];
    this.float = this.detectFloatTargets();
    this.noise = this.bakeNoise();
    this.lost = false;

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.lost = true;
      this.onLost?.();
    });

    this.resize();
  }

  // Half-float targets keep the exposure accumulation smooth; fall back to 8-bit.
  detectFloatTargets() {
    const gl = this.gl;
    const ext = this.renderer.getExtension('EXT_color_buffer_float') || this.renderer.getExtension('EXT_color_buffer_half_float');
    if (!ext) return null;
    const rt = new RenderTarget(gl, {
      width: 4,
      height: 4,
      depth: false,
      type: gl.HALF_FLOAT,
      format: gl.RGBA,
      internalFormat: gl.RGBA16F,
    });
    this.renderer.bindFramebuffer(rt);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    this.renderer.bindFramebuffer();
    gl.deleteFramebuffer(rt.buffer);
    gl.deleteTexture(rt.texture.texture);
    return ok ? { type: gl.HALF_FLOAT, internalFormat: gl.RGBA16F } : null;
  }

  bakeNoise() {
    const gl = this.gl;
    const target = new RenderTarget(gl, { width: 512, height: 512, depth: false, wrapS: gl.REPEAT, wrapT: gl.REPEAT });
    const program = new Program(gl, {
      vertex: fullscreenVert,
      fragment: noiseFrag,
      cullFace: false,
      depthTest: false,
      depthWrite: false,
    });
    this.renderer.render({ scene: new Mesh(gl, { geometry: this.triangle, program }), target });
    program.remove();
    return target.texture;
  }

  add(layer) {
    this.layers.push(layer);
    return layer;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.w = w;
    this.h = h;
    this.renderer.setSize(w, h);
    this.camera.orthographic({ left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
    for (const layer of this.layers) layer.resize?.(w, h);
  }

  // Centre a mesh on a DOM rect (CSS pixels, y down) and scale it to (sx, sy).
  place(mesh, rect, sx = rect.width, sy = rect.height) {
    mesh.position.set(rect.left + rect.width / 2 - this.w / 2, this.h / 2 - rect.top - rect.height / 2, 0);
    mesh.scale.set(sx, sy, 1);
  }

  render(time, dt) {
    if (this.lost) return;
    for (const layer of this.layers) layer.update(time, dt);
    this.renderer.render({ scene: this.scene, camera: this.camera, frustumCull: false });
  }
}
