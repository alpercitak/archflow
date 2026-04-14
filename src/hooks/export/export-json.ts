import type { DiagramEdge, DiagramNode } from '@/types';
import type { ExportResult } from './types';

export const exportJson = (nodes: Array<DiagramNode>, edges: Array<DiagramEdge>): ExportResult => ({
  blob: new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' }),
  extension: 'json',
});
