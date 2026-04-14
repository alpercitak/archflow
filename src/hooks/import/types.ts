import type { DiagramEdge, DiagramNode } from '@/types';

export type ImportResult = {
  nodes: Array<DiagramNode>;
  edges: Array<DiagramEdge>;
} | null;
