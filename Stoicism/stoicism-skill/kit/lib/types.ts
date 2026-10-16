// Shapes of the two rolled modules (src/theme.ts, src/chart.ts). roll.mjs writes values of
// these types; kit code and authored components read them. Never widen them by hand.

export interface Ink {
  name: string;
  code: string;
  hex: string;
}

export interface Theme {
  seed: string;
  /** CSS tokens as hex, mirrored in src/styles/tokens.css */
  palette: {
    midnight: string;
    indigo: string;
    blue: string;
    periwinkle: string;
    periSoft: string;
    lavender: string;
    mist: string;
    paper: string;
    /** the key ink the finale's dust is printed in */
    dust: string;
  };
  /** the five-step print ramp every shader maps luminance onto, darkest first */
  ramp: readonly [string, string, string, string, string];
  /** the second-drum inks; [0] is the one the site opens with */
  inks: readonly Ink[];
  /** family names, for canvas text (the dust inscription) */
  fonts: { display: string; serif: string; mono: string };
  temple: {
    /** columns across the front and down the flank, corners counted twice */
    columns: readonly [number, number];
    /** true puts the monument on the left of the screen and the name on the right */
    mirror: boolean;
  };
}

export type SectionType =
  | "hero"
  | "manifesto"
  | "colonnade"
  | "orders"
  | "press"
  | "ascent"
  | "finale";

/** a section's paper colour, named after its CSS token */
export type Ground = "periSoft" | "mist" | "lavender" | "midnight";

export interface ChartSection {
  /** the element id; nav, ink level and anchors use it */
  id: string;
  type: SectionType;
  /** 1-based chapter number among the nav sections (0 for hero and manifesto) */
  n: number;
  /** n as a Roman numeral, '' when n is 0 */
  numeral: string;
  /** chapter label, used in the nav, menu, ink level and section head */
  label: string;
  ground: Ground;
  /** the ground of the section below; the bottom Dither hands over to it (null on the last) */
  next: Ground | null;
  /** listed in the nav and the ink level */
  nav: boolean;
}

/** Macro composition: these change the silhouette, not just decoration. */
export interface Composition {
  hero: "monument" | "diptych" | "broadside" | "aperture" | "index";
  collection: "portico" | "editorial" | "catalog";
  ending: "facade" | "colophon" | "split";
  navigation: "chapters" | "masthead" | "rail";
  rhythm: "processional" | "editorial" | "compact";
}

export interface Layout {
  hero: { side: "left" | "right" };
  manifesto: { pills: 1 | 2 | 3; plate: boolean; numeral: boolean };
  colonnade: { count: number; shape: "arch" | "pill"; stagger: boolean };
  orders: { rise: "stepped" | "level"; marquee: boolean };
  press: { frame: "left" | "right" };
  ascent: { steps: number };
  finale: { greeting: string; plate: boolean };
  chrome: { level: "left" | "right" };
}
