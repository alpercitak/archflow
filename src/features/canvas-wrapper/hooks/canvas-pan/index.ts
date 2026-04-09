import { useCallback, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { panXAtom, panYAtom } from '@/stores/canvas';

type PanRef = {
  lastX: number;
  lastY: number;
};

export function useCanvasPan() {
  const setPanX = useSetAtom(panXAtom);
  const setPanY = useSetAtom(panYAtom);
  const panRef = useRef<PanRef | null>(null);

  const startPan = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    panRef.current = { lastX: e.clientX, lastY: e.clientY };
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const pan = panRef.current;
      if (!pan) {
        return;
      }
      setPanX((x) => x + e.clientX - pan.lastX);
      setPanY((y) => y + e.clientY - pan.lastY);
      panRef.current = { lastX: e.clientX, lastY: e.clientY };
    },
    [setPanX, setPanY],
  );

  const onMouseUp = useCallback(() => {
    panRef.current = null;
  }, []);

  return { startPan, onMouseMove, onMouseUp };
}
