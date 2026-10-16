import type { Ground } from './types';

const TOKENS: Record<Ground, string> = {
  periSoft: 'var(--peri-soft)',
  mist: 'var(--mist)',
  lavender: 'var(--lavender)',
  midnight: 'var(--midnight)',
};

/** a ground as a CSS colour, e.g. for <Dither to={groundVar(section.next)} /> */
export const groundVar = (g: Ground): string => TOKENS[g];

/** props for a section element: its paper, and data-dark where the paper is the key ink */
export const groundProps = (g: Ground): { 'data-ground': Ground; 'data-dark'?: '' } =>
  g === 'midnight' ? { 'data-ground': g, 'data-dark': '' } : { 'data-ground': g };
