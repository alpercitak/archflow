import { DEFAULT_EDGES, DEFAULT_NODES } from '@/stores/diagram/constants';
import { SIM_DEFAULTS } from '@/stores/simulation/constants';
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

  test('a fan-out service sends its full traffic to every target', () => {
    const result = simulate(
      [node(1, 'client', { load: 100 }), node(2, 'service'), node(3, 'db'), node(4, 'queue')],
      [edge(1, 1, 2), edge(2, 2, 3), edge(3, 2, 4)],
    );
    expect(result.edges.get(2)).toBe(100);
    expect(result.edges.get(3)).toBe(100);
    expect(result.nodes.get(3)?.inRps).toBe(100);
    expect(result.nodes.get(4)?.inRps).toBe(100);
  });

  test('a fan-out service does not fail over when a target is down', () => {
    const result = simulate(
      [node(1, 'client', { load: 100 }), node(2, 'service'), node(3, 'db'), node(4, 'queue')],
      [edge(1, 1, 2), edge(2, 2, 3), edge(3, 2, 4)],
      0,
      new Map([[3, 'down']]),
    );
    expect(result.edges.get(2)).toBe(100);
    expect(result.edges.get(3)).toBe(100);
    expect(result.nodes.get(3)?.status).toBe('down');
    expect(result.throughputRps).toBe(0);
    expect(result.droppedRps).toBe(100);
  });

  test('fan-out latency follows the slowest branch', () => {
    const result = simulate(
      [node(1, 'client', { load: 10 }), node(2, 'service'), node(3, 'db'), node(4, 'queue')],
      [edge(1, 1, 2), edge(2, 2, 3), edge(3, 2, 4)],
    );
    const svc = result.nodes.get(2)?.latencyMs ?? 0;
    const db = result.nodes.get(3)?.latencyMs ?? 0;
    expect(result.clientLatencyMs.get(1)).toBeCloseTo(svc + db);
  });

  test('a partially overloaded fan-out branch lowers throughput', () => {
    const result = simulate(
      [
        node(1, 'client', { load: 100 }),
        node(2, 'service', { capacity: 1000 }),
        node(3, 'db', { capacity: 50 }),
        node(4, 'cache', { capacity: 1000 }),
      ],
      [edge(1, 1, 2), edge(2, 2, 3), edge(3, 2, 4)],
    );
    expect(result.throughputRps).toBe(50);
    expect(result.droppedRps).toBe(50);
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

  test('a client load profile changes client load at the given time', () => {
    const nodes = [
      node(1, 'client', { load: 100, profile: { kind: 'ramp', peak: 300, startS: 0, durationS: 10 } }),
      node(2, 'service', { capacity: 1000 }),
    ];
    const edges = [edge(1, 1, 2)];
    expect(simulate(nodes, edges, 5).nodes.get(2)?.inRps).toBeCloseTo(200);
    expect(simulate(nodes, edges).nodes.get(2)?.inRps).toBe(100);
  });

  test('a down service drops all its inbound traffic', () => {
    const result = simulate(
      [node(1, 'client', { load: 100 }), node(2, 'service', { capacity: 300 })],
      [edge(1, 1, 2)],
      0,
      new Map([[2, 'down']]),
    );
    expect(result.nodes.get(2)).toEqual({ inRps: 100, utilization: 0, status: 'down', latencyMs: 0 });
    expect(result.droppedRps).toBe(100);
    expect(result.throughputRps).toBe(0);
  });

  test('a load balancer sends all traffic to the healthy service when the other is down', () => {
    const result = simulate(
      [node(1, 'client', { load: 100 }), node(2, 'lb'), node(3, 'service'), node(4, 'service')],
      [edge(1, 1, 2), edge(2, 2, 3), edge(3, 2, 4)],
      0,
      new Map([[3, 'down']]),
    );
    expect(result.edges.get(2)).toBe(0);
    expect(result.edges.get(3)).toBe(100);
    expect(result.nodes.get(3)?.status).toBe('down');
    expect(result.nodes.get(4)?.inRps).toBe(100);
    expect(result.droppedRps).toBe(0);
    const lb = result.nodes.get(2)?.latencyMs ?? 0;
    const svc = result.nodes.get(4)?.latencyMs ?? 0;
    expect(result.clientLatencyMs.get(1)).toBeCloseTo(lb + svc);
  });

  test('when every target of a load balancer is down, all traffic is dropped', () => {
    const result = simulate(
      [node(1, 'client', { load: 100 }), node(2, 'lb'), node(3, 'service'), node(4, 'service')],
      [edge(1, 1, 2), edge(2, 2, 3), edge(3, 2, 4)],
      0,
      new Map([
        [3, 'down'],
        [4, 'down'],
      ]),
    );
    expect(result.throughputRps).toBe(0);
    expect(result.droppedRps).toBe(100);
  });

  test('a degraded service has half capacity', () => {
    const result = simulate(
      [node(1, 'client', { load: 200 }), node(2, 'service', { capacity: 300 })],
      [edge(1, 1, 2)],
      0,
      new Map([[2, 'degraded']]),
    );
    expect(result.nodes.get(2)?.status).toBe('overloaded');
    expect(result.droppedRps).toBe(50);
    expect(result.throughputRps).toBe(150);
  });

  test('a down client generates no load', () => {
    const result = simulate(
      [node(1, 'client', { load: 100 }), node(2, 'service', { capacity: 300 })],
      [edge(1, 1, 2)],
      0,
      new Map([[1, 'down']]),
    );
    expect(result.nodes.get(2)?.inRps).toBe(0);
    expect(result.droppedRps).toBe(0);
  });

  test('default diagram runs and every client has a finite latency', () => {
    const result = simulate(DEFAULT_NODES, DEFAULT_EDGES);
    for (const client of DEFAULT_NODES.filter((n) => n.type === 'client')) {
      expect(Number.isFinite(result.clientLatencyMs.get(client.id))).toBe(true);
    }
  });

  test('default diagram: payment service calls PostgreSQL with its full capped traffic', () => {
    const result = simulate(DEFAULT_NODES, DEFAULT_EDGES);
    const payment = result.nodes.get(8);
    expect(result.edges.get(10)).toBeCloseTo(Math.min(payment?.inRps ?? 0, SIM_DEFAULTS.service.capacity));
  });
});
