import { DEFAULT_EDGES, DEFAULT_NODES } from '@/stores/diagram/constants';
import type { DiagramEdge, DiagramNode, NodeType } from '@/types';
import { simulate } from '@/utils/simulate';
import { describe, expect, test } from 'bun:test';

const node = (id: number, type: NodeType, extra: Partial<DiagramNode> = {}): DiagramNode => ({
  id,
  type,
  label: type,
  meta: '',
  tag: '',
  x: 0,
  y: 0,
  ...extra,
});

const edge = (id: number, from: number, to: number): DiagramEdge => ({
  id,
  from,
  to,
  fromPort: 'right',
  toPort: 'left',
  label: '',
});

describe('simulate', () => {
  test('linear flow below capacity is ok', () => {
    const result = simulate([node(1, 'client', { load: 100 }), node(2, 'service', { capacity: 300 })], [edge(1, 1, 2)]);
    const svc = result.nodes.get(2);
    expect(svc?.status).toBe('ok');
    expect(svc?.utilization).toBeCloseTo(1 / 3);
    expect(result.throughputRps).toBe(100);
    expect(result.droppedRps).toBe(0);
  });

  test('an unconnected client adds no throughput', () => {
    expect(simulate([node(1, 'client')], []).throughputRps).toBe(0);
  });

  test('overload drops excess traffic', () => {
    const result = simulate([node(1, 'client', { load: 500 }), node(2, 'service', { capacity: 300 })], [edge(1, 1, 2)]);
    expect(result.nodes.get(2)?.status).toBe('overloaded');
    expect(result.droppedRps).toBe(200);
    expect(result.throughputRps).toBe(300);
  });

  test('load balancer splits traffic evenly across outgoing edges', () => {
    const result = simulate(
      [node(1, 'client', { load: 100 }), node(2, 'lb'), node(3, 'service'), node(4, 'service')],
      [edge(1, 1, 2), edge(2, 2, 3), edge(3, 2, 4)],
    );
    expect(result.edges.get(2)).toBe(50);
    expect(result.edges.get(3)).toBe(50);
    expect(result.nodes.get(3)?.inRps).toBe(50);
    expect(result.nodes.get(4)?.inRps).toBe(50);
  });

  test('per-node load and capacity override defaults', () => {
    const result = simulate([node(1, 'client', { load: 200 }), node(2, 'service', { capacity: 500 })], [edge(1, 1, 2)]);
    expect(result.nodes.get(2)?.utilization).toBeCloseTo(0.4);
    expect(result.nodes.get(2)?.status).toBe('ok');
    expect(result.throughputRps).toBe(200);
  });

  test('notes and edges touching notes are ignored', () => {
    const result = simulate(
      [node(1, 'client', { load: 100 }), node(2, 'note'), node(3, 'service')],
      [edge(1, 1, 2), edge(2, 2, 3), edge(3, 1, 3)],
    );
    expect(result.nodes.has(2)).toBe(false);
    expect(result.edges.has(1)).toBe(false);
    expect(result.edges.has(2)).toBe(false);
    expect(result.nodes.get(3)?.inRps).toBe(100);
  });

  test('cycles are reported and do not propagate', () => {
    const result = simulate(
      [node(1, 'client', { load: 100 }), node(2, 'service'), node(3, 'service')],
      [edge(1, 1, 2), edge(2, 2, 3), edge(3, 3, 2)],
    );
    expect(result.cycleNodeIds).toEqual([2, 3]);
    expect(result.nodes.get(2)?.status).toBe('idle');
    expect(result.edges.get(1)).toBe(0);
  });

  test('client end-to-end latency sums queueing latency along the path', () => {
    const result = simulate(
      [
        node(1, 'client', { load: 100 }),
        node(2, 'gateway', { latencyMs: 5 }),
        node(3, 'service', { latencyMs: 20, capacity: 300 }),
      ],
      [edge(1, 1, 2), edge(2, 2, 3)],
    );
    expect(result.clientLatencyMs.get(1)).toBeCloseTo(5 / (1 - 0.05) + 30);
  });

  test('default diagram runs and every client has a finite latency', () => {
    const result = simulate(DEFAULT_NODES, DEFAULT_EDGES);
    for (const client of DEFAULT_NODES.filter((n) => n.type === 'client')) {
      expect(Number.isFinite(result.clientLatencyMs.get(client.id))).toBe(true);
    }
  });
});
