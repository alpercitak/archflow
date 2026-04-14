import { useEffect, type DragEvent, type MouseEvent as ReactMouseEvent, type RefObject } from 'react';
import { useSetAtom, useStore } from 'jotai';
import { useCanvasCoords } from './canvas-coords';
import { useNodeDrag } from './node-drag';
import { useCanvasPan } from './canvas-pan';
import { cursorWorldAtom } from '@/stores/cursor';
import { contextMenuAtom } from '@/stores/context-menu';
import {
  addNodeActionAtom,
  cancelConnectingActionAtom,
  pendingConnectionAtom,
  selectedNodeIdAtom,
} from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';
import { toolModeAtom } from '@/stores/canvas';
import type { DiagramNode } from '@/types';

export const useCanvasEvents = (wrapperRef: RefObject<HTMLDivElement | null>) => {
  const { startDrag, onMouseMove: dragMove, onMouseUp: dragUp } = useNodeDrag();
  const { startPan, onMouseMove: panMove, onMouseUp: panUp } = useCanvasPan();
  const { canvasCoords } = useCanvasCoords(wrapperRef);

  const store = useStore();
  const setContextMenu = useSetAtom(contextMenuAtom);
  const setCursorWorld = useSetAtom(cursorWorldAtom);
  const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
  const cancelConnecting = useSetAtom(cancelConnectingActionAtom);
  const addNode = useSetAtom(addNodeActionAtom);
  const showToast = useSetAtom(showToastAtom);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      dragMove(e);
      panMove(e);
      setCursorWorld(canvasCoords(e.clientX, e.clientY));
    };

    const onMouseUp = () => {
      dragUp();
      panUp();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    setContextMenu(null);
    if (e.button === 1 || store.get(toolModeAtom) === 'pan') {
      startPan(e);
      e.preventDefault();
      return;
    }
    if (e.button === 0) {
      if (store.get(pendingConnectionAtom)) {
        cancelConnecting();
        return;
      }
      setSelectedNodeId(null);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    try {
      const item = JSON.parse(raw) as DiagramNode;
      const pos = canvasCoords(e.clientX, e.clientY);
      addNode({ item, x: pos.x - 65, y: pos.y - 30 });
    } catch {
      showToast('Drop failed');
    }
  };

  return { startDrag, onMouseDown, onDrop };
};
