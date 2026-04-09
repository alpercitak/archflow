import { atom } from 'jotai';
import type { Position } from '@/types';

export const cursorWorldAtom = atom<Position>({ x: 0, y: 0 });
