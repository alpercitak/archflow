import type { DiagramEdge, DiagramNode, Position } from '@/types';

export interface NodeSize {
  width: number;
  height: number;
}

export interface AddNodeArgs extends Partial<Position> {
  item: Omit<DiagramNode, 'id' | 'x' | 'y' | 'tag'> & { tag?: string };
}

export interface UpdateNodeArgs {
  nodeId: number;
  updater: (prev: DiagramNode) => DiagramNode;
  // Consecutive updates with the same key are one undo step; without a key, each update is its own step.
  historyKey?: string;
}

export interface DiagramSnapshot {
  nodes: Array<DiagramNode>;
  edges: Array<DiagramEdge>;
}
