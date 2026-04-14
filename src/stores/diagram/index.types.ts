import type { DiagramNode, Position } from '@/types';

export interface AddNodeArgs extends Partial<Position> {
  item: Omit<DiagramNode, 'id' | 'x' | 'y'>;
}

export interface UpdateNodeArgs {
  nodeId: number;
  updater: (prev: DiagramNode) => DiagramNode;
}
