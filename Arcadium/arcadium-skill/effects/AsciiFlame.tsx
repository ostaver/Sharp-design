import * as React from "react";
import { useEffect, useRef } from "react";
import "./ascii-flame.js";

export interface AsciiFlameProps {
  preset?: string;
  palette?: string;
  glyphs?: string;
  intensity?: number;
  wind?: number;
  speed?: number;
  glow?: number;
  embers?: number;
  smoke?: number;
  flicker?: number;
  brightness?: number;
  quality?: string;
  fps?: number;
  seed?: number;
  interactive?: boolean;
  paused?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface AsciiFlameHandle {
  ignite: (x?: number, y?: number, power?: number) => void;
  gust: (strength?: number) => void;
  reset: () => void;
  play: () => void;
  pause: () => void;
}

const AsciiFlame = React.forwardRef<AsciiFlameHandle, AsciiFlameProps>(function AsciiFlame(
  { interactive = true, ...rest },
  ref
) {
  const elRef = useRef<HTMLElement | null>(null);

  useImperativeHandleSetup(ref, elRef);

  const props: Record<string, unknown> = { ...rest };
  if (interactive) props.interactive = "";
  for (const k of Object.keys(props)) {
    if (props[k] === undefined || props[k] === null) delete props[k];
    else if (typeof props[k] === "number") props[k] = String(props[k]);
  }

  return React.createElement("ascii-flame", { ...props, ref: elRef as any });
});

function useImperativeHandleSetup(
  ref: React.ForwardedRef<AsciiFlameHandle>,
  elRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!ref) return;
    const el = () => elRef.current as any;
    const handle: AsciiFlameHandle = {
      ignite: (x, y, p) => el()?.ignite(x, y, p),
      gust: (s) => el()?.gust(s),
      reset: () => el()?.reset(),
      play: () => el()?.play(),
      pause: () => el()?.pause(),
    };
    if (typeof ref === "function") {
      ref(handle);
      return () => ref(null);
    }
    (ref as React.MutableRefObject<AsciiFlameHandle | null>).current = handle;
    return () => {
      (ref as React.MutableRefObject<AsciiFlameHandle | null>).current = null;
    };
  }, [ref, elRef]);
}

export default AsciiFlame;
