import { useEffect, useState } from 'react';
import { startLenis, onScroll, ScrollTrigger } from './lib/motion.js';
import { bakeNoise } from './lib/noise.js';
import { gallery } from './gl/RisoGallery.js';
import { Cursor, Grain, InkLevel, RegMarks, SiteFx } from './components/Chrome.jsx';
import Preloader from './components/Preloader.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Manifesto from './components/Manifesto.jsx';
import Colonnade from './components/Colonnade.jsx';
import Orders from './components/Orders.jsx';
import Press from './components/Press.jsx';
import Ascent from './components/Ascent.jsx';
import Finale from './components/Finale.jsx';

bakeNoise();
startLenis();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const off = onScroll((l) => gallery.setVelocity(l.velocity));
    // late font metrics shift pinned sections — measure again once type has settled
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return off;
  }, []);

  useEffect(() => {
    if (ready) ScrollTrigger.refresh();
  }, [ready]);

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Nav ready={ready} />
      <main>
        <Hero ready={ready} />
        <Manifesto />
        <Colonnade />
        <Orders />
        <Press />
        <Ascent />
        <Finale />
      </main>
      <RegMarks />
      <InkLevel />
      <Grain />
      <Cursor />
      <SiteFx ready={ready} />
    </>
  );
}
