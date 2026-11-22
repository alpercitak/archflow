import {
  DEGRADED_CAPACITY_FACTOR,
  DEGRADED_LATENCY_FACTOR,
  MAX_QUEUE_FACTOR,
  SIM_DEFAULTS,
  WARN_UTILIZATION,
} from '@/stores/simulation/constants';
import type { DiagramEdge, DiagramNode, NodeHealth, NodeType, SimNodeResult, SimResult, SimStatus } from '@/types';
import { loadAt } from '@/utils/load-at';

type SimNode = DiagramNode & { type: Exclude<NodeType, 'note'> };
type Link = { edge: DiagramEdge; from: SimNode; to: SimNode };

const IDLE: SimNodeResult = { inRps: 0, utilization: 0, status: 'idle', latencyMs: 0 };

const isSimNode = (node: DiagramNode): node is SimNode => node.type !== 'note';

const paramsOf = (node: SimNode, t: number, health: NodeHealth | undefined) => {
  const defaults = SIM_DEFAULTS[node.type];
  const capacity = node.capacity ?? defaults.capacity;
  const latencyMs = node.latencyMs ?? defaults.latencyMs;
  const degraded = health === 'degraded';
  return {
    load: loadAt(node.load ?? defaults.load, node.profile, t),
    capacity: degraded ? capacity * DEGRADED_CAPACITY_FACTOR : capacity,
    latencyMs: degraded ? latencyMs * DEGRADED_LATENCY_FACTOR : latencyMs,
  };
};

const statusOf = (inRps: number, utilization: number): SimStatus => {
  if (inRps === 0) {
    return 'idle';
  }
  if (utilization > 1) {
    return 'overloaded';
  }
  return utilization >= WARN_UTILIZATION ? 'warn' : 'ok';
};

const queueFactor = (utilization: number): number =>
  utilization >= 1 ? MAX_QUEUE_FACTOR : Math.min(1 / (1 - utilization), MAX_QUEUE_FACTOR);

/**
 * Pushes client request rates at time t (seconds) through the diagram in topological order and estimates latency per node and per client.
 * Down nodes drop all inbound traffic; traffic splits across healthy targets when any exist.
 */
export const simulate = (
  nodes: Array<DiagramNode>,
  edges: Array<DiagramEdge>,
  t = 0,
  health: ReadonlyMap<number, NodeHealth> = new Map(),
): SimResult => {
  const active = nodes.filter(isSimNode);
  const byId = new Map(active.map((n) => [n.id, n] as const));
  const links: Array<Link> = edges.flatMap((edge) => {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    return from && to ? [{ edge, from, to }] : [];
  });

  // Kahn's algorithm: nodes never reaching zero in-degree sit in or downstream of a cycle.
  const indegree = new Map<number, number>();
  for (const { to } of links) {
    indegree.set(to.id, (indegree.get(to.id) ?? 0) + 1);
  }
  const sorted = active.filter((n) => !indegree.has(n.id));
  for (const node of sorted) {
    for (const link of links) {
      if (link.from !== node) {
        continue;
      }
      const remaining = (indegree.get(link.to.id) ?? 0) - 1;
      indegree.set(link.to.id, remaining);
      if (remaining === 0) {
        sorted.push(link.to);
      }
    }
  }
  const ordered = new Set(sorted);
  const flowing = links.filter((l) => ordered.has(l.from) && ordered.has(l.to));
  const cycleNodeIds = active.filter((n) => !ordered.has(n)).map((n) => n.id);

  const inbound = new Map<number, number>();
  const edgeRps = new Map(links.map(({ edge }) => [edge.id, 0]));
  const results: Array<{ node: SimNode; result: SimNodeResult; targets: Array<Link> }> = [];
  let throughputRps = 0;
  let droppedRps = 0;
  for (const node of sorted) {
    const nodeHealth = health.get(node.id);
    const down = nodeHealth === 'down';
    const { load, capacity, latencyMs } = paramsOf(node, t, nodeHealth);
    const generated = node.type === 'client' && !down ? load : 0;
    const inRps = generated + (inbound.get(node.id) ?? 0);
    const processed = down ? 0 : Math.min(inRps, capacity);
    droppedRps += inRps - processed;

    const outs = flowing.filter((l) => l.from === node);
    const liveOuts = outs.filter((l) => health.get(l.to.id) !== 'down');
    const targets = liveOuts.length > 0 ? liveOuts : outs;
    if (outs.length === 0 && node.type !== 'client') {
      throughputRps += processed;
    }
    for (const link of outs) {
      const share = targets.includes(link) ? processed / targets.length : 0;
      edgeRps.set(link.edge.id, share);
      inbound.set(link.to.id, (inbound.get(link.to.id) ?? 0) + share);
    }

    const utilization = down || inRps === 0 || capacity === Number.POSITIVE_INFINITY ? 0 : inRps / capacity;
    results.push({
      node,
      targets,
      result: down
        ? { inRps, utilization: 0, status: 'down', latencyMs: 0 }
        : {
            inRps,
            utilization,
            status: statusOf(inRps, utilization),
            latencyMs: latencyMs * queueFactor(utilization),
          },
    });
  }

  const expected = new Map<number, number>();
  for (const { node, result, targets } of results.toReversed()) {
    const downstream =
      targets.length === 0 ? 0 : targets.reduce((sum, l) => sum + (expected.get(l.to.id) ?? 0), 0) / targets.length;
    expected.set(node.id, result.latencyMs + downstream);
  }

  const nodeResults = new Map(active.map((n) => [n.id, IDLE] as const));
  for (const { node, result } of results) {
    nodeResults.set(node.id, result);
  }
  const clientLatencyMs = new Map<number, number>();
  for (const { node } of results) {
    if (node.type === 'client') {
      clientLatencyMs.set(node.id, expected.get(node.id) ?? 0);
    }
  }

  return {
    nodes: nodeResults,
    edges: edgeRps,
    clientLatencyMs,
    throughputRps,
    droppedRps,
    cycleNodeIds,
  };
};
