import { isEdge, isNode, isNodeTemplate } from '@/utils/diagram-guards';
import { describe, expect, test } from 'bun:test';

const template = { type: 'service', label: 'Auth Service', meta: 'JWT / OAuth2' };

const node = {
  id: 1,
  type: 'db',
  label: 'PostgreSQL',
  meta: 'Primary DB',
  tag: 'SQL',
  x: 10,
  y: 20,
};

const edge = { id: 1, label: 'reads', from: 1, to: 2, fromPort: 'right', toPort: 'left' };

describe('isNodeTemplate', () => {
  test('accepts a library item', () => {
    expect(isNodeTemplate(template)).toBe(true);
  });

  test('rejects non-object values', () => {
    expect(isNodeTemplate(42)).toBe(false);
    expect(isNodeTemplate({})).toBe(false);
    expect(isNodeTemplate(null)).toBe(false);
  });

  test('rejects an unknown type', () => {
    expect(isNodeTemplate({ ...template, type: 'x' })).toBe(false);
  });

  test('rejects a missing label', () => {
    expect(isNodeTemplate({ type: 'service', meta: 'JWT' })).toBe(false);
  });
});

describe('isNode', () => {
  test('accepts a full node without optional fields', () => {
    expect(isNode(node)).toBe(true);
  });

  test('accepts a node with optional load, capacity and latencyMs', () => {
    expect(isNode({ ...node, load: 0.5, capacity: 300, latencyMs: 12 })).toBe(true);
  });

  test('accepts a valid load profile', () => {
    expect(isNode({ ...node, profile: { kind: 'ramp', peak: 300, startS: 5, durationS: 30 } })).toBe(true);
  });

  test('rejects a load profile with an unknown kind', () => {
    expect(isNode({ ...node, profile: { kind: 'pulse', peak: 300, startS: 5, durationS: 30 } })).toBe(false);
  });

  test('rejects a load profile with a non-numeric peak', () => {
    expect(isNode({ ...node, profile: { kind: 'spike', peak: '300', startS: 5, durationS: 30 } })).toBe(false);
  });

  test('accepts a valid scripted fault', () => {
    expect(isNode({ ...node, fault: { health: 'down', startS: 10, durationS: 20 } })).toBe(true);
  });

  test('rejects a scripted fault with an unknown health', () => {
    expect(isNode({ ...node, fault: { health: 'slow', startS: 10, durationS: 20 } })).toBe(false);
  });

  test('rejects a scripted fault with a non-numeric startS', () => {
    expect(isNode({ ...node, fault: { health: 'degraded', startS: '10', durationS: 20 } })).toBe(false);
  });

  test('rejects a string capacity', () => {
    expect(isNode({ ...node, capacity: '300' })).toBe(false);
  });

  test('rejects an infinite capacity', () => {
    expect(isNode({ ...node, capacity: Number.POSITIVE_INFINITY })).toBe(false);
  });
});

describe('isEdge', () => {
  test('accepts a valid edge', () => {
    expect(isEdge(edge)).toBe(true);
  });

  test('rejects an invalid port', () => {
    expect(isEdge({ ...edge, fromPort: 'middle' })).toBe(false);
  });
});
