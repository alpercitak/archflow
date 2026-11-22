import { DEFAULT_NODES } from '@/stores/diagram/constants';
import type { DiagramNode } from '@/types';

export interface Scenario {
  id: string;
  label: string;
  nodes: Array<DiagramNode>;
}

const withPatches = (patches: Partial<Record<number, Partial<DiagramNode>>>): Array<DiagramNode> =>
  DEFAULT_NODES.map((node) => ({ ...node, ...patches[node.id] }));

export const SCENARIOS: Array<Scenario> = [
  {
    id: 'spike',
    label: 'Traffic spike',
    nodes: withPatches({
      1: { profile: { kind: 'spike', peak: 1500, startS: 5, durationS: 25 } },
      2: { profile: { kind: 'ramp', peak: 600, startS: 0, durationS: 30 } },
    }),
  },
  {
    id: 'cascade',
    label: 'Service failure',
    nodes: withPatches({
      1: { profile: { kind: 'ramp', peak: 400, startS: 0, durationS: 20 } },
      2: { profile: { kind: 'ramp', peak: 400, startS: 0, durationS: 20 } },
      6: { fault: { health: 'down', startS: 10, durationS: 30 } },
    }),
  },
];
