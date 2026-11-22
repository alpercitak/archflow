import { MAX_QUEUE_FACTOR, SIM_DEFAULTS, WARN_UTILIZATION } from '@/stores/simulation/constants';
import type { DiagramEdge, DiagramNode, NodeType, SimNodeResult, SimResult, SimStatus } from '@/types';
import { loadAt } from '@/utils/load-at';

type SimNode = DiagramNode & { type: Exclude<NodeType, 'note'> };
type Link = { edge: DiagramEdge; from: SimNode; to: SimNode };

const IDLE: SimNodeResult = { inRps: 0, utilization: 0, status: 'idle', latencyMs: 0 };

const isSimNode = (node: DiagramNode): node is SimNode => node.type !== 'note';

const paramsOf = (node: SimNode, t: number) => {
  const defaults = SIM_DEFAULTS[node.type];
  return {
    load: loadAt(node.load ?? defaults.load, node.profile, t),
    capacity: node.capacity ?? defaults.capacity,
    latencyMs: node.latencyMs ?? defaults.latencyMs,
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

/** Pushes client request rates at time t (seconds) through the diagram in topological order and estimates latency per node and per client. */
export const simulate = (nodes: Array<DiagramNode>, edges: Array<DiagramEdge>, t = 0): SimResult => {
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
  const results: Array<{ node: SimNode; result: SimNodeResult }> = [];
  let throughputRps = 0;
  let droppedRps = 0;
  for (const node of sorted) {
    const { load, capacity, latencyMs } = paramsOf(node, t);
    const inRps = (node.type === 'client' ? load : 0) + (inbound.get(node.id) ?? 0);
    const processed = Math.min(inRps, capacity);
    droppedRps += inRps - processed;

    const outs = flowing.filter((l) => l.from === node);
    if (outs.length === 0 && node.type !== 'client') {
      throughputRps += processed;
    }
    for (const { edge, to } of outs) {
      const share = processed / outs.length;
      edgeRps.set(edge.id, share);
      inbound.set(to.id, (inbound.get(to.id) ?? 0) + share);
    }

    const utilization = inRps === 0 || capacity === Number.POSITIVE_INFINITY ? 0 : inRps / capacity;
    results.push({
      node,
      result: {
        inRps,
        utilization,
        status: statusOf(inRps, utilization),
        latencyMs: latencyMs * queueFactor(utilization),
      },
    });
  }

  const expected = new Map<number, number>();
  for (const { node, result } of results.toReversed()) {
    const outs = flowing.filter((l) => l.from === node);
    const downstream =
      outs.length === 0 ? 0 : outs.reduce((sum, l) => sum + (expected.get(l.to.id) ?? 0), 0) / outs.length;
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
