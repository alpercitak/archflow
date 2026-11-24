import type { DiagramEdge, DiagramNode } from '@/types';
import { describe, expect, test } from 'bun:test';
import { exportSvg } from './export-svg';

const node = (id: number, x: number, label = `Node ${id}`): DiagramNode => ({
  id,
  type: 'service',
  label,
  meta: '',
  tag: '',
  x,
  y: 0,
});

const edge = (id: number, from: number, to: number, label = ''): DiagramEdge => ({
  id,
  from,
  to,
  fromPort: 'right',
  toPort: 'left',
  label,
});

const render = async (nodes: Array<DiagramNode>, edges: Array<DiagramEdge> = []): Promise<string> => {
  const result = exportSvg(nodes, edges, new Map([[1, { width: 100, height: 50 }]]));
  if (!result) {
    throw new Error('expected an export');
  }
  return result.blob.text();
};

describe('exportSvg', () => {
  test('returns null for an empty diagram', () => {
    expect(exportSvg([], [], new Map())).toBeNull();
  });

  test('fits the view box to measured and fallback node sizes plus padding', async () => {
    // Node 1 is measured at 100x50; node 2 falls back to 140x80.
    const svg = await render([node(1, 0), node(2, 200)]);
    expect(svg).toContain('viewBox="-48 -48 436 176"');
  });

  test('escapes labels and drops characters XML does not allow', async () => {
    const svg = await render([node(1, 0, 'A & <B>\u0001')], []);
    expect(svg).toContain('A &amp; &lt;B&gt;</text>');
    expect(svg).not.toContain('\u0001');
  });

  test('skips edges to missing nodes', async () => {
    const svg = await render([node(1, 0), node(2, 200)], [edge(1, 1, 2, 'calls'), edge(2, 1, 99, 'dangling')]);
    expect(svg.match(/<path /g)).toHaveLength(1);
    expect(svg).toContain('>calls</text>');
    expect(svg).not.toContain('dangling');
  });
});
