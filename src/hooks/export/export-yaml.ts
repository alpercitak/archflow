import { dump } from 'js-yaml';
import type { DiagramEdge, DiagramNode } from '@/types';
import type { ExportResult } from './types';

export const exportYaml = (nodes: Array<DiagramNode>, edges: Array<DiagramEdge>): ExportResult => ({
  blob: new Blob([dump({ nodes, edges })], { type: 'text/yaml' }),
  extension: 'yaml',
});
