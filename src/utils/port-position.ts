import { FALLBACK_NODE_SIZE } from '@/stores/diagram/constants';
import type { NodeSize } from '@/stores/diagram/index.types';
import type { DiagramNode, Port, Position } from '@/types';

export const getPortPosition = (node: DiagramNode, port: Port, size: NodeSize = FALLBACK_NODE_SIZE): Position => {
  const { width: w, height: h } = size;

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
