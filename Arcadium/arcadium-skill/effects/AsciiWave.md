# Main effect (required) — WebGL ASCII ring wave

**Write to:** `src/effects/AsciiWave.tsx`
**Rule:** copy the code block below into that file **exactly as written** — no edits, no reformatting, no "improvements". Do not rewrite it from memory.

A Three.js full-screen quad whose fragment shader tiles the canvas into cells and picks one of 11 hand-drawn 4×6 bitmap glyphs per cell from an expanding sine ring wave. The pointer swells and whites out the glyphs nearby. Exposes `setPower(0..1)` (the `uPower` uniform) so the coin timeline can bring the field up from dark. Includes DPR capping, silent init failure, `ResizeObserver` sizing, WebGL context-loss/restore handling, and full disposal.

````tsx
// Ascii Wave — Originkit (ported from Arcadium/Effect.md)

import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const CURSOR_FOLLOW = 8.5;

const GLYPH_ART = [
  ["....", "....", "....", "....", "....", "...."],
  ["....", "....", "....", "....", ".#..", "...."],
  ["....", "....", ".#..", "....", ".#..", "...."],
  ["....", "....", ".##.", "....", "....", "...."],
  ["....", "....", ".#..", "###.", ".#..", "...."],
  ["....", "....", ".##.", "#..#", ".##.", "...."],
  ["....", "#..#", ".##.", ".##.", "#..#", "...."],
  ["....", "#.#.", ".##.", ".##.", "#.#.", "...."],
  [".##.", "#..#", "#..#", "#..#", "#..#", ".##."],
  [".#.#", "####", ".#.#", "####", ".#.#", "...."],
  ["####", "####", "####", "####", "####", "####"],
];

const GLYPHS = GLYPH_ART.map((rows) =>
  rows.reduce(
    (bits, row, y) =>
      bits +
      Array.from(row).reduce(
        (acc, ch, x) => acc + (ch === "#" ? Math.pow(2, x + 4 * y) : 0),
        0
      ),
    0
  )
);

const DEFAULTS = {
  ink: "#00FFF8",
  lit: "#FFFFFF",
  cell: 25,
  rings: 20,
  speed: 8,
  swell: 4,
  warp: 20,
  radius: 163,
  weight: 1,
};

type Config = {
  ink: string;
  lit: string;
  cell: number;
  rings: number;
  speed: number;
  swell: number;
  warp: number;
  radius: number;
  weight: number;
};

function clamp(v: number, lo: number, hi: number, fallback: number): number {
  const n = typeof v === "number" && isFinite(v) ? v : fallback;
  return Math.max(lo, Math.min(hi, n));
}

function settingsFor(cfg: Config) {
  return {
    cell: clamp(cfg.cell, 8, 60, DEFAULTS.cell),
    freq: 0.004 + clamp(cfg.rings, 1, 20, DEFAULTS.rings) * 0.0022,
    speed: clamp(cfg.speed, 0, 20, DEFAULTS.speed) * 0.42,
    swell: clamp(cfg.swell, 0, 20, DEFAULTS.swell) * 0.055,
    warp: clamp(cfg.warp, 0, 20, DEFAULTS.warp) * 0.31,
    reach: clamp(cfg.radius, 40, 400, DEFAULTS.radius),
    gamma: 2.2 - clamp(cfg.weight, 1, 20, DEFAULTS.weight) * 0.08,
  };
}

const QUAD_VERTEX = `
    varying vec2 vUv;
    void main() {
        vUv = uv;

        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`;

