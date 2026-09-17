import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { riso, hash } from './riso.glsl.js';

/*
  The hero monument. A procedural Doric peristyle (8 × 17 fluted columns with entasis),
  lit in grey-scale and never shown directly: every frame is re-printed by a riso post-pass
  that maps luminance onto five lavender inks with stochastic stipple, adds a misregistered
  highlight ink and streaks light through the fog. The far end of the temple erodes into
  wind-blown grain as you scroll.
*/

const COL_H = 10.4;
const COL_R = 0.86;
const FLUTES = 20;

const ease = (t) => t * t * (3 - 2 * t);

function fluteShaft() {
  const radial = FLUTES * 6;
  const rows = 18;
  const pos = [];
  const uv = [];
  const idx = [];
  for (let j = 0; j <= rows; j++) {
    const v = j / rows;
    const y = v * COL_H;
    // entasis: a gentle belly and a 22% taper toward the capital
    const r = COL_R * (1 - 0.2 * v + 0.035 * Math.sin(Math.PI * v));
    for (let i = 0; i <= radial; i++) {
      const u = i / radial;
      const th = u * Math.PI * 2;
      const s = (u * FLUTES) % 1;
      const groove = 0.065 * Math.sqrt(Math.max(0, 1 - (2 * s - 1) ** 2));
      const rr = r * (1 - groove);
      pos.push(Math.cos(th) * rr, y, Math.sin(th) * rr);
      uv.push(u, v);
    }
  }
  const w = radial + 1;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < radial; i++) {
      const a = j * w + i;
      const b = a + w;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function columnGeometry() {
  const shaft = fluteShaft();
  const rTop = COL_R * (1 - 0.2 + 0.0);
  const echinus = new THREE.LatheGeometry(
    [
      new THREE.Vector2(rTop * 0.94, 0),
      new THREE.Vector2(rTop * 1.02, 0.12),
      new THREE.Vector2(rTop * 1.25, 0.34),
      new THREE.Vector2(COL_R * 1.32, 0.52),
      new THREE.Vector2(0.0001, 0.52),
    ],
    48,
  );
  echinus.translate(0, COL_H, 0);
  const abacus = new THREE.BoxGeometry(COL_R * 2.9, 0.36, COL_R * 2.9);
  abacus.translate(0, COL_H + 0.52 + 0.18, 0);
  const necking = new THREE.TorusGeometry(rTop * 0.97, 0.035, 6, 48);
  necking.rotateX(Math.PI / 2);
  necking.translate(0, COL_H - 0.35, 0);
  const merged = mergeGeometries([shaft, echinus.toNonIndexed(), abacus.toNonIndexed(), necking.toNonIndexed()].map((g) => (g.index ? g.toNonIndexed() : g)));
  return merged;
}

// Patches a material so fragments beyond the dissolve front are discarded and the eroding
// rim glows like sun-lit grit. Works for instanced meshes and for the shadow depth pass.
function patchDissolve(material, uniforms, glow = true) {
  material.customProgramCacheKey = () => `stoa-dissolve-${glow}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFront = uniforms.uFront;
    shader.uniforms.uWind = uniforms.uWind;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vStoaWorld;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vec4 stoaWP = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          stoaWP = instanceMatrix * stoaWP;
        #endif
        vStoaWorld = (modelMatrix * stoaWP).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vStoaWorld;
        uniform float uFront;
        uniform vec3 uWind;
        ${hash}`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
        float stoaN = fbm(vStoaWorld.xz * 0.28 + vStoaWorld.y * 0.21) + 0.35 * vnoise(vStoaWorld.xy * 3.1 + vStoaWorld.z);
        float stoaK = dot(vStoaWorld, uWind) - uFront + (stoaN - 0.55) * 7.0;
        if (stoaK > 0.0) discard;`,
      );
    if (glow) {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(1.6) * smoothstep(-0.9, 0.0, stoaK);`,
      );
    }
  };
}

