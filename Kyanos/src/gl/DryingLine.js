// Prints pegged to a line. The scroll drags the line sideways; each print is a pendulum
// hung from its peg, so it swings back against the motion and settles in the breeze.
// Plate 000 is the visitor's own print, on a sheet cut to fit it and labelled in pencil.
import { Camera, RenderTarget, Texture, Transform } from 'ogl';
import { FOOT, MARGIN, PlateMesh, printBox } from './plate.js';
import { drawNote } from '../specimens/compose.js';
import { clamp, damp } from '../lib/rng.js';
import { pointer } from '../lib/pointer.js';

const GRAVITY = 2600; // px/s², tuned for a slow, heavy swing
const DAMPING = 1.5;
const MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const two = (n) => String(n).padStart(2, '0');

// How much of the sheet took the light, as the printer would write it.
const SHARE = [
  [0.97, 'the whole sheet'],
  [0.85, 'nearly all the sheet'],
  [0.7, 'three-quarters of the sheet'],
  [0.58, 'two-thirds of the sheet'],
  [0.42, 'half the sheet'],
  [0.29, 'a third of the sheet'],
  [0.18, 'a quarter of the sheet'],
  [0.05, 'a little of the sheet'],
  [0, 'hardly any of the sheet'],
];

export class DryingLine {
  constructor(stage, program, { section, medias, textureFor, photogram, reduced = false }) {
    this.stage = stage;
    this.program = program;
    this.section = section;
    this.photogram = photogram;
    this.reduced = reduced;
    this.hand = { x: null, vx: 0 };
    this.items = medias.map((el, i) => {
      const type = el.dataset.specimen;
      const yours = type === 'yours';
      const plate = new PlateMesh(stage, program, { pad: [0.12, 0.08], renderOrder: 4 });
      plate.u.mode = yours ? 1 : 0;
      plate.u.tex = yours ? null : textureFor(type, Number(el.dataset.seed) || 1);
      plate.u.wet = Number(el.dataset.wet) || 0;
      plate.u.shadow = 1;
      plate.u.seed = i * 1.37;
      const figure = el.closest('figure');
      const meta = yours ? figure?.querySelector('.plate__meta') : null;
      const item = { el, plate, yours, seed: i * 1.37, angle: 0, spin: 0, x: null, v: 0, meta, label: '', lines: null, note: null };
      if (yours) figure?.querySelector('[data-keep]')?.addEventListener('click', (e) => this.keep(item, e.currentTarget));
      return item;
    });
  }

  update(time, dt) {
    const sr = this.section.getBoundingClientRect();
    const near = sr.bottom > -this.stage.h * 0.5 && sr.top < this.stage.h * 1.5;
    if (near && this.photogram?.dirtyBake) this.photogram.bake();
    const yours = this.photogram?.baked?.texture;

    // A mouse brushed across a print pushes it round its peg, harder the lower it catches.
    const hand = this.hand;
    const brushing = !this.reduced && near && pointer.active && pointer.type === 'mouse';
    if (brushing && hand.x !== null && dt > 0) hand.vx += ((pointer.x - hand.x) / dt - hand.vx) * damp(20, dt);
    else hand.vx = 0;
    hand.x = brushing ? pointer.x : null;

    for (const it of this.items) {
      const r = it.el.getBoundingClientRect();
      const visible = near && r.width > 0 && r.right > -80 && r.left < this.stage.w + 80 && r.bottom > -80 && r.top < this.stage.h + 80;
      it.plate.mesh.visible = visible && (!it.yours || !!yours);
      if (!visible) {
        it.x = null;
        continue;
      }
      it.plate.fit(r);
      if (it.yours) {
        it.plate.u.tex = yours;
        it.plate.u.print = printBox(r.width / r.height, this.photogram.width / this.photogram.height);
        this.pencil(it, r);
      }
      if (this.reduced) continue; // prints hang still

      // Horizontal acceleration of the peg, smoothed so scroll jitter doesn't read as wind.
      const x = r.left + r.width / 2;
      let accel = 0;
      if (it.x !== null && dt > 0) {
        const v = it.v + ((x - it.x) / dt - it.v) * damp(14, dt);
        accel = (v - it.v) / dt;
        it.v = v;
      }
      it.x = x;

      const length = r.height * 0.62;
      const breeze = (Math.sin(time * 0.8 + it.seed * 3.1) * 0.6 + Math.sin(time * 2.1 + it.seed * 7.7) * 0.4) * 0.5;
      const over = pointer.x > r.left && pointer.x < r.right && pointer.y > r.top && pointer.y < r.bottom;
      const push = over ? (clamp(hand.vx, -2500, 2500) / length) * ((pointer.y - r.top) / r.height) * 0.8 : 0;
      const alpha =
        -(GRAVITY / length) * Math.sin(it.angle) -
        (clamp(accel, -9000, 9000) / length) * Math.cos(it.angle) -
        DAMPING * it.spin +
        breeze +
        push;
      it.spin += alpha * dt;
      it.angle = clamp(it.angle + it.spin * dt, -0.45, 0.45);

      it.plate.u.angle = it.angle;
      it.plate.u.bend = clamp(-it.spin * 0.03, -0.12, 0.12);
      it.plate.u.flutter = 0.5 + Math.min(1.2, Math.abs(it.v) / 800);
    }
  }

