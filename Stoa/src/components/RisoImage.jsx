import { useEffect, useRef, useState } from 'react';
import { gallery } from '../gl/RisoGallery.js';
import { getInk, hexToVec, subscribeInk } from '../lib/ink.js';

/*
  A DOM placeholder that the fixed OGL canvas prints into. The real <img> stays in the
  document for accessibility and as the no-WebGL fallback.
*/
export default function RisoImage({ src, alt, className = '', bend = 1, reveal = 1, shape = 'rect', raw = 0, inset, fade, onLoad, onPlate, cursor, ...rest }) {
  const ref = useRef(null);
  const handle = useRef(null);
  const [gl, setGl] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const ok = gallery.init();
    setGl(ok);
    if (!ok) return;
    const h = gallery.add(el, src, { bend, reveal, shape, raw, inset, fade, onLoad });
    handle.current = h;
    h.uniforms.uInk.value = hexToVec(getInk());
    onPlate?.(h);
    const off = subscribeInk((hex) => {
      if (!h.item.lockInk) h.uniforms.uInk.value = hexToVec(hex);
    });
    return () => {
      off();
      h.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <span ref={ref} className={`riso-img riso-img--${shape} ${gl ? 'is-gl' : ''} ${className}`} data-cursor={cursor} {...rest}>
      <img src={src} alt={alt} loading="lazy" crossOrigin="anonymous" draggable="false" />
    </span>
  );
}
