// Every word and image on the site lives here. Swap the persona, works and links freely.
import arrival from '../assets/plates/arrival.jpg';
import arrivalThumb from '../assets/plates/arrival-thumb.jpg';
import listeners from '../assets/plates/listeners.jpg';
import listenersThumb from '../assets/plates/listeners-thumb.jpg';
import longWalk from '../assets/plates/long-walk.jpg';
import longWalkThumb from '../assets/plates/long-walk-thumb.jpg';

const u = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const person = {
  name: 'Ari Kallis',
  short: 'Kallis',
  role: 'Creative Frontend Developer',
  city: 'Athens',
  timeZone: 'Europe/Athens',
  coords: 'N 37°58′ · E 23°43′',
  email: 'hello@arikallis.dev',
  since: 'MMXVI',
  socials: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'Read.cv', href: 'https://read.cv/' },
    { label: 'Codepen', href: 'https://codepen.io/' },
    { label: 'X / Twitter', href: 'https://x.com/' },
  ],
};

export const nav = [
  { id: 'works', label: 'Colonnade', numeral: 'I' },
  { id: 'orders', label: 'Orders', numeral: 'II' },
  { id: 'press', label: 'Press', numeral: 'III' },
  { id: 'ascent', label: 'Ascent', numeral: 'IV' },
  { id: 'contact', label: 'Inscribe', numeral: 'V' },
];

export const images = {
  parthenon: u('1555993539-1732b0258235'),
  arches: u('1524230572899-a752b3835840'),
  castHall: u('1575223970966-76ae61ee7838'),
  dome: u('1566054757965-8c4085344c96'),
  david: u('1601887389937-0b02c26b602c', 1400),
  colosseum: u('1604580864964-0462f5d5b1a8'),
  acropolis: u('1603565816030-6b389eeb23cb'),
  gallery: u('1572953109213-3be62398eb95'),
  fog: u('1470071459604-3b5ec3a7fe05'),
  runner: u('1581889470536-467bdbe30cd0'),
  // house plates — riso illustrations shown close to how they were printed
  arrival,
  listeners,
  longWalk,
};

export const thumbs = { arrival: arrivalThumb, listeners: listenersThumb, longWalk: longWalkThumb };

export const plates = {
  longWalk: {
    src: longWalk,
    alt: 'A lone walker and a stag cross a field of lavender grass beneath a vast Doric temple in the fog.',
    fig: 'Fig. 2',
    title: 'The long walk',
    note: 'A decade of hand-set pixels. No templates. No page builders.',
  },
  arrival: {
    src: arrival,
    alt: 'The corner of a Doric temple seen from its steps, its far end dissolving into wind-blown grain.',
    fig: 'Fig. 3',
    title: 'Arrival',
    note: '…and the wind brings back what it took.',
  },
};

export const manifesto = [
  { t: 'I build' },
  { t: 'monuments', img: images.castHall },
  { t: 'out of' },
  { t: 'light, shaders & motion —' },
  { t: 'interfaces with the' },
  { t: 'weight of marble', img: images.dome },
  { t: 'and the grain of a' },
  { t: 'hand-pulled print.', em: true },
];

