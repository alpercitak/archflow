import { useCallback, useRef } from 'react';
import { useSetAtom, useStore } from 'jotai';
import { updateNodeActionAtom } from '@/stores/diagram';
import { zoomAtom } from '@/stores/canvas';
import type { DiagramNode } from '@/types';

type DragRef = {
  nodeId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

export type StartDrag = (e: MouseEvent, node: DiagramNode) => void;

export const useNodeDrag = () => {
  const store = useStore();
  const updateNode = useSetAtom(updateNodeActionAtom);
  const dragRef = useRef<DragRef | null>(null);

  const startDrag = useCallback<StartDrag>((e: MouseEvent, node: DiagramNode) => {
    dragRef.current = {
      nodeId: node.id,
      startX: e.clientX,
      startY: e.clientY,
      originX: node.x,
      originY: node.y,
    };
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    const zoom = store.get(zoomAtom);
    const dx = (e.clientX - drag.startX) / zoom;
    const dy = (e.clientY - drag.startY) / zoom;
    updateNode({
      nodeId: drag.nodeId,
      updater: (n) => ({ ...n, x: drag.originX + dx, y: drag.originY + dy }),
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return { startDrag, onMouseMove, onMouseUp };
};