  // What the printer pencils under plate 000: its time in the sun, how much of the sheet took,
  // and the day. The caption beside it gets the same time in the line's own notation.
  pencil(it, r) {
    const secs = Math.round(this.photogram.lit);
    const share = SHARE.find(([at]) => this.photogram.coverage >= at)[1];
    const key = `${Math.round(r.width)}x${Math.round(r.height)} ${secs} ${share}`;
    if (key === it.label) return;

    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const now = new Date();
    const sun = secs < 1 ? 'left to the sun' : `${m ? `${m}′ ${two(s)}` : s}″ of sun, ${share}`;
    const day = `Hydra, ${now.getDate()} ${now.toLocaleString('en-GB', { month: 'long' })}`;
    it.lines = [sun, day];
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = drawNote(r.width, r.height, it.lines, { foot: FOOT * r.height, margin: MARGIN * r.height }, scale);
    if (!canvas) return; // the hand hasn't loaded yet; try again next frame
    it.label = key;

    const gl = this.stage.gl;
    if (it.note) {
      it.note.image = canvas;
      it.note.needsUpdate = true;
    } else {
      it.note = new Texture(gl, { image: canvas, generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR });
    }
    it.plate.u.note = it.note;
    if (it.meta && secs >= 1) it.meta.textContent = `${m}′ ${two(s)}″ · ${two(now.getDate())}·${MONTHS[now.getMonth()]}·${now.getFullYear()}`;
  }

  // Take plate 000 off the line: the whole sheet, deckle, print and pencil, rendered flat
  // and large into a PNG to keep.
  async keep(it, button) {
    const { stage, photogram } = this;
    if (!photogram?.baked || !it.lines || button.disabled) return;
    const gl = stage.gl;
    const renderer = stage.renderer;
    button.disabled = true;
    it.spin += 2.2; // a tug at the peg
    try {
      const r = it.el.getBoundingClientRect();
      const edge = 18; // bare margin round the deckle, px
      const scale = Math.min(6, 2000 / r.width, gl.getParameter(gl.MAX_TEXTURE_SIZE) / (r.width + 2 * edge));
      const [x0, , x1] = it.plate.u.print;
      const printW = Math.round((x1 - x0) * r.width * scale);
      const print = photogram.draw(
        new RenderTarget(gl, { width: printW, height: Math.round(printW / (photogram.width / photogram.height)), depth: false, minFilter: gl.LINEAR }),
      );
      const pencil = drawNote(r.width, r.height, it.lines, { foot: FOOT * r.height, margin: MARGIN * r.height }, scale);
      const note = new Texture(gl, { image: pencil ?? undefined, generateMipmaps: false, minFilter: gl.LINEAR });

      this.rig ??= this.exportRig();
      const { plate, scene, camera } = this.rig;
      plate.pad = [edge / r.width, edge / r.height];
      plate.fit({ left: 0, top: 0, width: r.width, height: r.height });
      plate.mesh.position.set(0, 0, 0);
      Object.assign(plate.u, it.plate.u, { tex: print.texture, note, shadow: 0, wet: 0, angle: 0, bend: 0, flutter: 0, opacity: 1 });
      const [qw, qh] = plate.quad;
      camera.orthographic({ left: -qw / 2, right: qw / 2, top: qh / 2, bottom: -qh / 2 });
      const target = new RenderTarget(gl, { width: Math.round(qw * scale), height: Math.round(qh * scale), depth: false });

      // Straight alpha onto a clear target, so the deckle stands on transparency.
      const blend = this.program.blendFunc;
      const clear = gl.getParameter(gl.COLOR_CLEAR_VALUE);
      this.program.blendFunc = {};
      gl.clearColor(0, 0, 0, 0);
      renderer.render({ scene, camera, target, frustumCull: false });
      gl.clearColor(...clear);
      this.program.blendFunc = blend;

      // Read back through a pixel buffer and a fence, so the page never waits on the GPU.
      const { width: w, height: h } = target;
      const pixels = new Uint8Array(w * h * 4);
      const pack = gl.createBuffer();
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pack);
      gl.bufferData(gl.PIXEL_PACK_BUFFER, pixels.byteLength, gl.STREAM_READ);
      renderer.bindFramebuffer(target);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, 0);
      renderer.bindFramebuffer();
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      photogram.dispose(target);
      photogram.dispose(print);
      gl.deleteTexture(note.texture);
      const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      while (gl.clientWaitSync(fence, 0, 0) === gl.TIMEOUT_EXPIRED) await new Promise(requestAnimationFrame);
      gl.deleteSync(fence);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pack);
      gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, pixels);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      gl.deleteBuffer(pack);

      // GL rows run bottom-up.
      const image = new ImageData(w, h);
      const row = w * 4;
      for (let y = 0; y < h; y++) image.data.set(pixels.subarray((h - 1 - y) * row, (h - y) * row), y * row);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').putImageData(image, 0, 0);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

      const now = new Date();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `kyanos-plate-000-${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    } finally {
      button.disabled = false;
    }
  }

  // An off-screen sheet and camera for keep(), outside the page's scene.
  exportRig() {
    const scene = new Transform();
    const plate = new PlateMesh(this.stage, this.program, { pad: [0, 0] });
    plate.mesh.setParent(scene);
    plate.mesh.visible = true;
    const camera = new Camera(this.stage.gl, { near: 0.1, far: 10 });
    camera.position.z = 1;
    return { plate, scene, camera };
  }
}
