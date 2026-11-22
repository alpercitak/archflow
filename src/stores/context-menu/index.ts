import { atom } from 'jotai';
import type { Position } from '@/types';

interface ContextMenuState extends Position {
  nodeId: number;
}

export const contextMenuAtom = atom<ContextMenuState | null>(null);
