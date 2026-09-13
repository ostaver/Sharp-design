// A print that follows the pointer down the list of sessions, re-brushed for every row
// and swinging from its top edge as it is dragged along.
import gsap from 'gsap';
import { PlateMesh } from './plate.js';
import { pointer } from '../lib/pointer.js';
import { clamp, damp } from '../lib/rng.js';

export class Preview {
  constructor(stage, program, { list, textureFor }) {
    this.stage = stage;
    this.plate = new PlateMesh(stage, program, { pad: [0.1, 0.08], renderOrder: 6 });
    this.plate.u.shadow = 0.8;
    this.plate.u.opacity = 0;
    this.plate.u.seed = 8.1;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.show = 0;
    this.target = 0;
    this.row = null;

    list.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const row = e.target.closest('.session');
      if (!row || row === this.row) return;
      this.row = row;
      this.plate.u.tex = textureFor(row.dataset.specimen, Number(row.dataset.seed) || 1);
      gsap.fromTo(this.plate.u, { coat: 0 }, { coat: 1, duration: 0.8, ease: 'power2.out', overwrite: true });
      if (this.show < 0.05) {
        this.x = pointer.x + 40;
        this.y = pointer.y;
      }
      this.target = 1;
    });
    list.addEventListener('pointerleave', () => {
      this.target = 0;
      this.row = null;
    });
  }

  update(time, dt) {
    const w = clamp(this.stage.w * 0.17, 190, 290);
    const h = (w * 4) / 3;
    const px = this.x;
    const k = damp(8, dt);
    this.x += (Math.min(pointer.x + 40, this.stage.w - w - 24) - this.x) * k;
    this.y += (clamp(pointer.y - h * 0.5, 24, this.stage.h - h - 24) - this.y) * k;
    if (dt > 0) this.vx += ((this.x - px) / dt - this.vx) * damp(10, dt);
    this.show += (this.target - this.show) * damp(this.target ? 7 : 5, dt);

    const visible = this.show > 0.01;
    this.plate.mesh.visible = visible;
    if (!visible) return;
    this.plate.fit({ left: this.x, top: this.y, width: w, height: h }, 0.9 + 0.1 * this.show);
    this.plate.u.opacity = this.show;
    this.plate.u.angle = clamp(-this.vx * 0.0004, -0.3, 0.3);
    this.plate.u.flutter = Math.min(1.5, Math.abs(this.vx) / 600);
  }
}
