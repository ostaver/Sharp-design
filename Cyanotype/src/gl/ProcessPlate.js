// The plate on the process table. Scroll drives it through the five steps:
// coat → compose → expose → wash → dry.
import { PlateMesh } from './plate.js';
import { clamp, damp, smoothstep } from '../lib/rng.js';

export class ProcessPlate {
  constructor(stage, program, { slot, texture }) {
    this.stage = stage;
    this.slot = slot;
    this.plate = new PlateMesh(stage, program, { pad: [0.1, 0.08], renderOrder: 3 });
    this.plate.u.tex = texture;
    this.plate.u.shadow = 0.7;
    this.plate.u.seed = 3.7;
    this.target = 0;
    this.value = 0;
  }

  setStage(stage) {
    this.target = stage;
  }

  update(time, dt) {
    const r = this.slot.getBoundingClientRect();
    const visible = r.width > 0 && r.bottom > -60 && r.top < this.stage.h + 60;
    this.plate.mesh.visible = visible;
    if (!visible) return;
    this.plate.fit(r);

    this.value += (this.target - this.value) * damp(5, dt);
    const s = this.value;
    const u = this.plate.u;
    u.coat = clamp(s);
    u.place = smoothstep(1, 1.8, s);
    u.expose = clamp(s - 2);
    u.glow = Math.sin(Math.PI * clamp(s - 2));
    u.lift = smoothstep(3, 3.3, s);
    u.wash = smoothstep(3.25, 4, s);
    u.ox = smoothstep(4, 4.9, s);
    u.wet = smoothstep(3.3, 3.8, s) * (1 - smoothstep(4.1, 4.9, s));
  }
}