export const works = [
  {
    n: 'I',
    title: 'Parthenon.gl',
    client: 'Acropolis Museum',
    year: '2026',
    kind: 'WebGL Reconstruction',
    stack: ['Three.js', 'GLSL', 'GSAP'],
    image: images.parthenon,
    blurb: 'A 1:1 digital anastylosis — 46 columns rebuilt in the browser, lit by the real sun path over Athens.',
  },
  {
    n: 'II',
    title: 'Hall of Casts',
    client: 'Glyptothek Online',
    year: '2025',
    kind: 'Virtual Gallery',
    stack: ['React', 'OGL', 'Lenis'],
    image: images.castHall,
    blurb: 'A plaster-cast collection you walk with your scroll wheel. 212 sculptures, streamed as depth-aware planes.',
  },
  {
    n: 'III',
    title: 'Endless Arcade',
    client: 'Self-initiated',
    year: '2025',
    kind: 'Infinite Canvas',
    stack: ['WebGL2', 'Workers', 'TS'],
    image: images.gallery,
    blurb: 'An infinitely recursive arcade that never repeats — procedural vaults generated inside a worker at 120 fps.',
  },
  {
    n: 'IV',
    title: 'Contrapposto',
    client: 'Studio Metopa',
    year: '2024',
    kind: 'Motion System',
    stack: ['GSAP', 'Flip', 'Svelte'],
    image: images.dome,
    blurb: 'A motion language derived from classical weight-shift: every transition leans, settles and breathes.',
  },
  {
    n: 'V',
    title: 'Oculus Records',
    client: 'Oculus Label',
    year: '2023',
    kind: 'Audio-reactive Site',
    stack: ['Web Audio', 'Three.js', 'Next'],
    image: images.listeners,
    raw: 0.55,
    blurb: 'A record label whose marble busts listen back. FFT bands drive subsurface scattering in real time.',
  },
  {
    n: 'VI',
    title: 'Amphitheatre',
    client: 'Forum Data Co.',
    year: '2022',
    kind: 'Realtime Data Viz',
    stack: ['D3', 'Canvas', 'WebSockets'],
    image: images.colosseum,
    blurb: '50,000 live seats rendered as a stadium of particles, each one a request hitting the forum’s API.',
  },
];

export const orders = [
  {
    order: 'Doric',
    numeral: 'I',
    motto: 'Foundations that carry weight',
    lead: 'Architecture, accessibility and performance budgets that never crack under load.',
    skills: ['React / Next', 'TypeScript', 'Astro · Svelte', 'Design Systems', 'Core Web Vitals', 'a11y · WCAG 2.2'],
  },
  {
    order: 'Ionic',
    numeral: 'II',
    motto: 'Motion with a scroll of grace',
    lead: 'Choreography that reads like a sentence — easing, rhythm and weight in every transition.',
    skills: ['GSAP · ScrollTrigger', 'Lenis', 'View Transitions', 'SVG Morphing', 'Framer Motion', 'Rive · Lottie'],
  },
  {
    order: 'Corinthian',
    numeral: 'III',
    motto: 'Ornament rendered in light',
    lead: 'Shaders, simulations and real-time scenes — the acanthus leaves of the modern web.',
    skills: ['Three.js · R3F', 'OGL · WebGL2', 'GLSL · WGSL', 'WebGPU', 'Post-processing', 'Generative Systems'],
  },
];

export const ascent = [
  { year: '2016', title: 'First stone', text: 'Hand-coded a museum microsite in a single HTML file. It still loads in 180 ms.' },
  { year: '2018', title: 'Apprentice, Studio Metopa', text: 'Learned motion from animators and grids from typographers.' },
  { year: '2020', title: 'Frontend Lead, Forum Data', text: 'Shipped real-time dashboards for 4M monthly visitors.' },
  { year: '2022', title: 'Awwwards SOTD ×3', text: 'Amphitheatre, Oculus and a quiet little shader called Marble.' },
  { year: '2024', title: 'Independent', text: 'Opened a one-person stoa for museums, labels and brave studios.' },
  { year: '2026', title: 'FWA of the Year — nominee', text: 'Parthenon.gl rebuilt the peristyle for 2.1M visitors.' },
];

export const inks = [
  { name: 'Fluorescent Pink', code: 'RZ-S-0087', hex: '#F6D0EA' },
  { name: 'Sunflower', code: 'RZ-S-0114', hex: '#FFD86B' },
  { name: 'Aqua', code: 'RZ-S-0032', hex: '#9EEBE0' },
  { name: 'Bright Red', code: 'RZ-S-0021', hex: '#FF8A8A' },
];
