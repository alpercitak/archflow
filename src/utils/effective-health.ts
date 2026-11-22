import type { DiagramNode, NodeHealth } from '@/types';

/** Manual health overlaid with the scripted faults that are active at time t (seconds). A down node is never downgraded to degraded. */
export const effectiveHealth = (
  nodes: Array<DiagramNode>,
  health: ReadonlyMap<number, NodeHealth>,
  t: number,
): Map<number, NodeHealth> => {
  const result = new Map(health);
  for (const node of nodes) {
    const fault = node.fault;
    if (!fault || t < fault.startS || t >= fault.startS + fault.durationS) {
      continue;
    }
    if (fault.health === 'degraded' && result.get(node.id) === 'down') {
      continue;
    }
    result.set(node.id, fault.health);
  }
  return result;
};
