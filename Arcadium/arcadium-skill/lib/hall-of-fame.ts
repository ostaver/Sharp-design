/* The Breakout cabinet talks to the Ledger: file your initials after a game
   and the house machine writes a live row onto tonight's sheet. */

export interface FameEntry {
  ini: string;
  score: number;
  stamp: string;
}

let latest: FameEntry | null = null;
const subs = new Set<(e: FameEntry) => void>();

export function fileScore(ini: string, score: number) {
  latest = {
    ini,
    score,
    stamp: new Date()
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .toUpperCase(),
  };
  subs.forEach((fn) => fn(latest!));
}

export function getLatest(): FameEntry | null {
  return latest;
}

export function onFile(fn: (e: FameEntry) => void): () => void {
  subs.add(fn);
  return () => subs.delete(fn);
}
