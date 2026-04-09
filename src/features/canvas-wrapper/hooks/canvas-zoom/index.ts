import { useCallback, type RefObject, type WheelEvent } from 'react';
import { useSetAtom, useStore } from 'jotai';
import { panXAtom, panYAtom, zoomAtom } from '@/stores/canvas';
import { clamp } from '@/utils/clamp';

export function useCanvasZoom(canvasWrapperRef: RefObject<HTMLDivElement | null>) {
  const store = useStore();
  const setZoom = useSetAtom(zoomAtom);
  const setPanX = useSetAtom(panXAtom);
  const setPanY = useSetAtom(panYAtom);

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = canvasWrapperRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const zoom = store.get(zoomAtom);
    const panX = store.get(panXAtom);
    const panY = store.get(panYAtom);
    const delta = -e.deltaY * 0.001;
    const nextZoom = clamp(zoom + delta * zoom, 0.2, 3);
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setZoom(nextZoom);
    setPanX(mx - (mx - panX) * (nextZoom / zoom));
    setPanY(my - (my - panY) * (nextZoom / zoom));
  }, []);

  return { handleWheel };
}