const WAVE_FRAGMENT = `
    precision highp float;

    #define GLYPH_COUNT ${GLYPHS.length}

    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uHold;
    uniform float uTime;
    uniform vec3 uInk;
    uniform vec3 uLit;
    uniform float uCell;
    uniform float uFreq;
    uniform float uSwell;
    uniform float uWarp;
    uniform float uReach;
    uniform float uGamma;
    uniform float uPower;
    uniform float uGlyphs[GLYPH_COUNT];

    varying vec2 vUv;

    float glyphAt(int idx, vec2 g) {
        float bits = 0.0;

        for (int i = 0; i < GLYPH_COUNT; i++) {
            if (i == idx) bits = uGlyphs[i];
        }
        float x = min(floor(g.x * 4.0), 3.0);
        float y = min(floor((1.0 - g.y) * 6.0), 5.0);
        return mod(floor(bits / exp2(x + 4.0 * y)), 2.0);
    }

    void main() {
        vec2 p = vUv * uResolution;
        vec2 cell = floor(p / uCell);
        vec2 mid = (cell + 0.5) * uCell;

        float radius = length(mid - uResolution * 0.5);
        float near = 1.0 - smoothstep(0.0, uReach, length(mid - uPointer));
        near = near * near * uHold;

        float wave = sin(radius * uFreq - uTime + near * uWarp) * 0.5 + 0.5;
        float level = pow(clamp(wave, 0.0, 1.0), uGamma) + near * uSwell * 3.0;
        level = clamp(level, 0.0, 1.0) * uPower;

        int idx = int(min(floor(level * float(GLYPH_COUNT)), float(GLYPH_COUNT - 1)));
        float mask = glyphAt(idx, fract(p / uCell));
        if (mask < 0.5 || level < 0.02) discard;

        vec3 col = mix(uInk, uLit, near);

        float a = (0.35 + 0.65 * level) * uPower;

        gl_FragColor = vec4(col * a, a);
    }
`;

class WaveScene {
  private container: HTMLElement;
  private cfg: Config;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private geometry = new THREE.PlaneGeometry(2, 2);
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;

  private target = new THREE.Vector2(-1e4, -1e4);
  private eased = new THREE.Vector2(-1e4, -1e4);
  private hold = 0;
  private wantHold = 0;
  private time = 0;

  private width = 1;
  private height = 1;
  private frameId = 0;
  private lastT = 0;
  private disposed = false;

  constructor(container: HTMLElement, cfg: Config) {
    this.container = container;
    this.cfg = cfg;
    const S = settingsFor(cfg);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);
    const el = this.renderer.domElement;
    el.style.position = "absolute";
    el.style.inset = "0";
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.touchAction = "none";
    container.appendChild(el);

