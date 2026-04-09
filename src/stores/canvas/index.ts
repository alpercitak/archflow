import { atom } from 'jotai';

type ToolMode = 'select' | 'pan';

const INITIAL_PAN_X = 30 as const;
const INITIAL_PAN_Y = 30 as const;
const INITIAL_ZOOM = 0.85 as const;

export const zoomAtom = atom<number>(INITIAL_ZOOM);
export const panXAtom = atom<number>(INITIAL_PAN_X);
export const panYAtom = atom<number>(INITIAL_PAN_Y);
export const toolModeAtom = atom<ToolMode>('select');

export const resetViewAtom = atom(null, (_, set) => {
  set(zoomAtom, INITIAL_ZOOM);
  set(panXAtom, INITIAL_PAN_X);
  set(panYAtom, INITIAL_PAN_Y);
});