export class TempleScene {
  constructor(canvas, { lite = false } = {}) {
    this.canvas = canvas;
    this.lite = lite;
    this.progress = 0;
    this.pointer = new THREE.Vector2();
    this.pointerEased = new THREE.Vector2();
    this.timer = new THREE.Timer();
    this.running = false;
    this.visible = true;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.25 : 1.75));
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(new THREE.Color(0.36, 0.36, 0.36), 0.0105);
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.5, 900);

    this.shared = {
      uFront: { value: 12 },
      uWind: { value: new THREE.Vector3(0.42, 0.12, -1).normalize() },
      uTime: { value: 0 },
    };

    this.skyGlow = { value: new THREE.Vector3(0.55, 0.3, -0.78).normalize() };
    this.sunFrom = new THREE.Vector3(-26, 34, 30);
    this.sunTo = new THREE.Vector3(-14, 22, -46);
    this.glowFrom = new THREE.Vector3(0.55, 0.3, -0.78).normalize();
    this.glowTo = new THREE.Vector3(-0.18, 0.2, -1).normalize();
    this.buildSky();
    this.buildLights();
    this.buildGround();
    this.buildTemple();
    this.buildFigure();
    this.buildDust();
    this.buildPost();
    this.buildCameraPath();

    this.resize();
    this._tick = this.tick.bind(this);
  }

  /* ───────── scene ───────── */

  buildSky() {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(600, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uGlow: this.skyGlow },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uGlow;
          varying vec3 vDir;
          void main() {
            float h = clamp(vDir.y, 0.0, 1.0);
            float base = mix(0.34, 0.14, pow(h, 0.6));
            float g = max(dot(vDir, uGlow), 0.0);
            base += pow(g, 9.0) * 0.2 + pow(g, 70.0) * 0.32;
            gl_FragColor = vec4(vec3(base), 1.0);
          }`,
      }),
    );
    this.scene.add(sky);
  }

  buildLights() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.22);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 4.2);
    sun.position.set(-26, 34, 30);
    sun.castShadow = true;
    const s = sun.shadow;
    s.mapSize.set(this.lite ? 1024 : 2048, this.lite ? 1024 : 2048);
    s.camera.left = -26;
    s.camera.right = 26;
    s.camera.top = 26;
    s.camera.bottom = -26;
    s.camera.near = 1;
    s.camera.far = 120;
    s.bias = -0.0004;
    s.normalBias = 0.03;
    this.scene.add(sun);
    this.sun = sun;
  }

  buildGround() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 1 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900, 1, 1), mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // soft barrows in the fog, like the hills of an old engraving
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, roughness: 1 });
    const hills = [
      [-90, -60, 70, 14],
      [-40, -140, 90, 22],
      [80, -110, 80, 18],
      [150, -30, 70, 12],
      [-160, 20, 80, 16],
      [60, 90, 60, 10],
    ];
    const hg = new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    hills.forEach(([x, z, r, h]) => {
      const m = new THREE.Mesh(hg, hillMat);
      m.position.set(x, -1.6, z);
      m.scale.set(r, h, r * 0.8);
      this.scene.add(m);
    });
  }

  buildTemple() {
    const marble = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.82, metalness: 0 });
    const shadowMarble = new THREE.MeshStandardMaterial({ color: 0x9c9c9c, roughness: 0.95 });
    const voidMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1 });
    patchDissolve(marble, this.shared);
    patchDissolve(shadowMarble, this.shared);
    patchDissolve(voidMat, this.shared, false);
    const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    patchDissolve(depthMat, this.shared, false);

    const group = new THREE.Group();
    this.temple = group;
    const add = (mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.customDepthMaterial = depthMat;
      group.add(mesh);
      return mesh;
    };
    const box = (w, h, d, x, y, z, mat = marble) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      return add(m);
    };

    // crepidoma — three stepped platforms
    const HX = 7.4;
    const HZ = 15.6;
    box(HX * 2, 0.5, HZ * 2, 0, -0.25, 0);
    box((HX + 0.6) * 2, 0.5, (HZ + 0.6) * 2, 0, -0.75, 0);
    box((HX + 1.2) * 2, 0.5, (HZ + 1.2) * 2, 0, -1.25, 0);

    // grand stair on the east front
    const STEPS = 12;
    for (let i = 0; i < STEPS; i++) {
      const top = -((i + 1) * 1.5) / (STEPS + 1);
      const depth = 0.42 * (i + 1) + 1.2;
      box(7.6, top + 1.5, depth, 0, (top - 1.5) / 2, HZ + depth / 2 - 0.02);
    }
    this.stair = { z0: HZ + 1.2, dz: 0.42, steps: STEPS };

    // peristyle
    const colGeo = columnGeometry();
    const spots = [];
    const nx = 8;
    const nz = 17;
    const sx = 12.6 / (nx - 1);
    const sz = 28.8 / (nz - 1);
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < nz; j++) {
        if (i !== 0 && i !== nx - 1 && j !== 0 && j !== nz - 1) continue;
        spots.push([-6.3 + i * sx, -14.4 + j * sz]);
      }
    }
    const cols = new THREE.InstancedMesh(colGeo, marble, spots.length);
    const m4 = new THREE.Matrix4();
    spots.forEach(([x, z], k) => {
      m4.makeRotationY((k * 0.37) % (Math.PI / 10));
      m4.setPosition(x, 0, z);
      cols.setMatrixAt(k, m4);
    });
    add(cols);

    // cella — the dark inner chamber behind the colonnade
    box(8.6, COL_H + 0.9, 23, 0, (COL_H + 0.9) / 2, -0.5, shadowMarble);
    box(3.2, 7.2, 0.3, 0, 3.6, 11.05, voidMat);

    // entablature
    const yA = COL_H + 0.88;
    const EX = 7.25;
    const EZ = 15.35;
    box(EX * 2, 1.25, EZ * 2, 0, yA + 0.62, 0);
    const yF = yA + 1.25;
    box(EX * 2 - 0.16, 1.2, EZ * 2 - 0.16, 0, yF + 0.6, 0);
    // regulae line + triglyphs
    const tri = [];
    for (let x = -EX + 0.35; x <= EX - 0.3; x += 0.9) {
      tri.push([x, EZ - 0.02, 0]);
      tri.push([x, -EZ + 0.02, 0]);
    }
    for (let z = -EZ + 0.35; z <= EZ - 0.3; z += 0.9) {
      tri.push([EX - 0.02, z, 1]);
      tri.push([-EX + 0.02, z, 1]);
    }
    const triMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.46, 1.2, 0.2), marble, tri.length);
    tri.forEach(([a, b, side], k) => {
      m4.makeRotationY(side ? Math.PI / 2 : 0);
      if (side) m4.setPosition(a, yF + 0.6, b);
      else m4.setPosition(a, yF + 0.6, b);
      triMesh.setMatrixAt(k, m4);
    });
    add(triMesh);

    const yC = yF + 1.2;
    const CX = EX + 0.4;
    const CZ = EZ + 0.4;
    box(CX * 2, 0.5, CZ * 2, 0, yC + 0.25, 0);
    // mutules / dentils under the cornice
    const dent = [];
    for (let x = -CX + 0.2; x <= CX - 0.1; x += 0.36) dent.push([x, CZ - 0.18, 0], [x, -CZ + 0.18, 0]);
    for (let z = -CZ + 0.2; z <= CZ - 0.1; z += 0.36) dent.push([CX - 0.18, z, 1], [-CX + 0.18, z, 1]);
    const dentMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.18, 0.36), marble, dent.length);
    dent.forEach(([a, b, side], k) => {
      m4.makeRotationY(side ? Math.PI / 2 : 0);
      m4.setPosition(a, yC - 0.09, b);
      dentMesh.setMatrixAt(k, m4);
    });
    add(dentMesh);

    // pediments, raking cornices, roof and antefixes
    const top = yC + 0.5;
    const PW = CX;
    const PH = 3.1;
    const shape = new THREE.Shape();
    shape.moveTo(-PW, 0);
    shape.lineTo(PW, 0);
    shape.lineTo(0, PH);
    shape.closePath();
    const pedGeo = new THREE.ExtrudeGeometry(shape, { depth: 1.2, bevelEnabled: false });
    const pedF = add(new THREE.Mesh(pedGeo, marble));
    pedF.position.set(0, top, CZ - 1.5);
    const pedB = add(new THREE.Mesh(pedGeo, marble));
    pedB.position.set(0, top, -CZ + 0.3);

    const slope = Math.atan2(PH, PW);
    const rakeLen = Math.hypot(PW, PH) + 0.5;
    [1, -1].forEach((zs) => {
      [1, -1].forEach((xs) => {
        const r = box(rakeLen, 0.42, 0.9, (-xs * PW) / 2, top + PH / 2 + 0.16, zs * (CZ - 0.2));
        r.rotation.z = xs * slope;
      });
    });
    [1, -1].forEach((xs) => {
      const roof = box(rakeLen + 0.2, 0.28, CZ * 2 + 0.3, (xs * PW) / 2, top + PH / 2 + 0.36, 0);
      roof.rotation.z = -xs * slope;
    });

    const ante = [];
    for (let z = -CZ + 0.3; z <= CZ - 0.2; z += 0.62) ante.push([CX + 0.05, z], [-CX - 0.05, z]);
    const anteMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.42, 0.26), marble, ante.length);
    ante.forEach(([x, z], k) => {
      m4.makeRotationZ(0);
      m4.setPosition(x, top + 0.2, z);
      anteMesh.setMatrixAt(k, m4);
    });
    add(anteMesh);

    // acroteria
    const acroGeo = new THREE.IcosahedronGeometry(0.42, 0);
    [
      [0, top + PH + 0.7, CZ - 0.2],
      [0, top + PH + 0.7, -CZ + 0.2],
      [CX, top + 0.5, CZ - 0.2],
      [-CX, top + 0.5, CZ - 0.2],
      [CX, top + 0.5, -CZ + 0.2],
      [-CX, top + 0.5, -CZ + 0.2],
    ].forEach(([x, y, z]) => {
      const a = add(new THREE.Mesh(acroGeo, marble));
      a.position.set(x, y, z);
      a.scale.set(1, 1.6, 0.6);
    });

    this.scene.add(group);
  }

  buildFigure() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 1 });
    const fig = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.58, 4, 10), mat);
    torso.position.y = 1.18;
    torso.scale.set(1, 1, 0.7);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), mat);
    head.position.y = 1.72;
    const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.72, 4, 8), mat);
    const legR = legL.clone();
    legL.position.set(-0.09, 0.44, 0);
    legR.position.set(0.09, 0.44, 0);
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.58, 4, 8), mat);
    const armR = armL.clone();
    armL.position.set(-0.25, 1.15, 0);
    armR.position.set(0.25, 1.15, 0);
    [torso, head, legL, legR, armL, armR].forEach((m) => {
      m.castShadow = true;
      fig.add(m);
    });
    this.figure = { group: fig, legL, legR, armL, armR };
    this.scene.add(fig);
  }

  buildDust() {
    const count = this.lite ? 2600 : 7000;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * 8.4;
      pos[i * 3 + 1] = -1.4 + Math.random() * 16.5;
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * 16;
      for (let k = 0; k < 4; k++) seed[i * 4 + k] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
    this.dustMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: this.shared.uTime,
        uFront: this.shared.uFront,
        uWind: this.shared.uWind,
        uPixel: { value: this.renderer.getPixelRatio() },
      },
      vertexShader: /* glsl */ `
        attribute vec4 aSeed;
        uniform float uTime, uFront, uPixel;
        uniform vec3 uWind;
        varying float vA;
        void main() {
          float life = fract(uTime * (0.03 + aSeed.x * 0.05) + aSeed.y);
          vec3 p = position;
          float e = dot(p, uWind);
          p += uWind * (uFront - e + (aSeed.z - 0.5) * 3.0);
          float travel = life * (8.0 + aSeed.w * 34.0);
          p += uWind * travel;
          p.y += life * life * (1.0 + aSeed.x * 6.0) - life * 1.5;
          p.x += sin(life * 5.0 + aSeed.y * 40.0) * life * 2.2;
          p.z += cos(life * 4.0 + aSeed.z * 30.0) * life * 1.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp((0.6 + aSeed.w * 1.4) * uPixel * 26.0 / -mv.z, 1.0, 6.0);
          vA = smoothstep(0.0, 0.06, life) * (1.0 - life) * smoothstep(19.0, 13.0, uFront);
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          if (dot(c, c) > 0.25) discard;
          gl_FragColor = vec4(vec3(1.25) * vA, 1.0);
        }`,
    });
    const pts = new THREE.Points(g, this.dustMat);
    pts.frustumCulled = false;
    this.scene.add(pts);
  }

  /* ───────── riso post pass ───────── */

  buildPost() {
    this.rt = new THREE.WebGLRenderTarget(2, 2, {
      type: THREE.HalfFloatType,
      depthTexture: new THREE.DepthTexture(2, 2),
    });
    this.post = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: this.rt.texture },
        tDepth: { value: this.rt.depthTexture },
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uSeed: { value: 0 },
        uGrain: { value: 1.6 },
        uMisreg: { value: new THREE.Vector2(3.5, -2.5) },
        uGlowUv: { value: new THREE.Vector2(0.8, 0.8) },
        uRays: { value: 0.2 },
        uReveal: { value: 0 },
        uPink: { value: new THREE.Color('#F6D0EA') },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D tScene, tDepth;
        uniform vec2 uRes, uMisreg, uGlowUv;
        uniform float uTime, uSeed, uGrain, uRays, uReveal;
        uniform vec3 uPink;
        varying vec2 vUv;
        ${riso}

        float tone(vec2 uv) {
          float l = luma(texture2D(tScene, uv).rgb);
          l = pow(max(l, 0.0), 0.4545);
          return l;
        }

        void main() {
          vec2 fc = gl_FragCoord.xy;
          float l = tone(vUv);

          // crepuscular streaks from the bright sky, sampled toward the glow
          float rays = 0.0;
          vec2 dir = (uGlowUv - vUv) / 26.0;
          vec2 p = vUv;
          float w = 1.0;
          for (int i = 0; i < 26; i++) {
            p += dir;
            float sky = step(0.99999, texture2D(tDepth, p).r);
            rays += sky * smoothstep(0.52, 0.9, tone(p)) * w;
            w *= 0.93;
          }
          l += rays * uRays * 0.12;

          // uneven ink laydown across the sheet
          float blot = fbm(vUv * vec2(2.6, 1.8) + 3.7);
          l += (blot - 0.5) * 0.08;
          l = smoothstep(0.02, 0.98, l);

          float n = grain(fc, uGrain, uSeed);
          vec3 col = risoRamp(l, n);

          // second drum: highlight ink, deliberately out of register
          float lh = tone(vUv + uMisreg / uRes) + rays * uRays * 0.1;
          float h = smoothstep(0.66, 0.97, lh + (blot - 0.5) * 0.06);
          float n2 = grain(fc + 13.0, uGrain, uSeed + 4.2);
          col = mix(col, uPink, step(n2, h) * 0.94);

          // the sheet feeds in from the bottom: print revealed through the drum
          float edge = uReveal * 1.25 - 0.12 + (fbm(vec2(vUv.x * 9.0, uTime)) - 0.5) * 0.1;
          float fed = step(1.0 - vUv.y, edge);
          vec3 paper = mix(INK2, INK3, step(n, 0.5 + 0.35 * vUv.y));
          col = mix(paper, col, fed);

          gl_FragColor = vec4(col, 1.0);
        }`,
      depthTest: false,
      depthWrite: false,
    });
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.postScene = new THREE.Scene();
    const quad = new THREE.Mesh(tri, this.post);
    quad.frustumCulled = false;
    this.postScene.add(quad);
    this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  buildCameraPath() {
    this.path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(31, -0.2, 45),
      new THREE.Vector3(38, 4, 52),
      new THREE.Vector3(26, 5.5, 66),
      new THREE.Vector3(7, 3.4, 72),
    ]);
    // look targets sit left of the monument so it stands to the right of the type
    this.look = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-13, 8.5, 4),
      new THREE.Vector3(-12, 7.5, 0),
      new THREE.Vector3(-4, 6, 0),
      new THREE.Vector3(0, 5.5, 0),
    ]);
    this._camPos = new THREE.Vector3();
    this._camLook = new THREE.Vector3();
    this._glow = new THREE.Vector3();
  }

  /* ───────── runtime ───────── */

  setProgress(p) {
    this.progress = p;
  }

  setPointer(x, y) {
    this.pointer.set(x, y);
  }

  setReveal(v) {
    this.post.uniforms.uReveal.value = v;
  }

  setInk(hex) {
    this.post.uniforms.uPink.value.set(hex);
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    const pr = this.renderer.getPixelRatio();
    this.rt.setSize(Math.floor(w * pr), Math.floor(h * pr));
    this.post.uniforms.uRes.value.set(w * pr, h * pr);
    this.post.uniforms.uGrain.value = Math.max(1.0, 1.35 * pr);
    this.post.uniforms.uMisreg.value.set(3.2 * pr, -2.4 * pr);
    this.camera.aspect = w / h;
    // keep the monument framed on tall screens
    this.camera.fov = w / h < 1 ? 52 : 38;
    this.camera.updateProjectionMatrix();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.timer.reset?.();
    this.raf = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  tick() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this._tick);
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.05);
    const t = this.timer.getElapsed();
    this.shared.uTime.value = t;
    this.post.uniforms.uTime.value = t;
    // the drum shimmers at 12 impressions per second, never per frame
    this.post.uniforms.uSeed.value = Math.floor(t * 12) % 64;

    const p = this.progress;
    this.pointerEased.lerp(this.pointer, 1 - Math.exp(-dt * 3));

    // camera along the processional path
    const cp = ease(Math.min(Math.max(p, 0), 1));
    this.path.getPointAt(cp, this._camPos);
    this.look.getPointAt(cp, this._camLook);
    this._camPos.x += this.pointerEased.x * 1.6;
    this._camPos.y += this.pointerEased.y * 0.9 + Math.sin(t * 0.3) * 0.12;
    this.camera.position.copy(this._camPos);
    this.camera.lookAt(this._camLook);

    // the sun swings behind the temple as you descend: lit facade → backlit silhouette
    const sp = Math.min(Math.max((p - 0.2) / 0.8, 0), 1);
    this.sun.position.lerpVectors(this.sunFrom, this.sunTo, ease(sp));
    this.skyGlow.value.lerpVectors(this.glowFrom, this.glowTo, ease(sp)).normalize();

    // erosion: the far end already crumbles, scroll lets the wind take more
    this.shared.uFront.value = 12.5 - p * 13 + Math.sin(t * 0.2) * 0.3;

    // the lone visitor climbs the stair as you descend the page
    const f = this.figure;
    const climb = Math.min(Math.max((p - 0.15) / 0.8, 0), 1);
    const z = 26 - climb * 9.6;
    const stepIndex = Math.floor((z - this.stair.z0 + 1.2) / this.stair.dz);
    const onStair = z < this.stair.z0 + this.stair.steps * this.stair.dz;
    const topY = onStair ? -(Math.max(stepIndex, 0) * 1.5) / (this.stair.steps + 1) : -1.5;
    f.group.position.set(2.2, Math.min(topY, 0), z);
    f.group.rotation.y = Math.PI;
    const stride = Math.sin(climb * 60) * (climb > 0 && climb < 1 ? 0.35 : 0.04);
    f.legL.rotation.x = stride;
    f.legR.rotation.x = -stride;
    f.armL.rotation.x = -stride * 0.7;
    f.armR.rotation.x = stride * 0.7;

    // project the sky glow into screen space for the light streaks
    this._glow.copy(this.skyGlow.value).multiplyScalar(120).add(this.camera.position);
    this._glow.project(this.camera);
    this.post.uniforms.uGlowUv.value.set(this._glow.x * 0.5 + 0.5, this._glow.y * 0.5 + 0.5);

    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCam);
  }

  dispose() {
    this.stop();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach((m) => m.dispose());
    });
    this.rt.dispose();
    this.post.dispose();
    this.renderer.dispose();
  }
}
