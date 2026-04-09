import type { DiagramNode, Position } from '@/types';

// TODO: offsets as relative constants
export const getNodeCenter = (node: DiagramNode): Position => {
  return { x: node.x + 74, y: node.y + 36 };
};
