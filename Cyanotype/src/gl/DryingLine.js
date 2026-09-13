// Prints pegged to a line. The scroll drags the line sideways; each print is a pendulum
// hung from its peg, so it swings back against the motion and settles in the breeze.
import { PlateMesh } from './plate.js';
import { clamp, damp } from '../lib/rng.js';

const GRAVITY = 2600; // px/s², tuned for a slow, heavy swing
const DAMPING = 1.5;

export class DryingLine {
  constructor(stage, program, { section, medias, textureFor, photogram, reduced = false }) {
    this.stage = stage;
    this.section = section;
    this.photogram = photogram;
    this.reduced = reduced;
    this.items = medias.map((el, i) => {
      const type = el.dataset.specimen;
      const yours = type === 'yours';
      const plate = new PlateMesh(stage, program, { pad: [0.12, 0.08], renderOrder: 4 });
      plate.u.mode = yours ? 1 : 0;
      plate.u.tex = yours ? null : textureFor(type, Number(el.dataset.seed) || 1);
      plate.u.wet = Number(el.dataset.wet) || 0;
      plate.u.shadow = 1;
      plate.u.seed = i * 1.37;
      return { el, plate, yours, seed: i * 1.37, angle: 0, spin: 0, x: null, v: 0 };
    });
  }

  update(time, dt) {
    const sr = this.section.getBoundingClientRect();
    const near = sr.bottom > -this.stage.h * 0.5 && sr.top < this.stage.h * 1.5;
    if (near && this.photogram?.dirtyBake) this.photogram.bake();
    const yours = this.photogram?.baked?.texture;

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
        it.plate.u.imgAspect = this.photogram.width / this.photogram.height;
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
      const alpha =
        -(GRAVITY / length) * Math.sin(it.angle) -
        (clamp(accel, -9000, 9000) / length) * Math.cos(it.angle) -
        DAMPING * it.spin +
        breeze;
      it.spin += alpha * dt;
      it.angle = clamp(it.angle + it.spin * dt, -0.45, 0.45);

      it.plate.u.angle = it.angle;
      it.plate.u.bend = clamp(-it.spin * 0.03, -0.12, 0.12);
      it.plate.u.flutter = 0.5 + Math.min(1.2, Math.abs(it.v) / 800);
    }
  }
}
