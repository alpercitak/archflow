import type { NodeType } from '@/types';

export const SIM_DEFAULTS: Record<Exclude<NodeType, 'note'>, { load: number; capacity: number; latencyMs: number }> = {
  client: { load: 100, capacity: Number.POSITIVE_INFINITY, latencyMs: 0 },
  gateway: { load: 0, capacity: 2000, latencyMs: 5 },
  lb: { load: 0, capacity: 5000, latencyMs: 1 },
  cdn: { load: 0, capacity: 10000, latencyMs: 2 },
  service: { load: 0, capacity: 300, latencyMs: 20 },
  db: { load: 0, capacity: 500, latencyMs: 10 },
  cache: { load: 0, capacity: 5000, latencyMs: 1 },
  queue: { load: 0, capacity: 2000, latencyMs: 2 },
  storage: { load: 0, capacity: 200, latencyMs: 30 },
  ext: { load: 0, capacity: 100, latencyMs: 100 },
};

export const WARN_UTILIZATION = 0.7;
export const MAX_QUEUE_FACTOR = 20;
