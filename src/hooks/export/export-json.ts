import type { DiagramEdge, DiagramNode } from '@/types';
import type { ExportResult } from './types';

export const exportJson = (nodes: Array<DiagramNode>, edges: Array<DiagramEdge>): ExportResult => {
  const data = { nodes, edges };
  return {
    blob: new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    extension: 'json',
  };
};
