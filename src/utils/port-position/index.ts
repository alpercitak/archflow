import type { DiagramNode, Port, Position } from '@/types';

export const getPortPosition = (node: DiagramNode, port: Port): Position => {
  const el = document.getElementById(`node-${node.id}`);
  const w = el?.offsetWidth ?? 140;
  const h = el?.offsetHeight ?? 80;

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
