import type { DiagramNode } from '@/types';

// Fields simulate() and effectiveHealth() read. Positions and labels are left out so dragging or renaming doesn't rerun the simulation.
const SIM_FIELDS = ['id', 'type', 'load', 'capacity', 'latencyMs', 'profile', 'fault'] as const satisfies ReadonlyArray<
  keyof DiagramNode
>;

export const sameSimInputs = (a: Array<DiagramNode>, b: Array<DiagramNode>): boolean =>
  a.length === b.length && a.every((node, i) => SIM_FIELDS.every((field) => node[field] === b[i]?.[field]));
