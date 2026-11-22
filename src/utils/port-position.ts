import type { NodeSize } from '@/stores/diagram/index.types';
import type { DiagramNode, Port, Position } from '@/types';

const FALLBACK_NODE_WIDTH = 140;
const FALLBACK_NODE_HEIGHT = 80;

export const getPortPosition = (node: DiagramNode, port: Port, size: NodeSize | undefined): Position => {
  const w = size?.width ?? FALLBACK_NODE_WIDTH;
  const h = size?.height ?? FALLBACK_NODE_HEIGHT;

  switch (port) {
    case 'top':
      return { x: node.x + w / 2, y: node.y };
    case 'bottom':
      return { x: node.x + w / 2, y: node.y + h };
    case 'left':
      return { x: node.x, y: node.y + h / 2 };
    case 'right':
      return { x: node.x + w, y: node.y + h / 2 };
  }
};
