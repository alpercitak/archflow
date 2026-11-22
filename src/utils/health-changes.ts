import type { NodeHealth, SimEvent } from '@/types';

/** Events for every node whose effective health differs between two snapshots; a node that no longer has health is 'recovered'. */
export const healthChanges = (
  before: ReadonlyMap<number, NodeHealth>,
  after: ReadonlyMap<number, NodeHealth>,
  t: number,
): Array<SimEvent> => {
  const nodeIds = new Set([...before.keys(), ...after.keys()]);
  return [...nodeIds].flatMap((nodeId) => {
    const next = after.get(nodeId);
    if (before.get(nodeId) === next) {
      return [];
    }
    return [{ t, nodeId, health: next ?? 'recovered' }];
  });
};
