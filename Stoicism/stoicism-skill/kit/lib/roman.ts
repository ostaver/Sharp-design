const NUMERALS: ReadonlyArray<readonly [number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

/** 2026 → 'MMXXVI'; 0 → '' (stonecutters had no zero — print 'N', nulla, yourself) */
export function roman(n: number): string {
  let out = '';
  let rest = Math.floor(n);
  for (const [v, s] of NUMERALS) {
    while (rest >= v) {
      out += s;
      rest -= v;
    }
  }
  return out;
}
