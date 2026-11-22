import type { DiagramNode, NodeFault } from '@/types';
import { effectiveHealth } from '@/utils/effective-health';
import { describe, expect, test } from 'bun:test';

const node = (id: number, fault?: NodeFault): DiagramNode => ({
  id,
  type: 'service',
  label: 'svc',
  meta: '',
  tag: '',
  x: 0,
  y: 0,
  fault,
});

const down: NodeFault = { health: 'down', startS: 10, durationS: 20 };

describe('effectiveHealth', () => {
  test('a fault applies only inside its window', () => {
    const nodes = [node(1, down)];
    expect(effectiveHealth(nodes, new Map(), 9.9).has(1)).toBe(false);
    expect(effectiveHealth(nodes, new Map(), 10).get(1)).toBe('down');
    expect(effectiveHealth(nodes, new Map(), 29.9).get(1)).toBe('down');
    expect(effectiveHealth(nodes, new Map(), 30).has(1)).toBe(false);
  });

  test('manual health is kept outside the fault window', () => {
    const health = new Map([[1, 'degraded' as const]]);
    expect(effectiveHealth([node(1, down)], health, 0).get(1)).toBe('degraded');
  });

  test('a degraded fault does not downgrade a manually failed node', () => {
    const fault: NodeFault = { health: 'degraded', startS: 0, durationS: 10 };
    const health = new Map([[1, 'down' as const]]);
    expect(effectiveHealth([node(1, fault)], health, 5).get(1)).toBe('down');
  });

  test('does not mutate the input health map', () => {
    const health = new Map<number, 'down' | 'degraded'>();
    effectiveHealth([node(1, down)], health, 15);
    expect(health.size).toBe(0);
  });
});
