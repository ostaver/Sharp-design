import { useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { gallery, type PlateHandle, type PlateOptions, type Shape } from '../gl/RisoGallery';
import { getInk, hexToVec, subscribeInk } from '../lib/ink';

export interface RisoImageProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onLoad'>, Omit<PlateOptions, 'onLoad'> {
  src: string;
  alt: string;
  shape?: Shape;
  /** the cursor's label over this image */
  cursor?: string;
  onLoad?: () => void;
  /** receives the plate handle once the GPU has it (uniforms for Plate and the Press) */
  onPlate?: (handle: PlateHandle) => void;
}

/*
  A DOM placeholder that the fixed OGL canvas prints into. The real <img> stays in the
  document for accessibility, and shows itself whenever WebGL is missing or lost.
*/
export default function RisoImage({ src, alt, className = '', bend = 1, reveal = 1, shape = 'rect', raw = 0, gamma = 1, inset, fade, onLoad, onPlate, cursor, ...rest }: RisoImageProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [gl, setGl] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !gallery.init()) return;
    const h = gallery.add(el, src, { bend, reveal, shape, raw, gamma, inset, fade, onLoad });
    if (!h) return;
    setGl(true);
    h.uniforms.uInk.value = hexToVec(getInk());
    onPlate?.(h);
    const offInk = subscribeInk((hex) => {
      if (!h.item.lockInk) h.uniforms.uInk.value = hexToVec(hex);
    });
    const offState = gallery.onState(setGl);
    return () => {
      offInk();
      offState();
      h.remove();
    };
    // the plate is rebuilt only when its picture changes; other props are read once
  }, [src]);

  return (
    <span ref={ref} className={`riso-img riso-img--${shape} ${gl ? 'is-gl' : ''} ${className}`} data-cursor={cursor} {...rest}>
      <img src={src} alt={alt} loading="lazy" crossOrigin="anonymous" draggable={false} />
    </span>
  );
}
