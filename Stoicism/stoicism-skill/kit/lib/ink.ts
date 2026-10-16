import { useSyncExternalStore } from 'react';
import { theme } from '../theme';

export { hexToVec } from './color';

// The site-wide second drum. Changing it re-inks the temple, every image plane, the dust
// and all misregistered type at once.
let current: string = theme.inks[0].hex;
const subs = new Set<(hex: string) => void>();

export function setInk(hex: string): void {
  current = hex;
  document.documentElement.style.setProperty('--ink-hi', hex);
  subs.forEach((fn) => fn(hex));
}

export const getInk = (): string => current;

export function subscribeInk(fn: (hex: string) => void): () => void {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export const useInk = (): string => useSyncExternalStore(subscribeInk, getInk, getInk);
