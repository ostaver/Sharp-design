import { capitals, type Order } from '../lib/capitals';

/*
  A line-drawn capital in two inks. Every stroke has pathLength=1 so the drawing can be
  scrubbed (tween strokeDashoffset 1 → 0 on '.capital > g path'); layers behind the front of
  the capital are masked by its outline so carved parts overlap instead of tangling.
*/
export default function Capital({ order, className = '' }: { order: Order; className?: string }) {
  const c = capitals[order];
  const id = `capital-${order.toLowerCase()}`;
  const box = { x: -40, y: -20, width: 400, height: c.h + 40 };
  const mask = (key: string, outlines?: string[]) =>
    outlines && (
      <mask id={`${id}-${key}`} maskUnits="userSpaceOnUse" {...box}>
        <rect {...box} fill="#fff" />
        {outlines.map((d, i) => (
          <path key={i} d={d} fill="#000" stroke="none" />
        ))}
      </mask>
    );
  const layer = (paths?: string[], key?: string) =>
    paths && (
      <g mask={key ? `url(#${id}-${key})` : undefined}>
        {paths.map((d, i) => (
          <path key={i} pathLength={1} d={d} />
        ))}
      </g>
    );
  const art = (
    <>
      {layer(c.back, c.backMask && 'b')}
      {layer(c.mid, c.midMask && 'm')}
      {layer(c.front)}
    </>
  );
  return (
    <svg className={`capital ${className}`} viewBox={`0 0 320 ${c.h}`} aria-hidden="true">
      <defs>
        {mask('b', c.backMask)}
        {mask('m', c.midMask)}
      </defs>
      <g className="capital__hi">{art}</g>
      <g className="capital__key">{art}</g>
    </svg>
  );
}
