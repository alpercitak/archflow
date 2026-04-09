import { useCallback, type RefObject } from 'react';
import { useStore } from 'jotai';
import { panXAtom, panYAtom, zoomAtom } from '@/stores/canvas';
import type { Position } from '@/types';

export function useCanvasCoords(canvasWrapRef: RefObject<HTMLDivElement | null>) {
  const store = useStore();

  const canvasCoords = useCallback((clientX: number, clientY: number): Position => {
    const rect = canvasWrapRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }
    const zoom = store.get(zoomAtom);
    const panX = store.get(panXAtom);
    const panY = store.get(panYAtom);
    return {
      x: (clientX - rect.left - panX) / zoom,
      y: (clientY - rect.top - panY) / zoom,
    };
  }, []);

  return { canvasCoords };
}
