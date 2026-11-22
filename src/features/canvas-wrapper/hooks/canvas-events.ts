import { useSetAtom } from 'jotai';
import { type DragEvent, type MouseEvent as ReactMouseEvent, type RefObject, useEffect } from 'react';
import { contextMenuAtom } from '@/stores/context-menu';
import { cursorWorldAtom } from '@/stores/cursor';
import { addNodeActionAtom, cancelConnectingActionAtom, selectedNodeIdAtom } from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';
import { isNodeTemplate } from '@/utils/diagram-guards';
import { useCanvasCoords } from './canvas-coords';
import { useCanvasPan } from './canvas-pan';
import { useNodeDrag } from './node-drag';

export const useCanvasEvents = (wrapperRef: RefObject<HTMLDivElement | null>) => {
  const { startDrag, onMouseMove: dragMove, onMouseUp: dragUp, dragRef } = useNodeDrag();
  const { startPan, onMouseMove: panMove, onMouseUp: panUp } = useCanvasPan();
  const { canvasCoords } = useCanvasCoords(wrapperRef);

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
  }, [panUp, dragMove, setCursorWorld, panMove, dragUp, canvasCoords]);

  const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    setContextMenu(null);
    if (dragRef.current) {
      return;
    }
    cancelConnecting();
    setSelectedNodeId(null);
    startPan(e);
    e.preventDefault();
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    let item: unknown;
    try {
      item = JSON.parse(raw);
    } catch {
      showToast('Drop failed');
      return;
    }
    if (!isNodeTemplate(item)) {
      showToast('Drop failed');
      return;
    }
    const pos = canvasCoords(e.clientX, e.clientY);
    addNode({ item, x: pos.x - 65, y: pos.y - 30 });
  };

  return { startDrag, onMouseDown, onDrop };
};
