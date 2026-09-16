import 'lenis/dist/lenis.css';
import './styles/main.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import { Texture } from 'ogl';

import { env } from './lib/env.js';
import './lib/pointer.js';
import { STUDIO } from './lib/sun.js';
import { HAND, PROCESS, composeSheet, drawPlate } from './specimens/compose.js';
import { Stage } from './gl/Stage.js';
import { Ground } from './gl/Ground.js';
import { Photogram } from './gl/Photogram.js';
import { createPlateProgram } from './gl/plate.js';
import { ProcessPlate } from './gl/ProcessPlate.js';
import { DryingLine } from './gl/DryingLine.js';
import { Preloader } from './ui/preloader.js';
import { initNav } from './ui/nav.js';
import { initReveals } from './ui/reveals.js';
import { initHero } from './ui/hero.js';
import { initProcess } from './ui/process.js';
import { initHerbarium } from './ui/herbarium.js';
import { initSunclock } from './ui/sunclock.js';
import { initSessions } from './ui/sessions.js';
import { initCoat } from './ui/coat.js';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
// Slow to start, then resolving: the way a print comes up in the wash.
CustomEase.create('develop', 'M0,0 C0.2,0 0.26,0.46 0.44,0.76 0.62,1 0.82,1 1,1');

const FONT = 'Ysabeau';
const html = document.documentElement;
const reduced = env.reducedMotion;
html.classList.toggle('motion', !reduced);
html.classList.toggle('fine', env.finePointer);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

async function loadFonts() {
  if (!document.fonts) return;
  const faces = [`820 100px "${FONT}"`, `560 16px "${FONT}"`, `380 16px "${FONT}"`, 'italic 400 16px "Cardo"', `400 32px "${HAND}"`];
  await Promise.race([Promise.allSettled(faces.map((face) => document.fonts.load(face))), new Promise((r) => setTimeout(r, 3500))]);
}

// Every specimen is drawn once and shared by the WebGL plates and the printed fallback.
const canvases = new Map();
function plateCanvas(type, seed) {
  const key = `${type}:${seed}`;
  if (!canvases.has(key)) canvases.set(key, drawPlate(type, seed));
  return canvases.get(key);
}

function specimenJobs() {
  const jobs = new Map();
  document.querySelectorAll('[data-specimen]').forEach((el) => {
    const { specimen, seed = '1' } = el.dataset;
    if (specimen !== 'yours') jobs.set(`${specimen}:${seed}`, { type: specimen, seed: Number(seed) });
  });
  return [...jobs.values()];
}

function createGL(processCanvas) {
  const stage = new Stage(document.querySelector('.gl'));
  const gl = stage.gl;
  const upload = (image) => {
    const texture = new Texture(gl, { image, generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR });
    texture.update();
    return texture;
  };
  const textures = new Map();
  const textureFor = (type, seed) => {
    const key = `${type}:${seed}`;
    if (!textures.has(key)) textures.set(key, upload(plateCanvas(type, seed)));
    return textures.get(key);
  };

  const herbarium = document.querySelector('.herbarium');
  stage.add(new Ground(stage, { paper: herbarium }));
  const photogram = stage.add(new Photogram(stage, { el: document.querySelector('.hero__sticky'), font: FONT, reduced }));
  const program = createPlateProgram(stage);
  const process = stage.add(
    new ProcessPlate(stage, program, { slot: document.querySelector('[data-slot="process"]'), texture: upload(processCanvas) }),
  );
  stage.add(
    new DryingLine(stage, program, { section: herbarium, medias: [...herbarium.querySelectorAll('.plate__media')], textureFor, photogram, reduced }),
  );
  specimenJobs().forEach(({ type, seed }) => textureFor(type, seed));

  html.classList.add('gl-on');
  return { stage, photogram, process, program };
}

// Without WebGL the page is a finished print: the same drawings, white on Prussian blue.
function printFallback(processCanvas) {
  html.classList.remove('gl-on');
  html.classList.add('no-gl');
  const sticky = document.querySelector('.hero__sticky');
  if (!sticky.querySelector('.hero__art')) {
    const { plants } = composeSheet(window.innerWidth, window.innerHeight, { scale: Math.min(window.devicePixelRatio || 1, 1.5), font: FONT });
    plants.className = 'hero__art';
    plants.setAttribute('aria-hidden', 'true');
    sticky.prepend(plants);
  }
  document.querySelectorAll('.plate__media[data-specimen]').forEach((el) => {
    if (el.dataset.specimen === 'yours' || el.querySelector('canvas')) return;
    const src = plateCanvas(el.dataset.specimen, Number(el.dataset.seed) || 1);
    const copy = document.createElement('canvas');
    copy.width = src.width;
    copy.height = src.height;
    copy.getContext('2d').drawImage(src, 0, 0);
    copy.setAttribute('aria-hidden', 'true');
    el.prepend(copy);
  });
  const slot = document.querySelector('[data-fallback="process"]');
  if (slot) {
    slot.width = processCanvas.width;
    slot.height = processCanvas.height;
    slot.getContext('2d').drawImage(processCanvas, 0, 0);
  }
}

function start(gl, processCanvas) {
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.11, anchors: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
  }
  gsap.ticker.lagSmoothing(0);

  const nav = initNav({ lenis });
  nav.setNav(gl && !reduced ? 'sheet' : 'blue');
  const hero = initHero({ photogram: gl?.photogram, setNav: nav.setNav, reduced });
  initProcess({ plate: gl?.process, reduced });
  initHerbarium({ reduced });
  initReveals({ reduced });
  initSessions();
  initSunclock();
  initCoat({ lenis, hero, reduced });

  if (gl) {
    gsap.ticker.add((time, deltaMs) => {
      gl.program.uniforms.uTime.value = time;
      gl.stage.render(time, Math.min(deltaMs / 1000, 1 / 20));
    });
    let queued = false;
    window.addEventListener('resize', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        gl.stage.resize();
      });
    });
    gl.stage.onLost = () => printFallback(processCanvas);
  }

  ScrollTrigger.refresh();
  hero.intro();
  if (import.meta.env.DEV) window.kyanos = { lenis, gl };
}

async function boot() {
  const preloader = new Preloader(document.querySelector('.preloader'), { reduced });
  preloader.start();
  await loadFonts();
  preloader.set(0.2);

  const jobs = specimenJobs();
  for (let i = 0; i < jobs.length; i++) {
    plateCanvas(jobs[i].type, jobs[i].seed);
    preloader.set(0.2 + 0.5 * ((i + 1) / jobs.length));
    await nextFrame();
  }
  // the plate on the table is dated today, in the printer's hand
  const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: STUDIO.tz }).format(new Date());
  const processCanvas = drawPlate('process', 1205, { ...PROCESS, caption: `Hydra, ${day}` });
  await nextFrame();

  let gl = null;
  if (env.webgl) {
    try {
      gl = createGL(processCanvas);
    } catch (error) {
      console.warn('[kyanos] WebGL could not start; showing the printed version instead.', error);
    }
  }
  if (!gl) printFallback(processCanvas);
  if (gl && !reduced) gsap.set(['.hero__sheet', '.hero__foot > *'], { autoAlpha: 0 });

  preloader.set(1);
  await preloader.finish();
  start(gl, processCanvas);
}

boot();
