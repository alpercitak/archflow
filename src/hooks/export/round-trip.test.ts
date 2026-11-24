import { parseDiagram } from '@/hooks/import';
import { importJson } from '@/hooks/import/import-json';
import { importYaml } from '@/hooks/import/import-yaml';
import { DEFAULT_EDGES, DEFAULT_NODES } from '@/stores/diagram/constants';
import type { DiagramNode } from '@/types';
import { describe, expect, test } from 'bun:test';
import { exportJson } from './export-json';
import { exportYaml } from './export-yaml';
import type { ExportResult } from './types';

// Covers every optional field, including one cleared to undefined as the inspector does.
const nodes: Array<DiagramNode> = [
  ...DEFAULT_NODES,
  {
    id: 100,
    type: 'service',
    label: 'Edge "case": A & B',
    meta: 'multi\nline',
    tag: 'gRPC',
    x: 12.5,
    y: -40,
    load: 10,
    capacity: 250,
    latencyMs: undefined,
    profile: { kind: 'spike', peak: 500, startS: 5, durationS: 10 },
    fault: { health: 'degraded', startS: 2, durationS: 8 },
  },
];
const edges = DEFAULT_EDGES.map((edge, i) => ({ ...edge, label: i === 0 ? 'HTTPS: 443' : edge.label }));

const text = (result: ExportResult): Promise<string> => {
  if (!result) {
    throw new Error('expected an export');
  }
  return result.blob.text();
};

describe('export → import round trip', () => {
  test('JSON', async () => {
    expect(parseDiagram(importJson(await text(exportJson(nodes, edges))))).toEqual({ nodes, edges });
  });

  test('YAML', async () => {
    expect(parseDiagram(importYaml(await text(exportYaml(nodes, edges))))).toEqual({ nodes, edges });
  });
});