    this.material = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: WAVE_FRAGMENT,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: new THREE.Vector2(-1e4, -1e4) },
        uHold: { value: 0 },
        uTime: { value: 0 },
        uInk: { value: new THREE.Color(cfg.ink) },
        uLit: { value: new THREE.Color(cfg.lit) },
        uCell: { value: S.cell },
        uFreq: { value: S.freq },
        uSwell: { value: S.swell },
        uWarp: { value: S.warp },
        uReach: { value: S.reach },
        uGamma: { value: S.gamma },
        uPower: { value: 0 },
        uGlyphs: { value: GLYPHS },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    el.addEventListener("pointermove", this.onPointerMove);
    el.addEventListener("pointerdown", this.onPointerMove);
    el.addEventListener("pointerleave", this.onPointerLeave);
    el.addEventListener("pointercancel", this.onPointerLeave);
    el.addEventListener("webglcontextlost", this.onContextLost, false);
    el.addEventListener("webglcontextrestored", this.onContextRestored, false);
  }

  // the tube can drop out (GPU reset, tab eviction) — stop drawing, wait, relight
  private onContextLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  };

  private onContextRestored = () => {
    if (this.disposed) return;
    this.material.needsUpdate = true;
    this.start();
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = ((e.clientX - rect.left) / rect.width) * this.width;
    const y = (1 - (e.clientY - rect.top) / rect.height) * this.height;
    this.target.set(x, y);
    if (this.wantHold === 0) this.eased.copy(this.target);
    this.wantHold = 1;
  };

  private onPointerLeave = () => {
    this.wantHold = 0;
  };

  start() {
    this.lastT = performance.now();
    const loop = () => {
      this.frameId = requestAnimationFrame(loop);
      this.step();
    };
    loop();
  }

  setSize(width: number, height: number) {
    if (this.disposed || width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false);
    const dpr = this.renderer.getPixelRatio();
    this.width = width * dpr;
    this.height = height * dpr;
    this.material.uniforms.uResolution.value.set(this.width, this.height);
  }

  updateConfig(cfg: Config) {
    if (this.disposed) return;
    this.cfg = cfg;
    const u = this.material.uniforms;
    u.uInk.value.set(cfg.ink || DEFAULTS.ink);
    u.uLit.value.set(cfg.lit || DEFAULTS.lit);
  }

  setPower(p: number) {
    if (this.disposed) return;
    this.material.uniforms.uPower.value = p;
  }

  private step() {
    if (this.disposed) return;
    const now = performance.now();
    let dt = (now - this.lastT) / 1000;
    this.lastT = now;
    if (!isFinite(dt) || dt < 0) dt = 0;

    if (dt > 0.05) dt = 0.05;

    const S = settingsFor(this.cfg);
    this.time += dt * S.speed;
    this.eased.lerp(this.target, 1 - Math.exp(-dt * CURSOR_FOLLOW));
    this.hold += (this.wantHold - this.hold) * (1 - Math.exp(-dt * 5));

    const dpr = this.renderer.getPixelRatio();
    const u = this.material.uniforms;
    u.uTime.value = this.time;
    u.uPointer.value.copy(this.eased);
    u.uHold.value = this.hold;
    u.uCell.value = S.cell * dpr;

    u.uFreq.value = S.freq / dpr;
    u.uSwell.value = S.swell;
    u.uWarp.value = S.warp;
    u.uReach.value = S.reach * dpr;
    u.uGamma.value = S.gamma;

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    const el = this.renderer.domElement;
    el.removeEventListener("pointermove", this.onPointerMove);
    el.removeEventListener("pointerdown", this.onPointerMove);
    el.removeEventListener("pointerleave", this.onPointerLeave);
    el.removeEventListener("pointercancel", this.onPointerLeave);
    el.removeEventListener("webglcontextlost", this.onContextLost, false);
    el.removeEventListener("webglcontextrestored", this.onContextRestored, false);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    if (el.parentNode === this.container) this.container.removeChild(el);
  }
}

export interface AsciiWaveProps {
  ink?: string;
  lit?: string;
  cell?: number;
  rings?: number;
  speed?: number;
  swell?: number;
  warp?: number;
  radius?: number;
  weight?: number;
  style?: React.CSSProperties;
}

export interface AsciiWaveHandle {
  setPower: (p: number) => void;
}

const AsciiWave = React.forwardRef<AsciiWaveHandle, AsciiWaveProps>(function AsciiWave(props, ref) {
  const {
    ink = DEFAULTS.ink,
    lit = DEFAULTS.lit,
    cell = DEFAULTS.cell,
    rings = DEFAULTS.rings,
    speed = DEFAULTS.speed,
    swell = DEFAULTS.swell,
    warp = DEFAULTS.warp,
    radius = DEFAULTS.radius,
    weight = DEFAULTS.weight,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<WaveScene | null>(null);

  const cfgRef = useRef<Config>(null as any);
  cfgRef.current = { ink, lit, cell, rings, speed, swell, warp, radius, weight };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let scene: WaveScene;
    try {
      scene = new WaveScene(container, cfgRef.current);
    } catch {
      return;
    }
    sceneRef.current = scene;
    scene.setSize(container.clientWidth, container.clientHeight);
    scene.start();

    const ro = new ResizeObserver(() => {
      scene.setSize(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);
    return () => {
      ro.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateConfig(cfgRef.current);
  }, [ink, lit, cell, rings, speed, swell, warp, radius, weight]);

  React.useImperativeHandle(ref, () => ({
    setPower: (p: number) => sceneRef.current?.setPower(p),
  }));

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="A ring wave crossing a sheet of typed characters"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 120,
        minHeight: 120,
        overflow: "hidden",
        ...style,
      }}
    />
  );
});

export default AsciiWave;
````
