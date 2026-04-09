import type { Position } from '@/types';
import { atom } from 'jotai';

interface ContextMenuState extends Position {
  nodeId: number;
}

export const contextMenuAtom = atom<ContextMenuState | null>(null);
