import { atom } from 'jotai';
import type { Position } from '@/types';

type ContextMenuState = Position & ({ nodeId: number } | { edgeId: number });

export const contextMenuAtom = atom<ContextMenuState | null>(null);
