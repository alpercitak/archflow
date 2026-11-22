import type { DiagramEdge, DiagramNode } from '@/types';
import { toMermaid } from '@/utils/to-mermaid';
import type { ExportResult } from './types';

export const exportMermaid = (nodes: Array<DiagramNode>, edges: Array<DiagramEdge>): ExportResult => {
  if (nodes.every((node) => node.type === 'note')) {
    return null;
  }

  return {
    blob: new Blob([toMermaid(nodes, edges)], { type: 'text/plain' }),
    extension: 'mmd',
  };
};
