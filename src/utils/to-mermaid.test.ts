import { DEFAULT_EDGES, DEFAULT_NODES } from '@/stores/diagram/constants';
import type { DiagramEdge, DiagramNode, NodeType } from '@/types';
import { toMermaid } from '@/utils/to-mermaid';
import { describe, expect, test } from 'bun:test';

const node = (id: number, type: NodeType, label: string, meta = ''): DiagramNode => ({
  id,
  type,
  label,
  meta,
  tag: '',
  x: 0,
  y: 0,
});

const edge = (id: number, from: number, to: number, label = ''): DiagramEdge => ({
  id,
  from,
  to,
  label,
  fromPort: 'right',
  toPort: 'left',
});

const linesOf = (output: string): Array<string> => output.trimEnd().split('\n');

describe('toMermaid', () => {
  test('uses the Mermaid shape for each node type', () => {
    const lines = linesOf(
      toMermaid(
        [
          node(1, 'client', 'Client'),
          node(2, 'gateway', 'Gateway'),
          node(3, 'lb', 'LB'),
          node(4, 'db', 'DB'),
          node(5, 'storage', 'Storage'),
          node(6, 'queue', 'Queue'),
          node(7, 'cache', 'Cache'),
          node(8, 'service', 'Service'),
          node(9, 'cdn', 'CDN'),
          node(10, 'ext', 'Ext'),
        ],
        [],
      ),
    );

    expect(lines.slice(1)).toEqual([
      '  n1(["Client"])',
      '  n2{{"Gateway"}}',
      '  n3{{"LB"}}',
      '  n4[("DB")]',
      '  n5[("Storage")]',
      '  n6[["Queue"]]',
      '  n7(("Cache"))',
      '  n8["Service"]',
      '  n9["CDN"]',
      '  n10["Ext"]',
    ]);
  });

  test('adds meta on a second line when present', () => {
    expect(linesOf(toMermaid([node(1, 'service', 'Auth', 'JWT / OAuth2')], []))[1]).toBe(
      '  n1["Auth<br/>JWT / OAuth2"]',
    );
  });

  test('writes edges with and without a label', () => {
    const output = toMermaid(
      [node(1, 'client', 'A'), node(2, 'service', 'B')],
      [edge(1, 1, 2, 'HTTPS'), edge(2, 2, 1)],
    );

    expect(linesOf(output).slice(3)).toEqual(['  n1 -->|"HTTPS"| n2', '  n2 --> n1']);
  });

  test('escapes quotes and replaces newlines in text', () => {
    const output = toMermaid([node(1, 'service', 'Say "hi"\nthere', 'a "quoted" meta')], [edge(1, 1, 1, 'say "x"')]);

    expect(linesOf(output)[1]).toBe('  n1["Say #quot;hi#quot; there<br/>a #quot;quoted#quot; meta"]');
    expect(linesOf(output)[2]).toBe('  n1 -->|"say #quot;x#quot;"| n1');
  });

  test('skips notes and edges touching a note or a missing node', () => {
    const output = toMermaid(
      [node(1, 'client', 'A'), node(2, 'note', 'Remember'), node(3, 'service', 'B')],
      [edge(1, 1, 2), edge(2, 2, 3), edge(3, 1, 99), edge(4, 1, 3)],
    );

    expect(linesOf(output)).toEqual(['flowchart LR', '  n1(["A"])', '  n3["B"]', '  n1 --> n3']);
  });

  test('renders the default diagram', () => {
    const output = toMermaid(DEFAULT_NODES, DEFAULT_EDGES);
    const lines = linesOf(output);
    const nodeLines = lines.slice(1).filter((line) => !line.includes('-->'));
    const edgeLines = lines.filter((line) => line.includes('-->'));

    expect(output.startsWith('flowchart LR\n')).toBe(true);
    expect(output.endsWith('\n')).toBe(true);
    expect(nodeLines).toHaveLength(12);
    expect(edgeLines).toHaveLength(12);
  });
});
