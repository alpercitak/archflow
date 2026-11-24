import type { DiagramNode } from '@/types';
import { sameSimInputs } from '@/utils/same-sim-inputs';
import { describe, expect, test } from 'bun:test';

const node: DiagramNode = { id: 1, type: 'service', label: 'API', meta: '', tag: '', x: 0, y: 0, capacity: 100 };

describe('sameSimInputs', () => {
  test('ignores position and label', () => {
    expect(sameSimInputs([node], [{ ...node, x: 50, y: 80, label: 'Renamed' }])).toBe(true);
  });

  test('detects simulation changes', () => {
    expect(sameSimInputs([node], [{ ...node, capacity: 200 }])).toBe(false);
    expect(sameSimInputs([node], [node, { ...node, id: 2 }])).toBe(false);
  });
});
