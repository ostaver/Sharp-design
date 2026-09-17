import { useSyncExternalStore } from 'react';

// The site-wide highlight drum. Changing it re-inks the temple, every image plane and all
// misregistered type at once.
let current = '#F6D0EA';
const subs = new Set();

export const hexToVec = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export function setInk(hex) {
  current = hex;
  document.documentElement.style.setProperty('--ink-hi', hex);
  subs.forEach((fn) => fn(hex));
}

export const getInk = () => current;

export function subscribeInk(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export const useInk = () => useSyncExternalStore(subscribeInk, getInk);
