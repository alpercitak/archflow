import { atom } from 'jotai';
import { edgesAtom, nodesAtom } from '@/stores/diagram';
import type { NodeHealth, SimSample } from '@/types';
import { simulate } from '@/utils/simulate';
import { SIM_HISTORY_SIZE, type SIM_SPEEDS } from './constants';

export type SimSpeed = (typeof SIM_SPEEDS)[number];

export const simulationEnabledAtom = atom(false);

export const simTimeAtom = atom(0);
export const simPlayingAtom = atom(false);
export const simSpeedAtom = atom<SimSpeed>(1);
export const simHistoryAtom = atom<Array<SimSample>>([]);
export const simHealthAtom = atom<ReadonlyMap<number, NodeHealth>>(new Map());

export const simulationResultAtom = atom((get) =>
  get(simulationEnabledAtom) ? simulate(get(nodesAtom), get(edgesAtom), get(simTimeAtom), get(simHealthAtom)) : null,
);

export const tickSimulationActionAtom = atom(null, (get, set, dtS: number) => {
  const t = get(simTimeAtom) + dtS;
  set(simTimeAtom, t);
  const result = get(simulationResultAtom);
  if (!result) {
    return;
  }
  const latencies = [...result.clientLatencyMs.values()];
  const latencyMs = latencies.length > 0 ? latencies.reduce((sum, ms) => sum + ms, 0) / latencies.length : 0;
  const sample: SimSample = { t, throughputRps: result.throughputRps, droppedRps: result.droppedRps, latencyMs };
  set(simHistoryAtom, (prev) => [...prev, sample].slice(-SIM_HISTORY_SIZE));
});

export const setNodeHealthActionAtom = atom(
  null,
  (get, set, { nodeId, health }: { nodeId: number; health: NodeHealth | null }) => {
    const next = new Map(get(simHealthAtom));
    if (health === null) {
      next.delete(nodeId);
    } else {
      next.set(nodeId, health);
    }
    set(simHealthAtom, next);
  },
);

export const resetSimulationActionAtom = atom(null, (_, set) => {
  set(simTimeAtom, 0);
  set(simPlayingAtom, false);
  set(simHistoryAtom, []);
  set(simHealthAtom, new Map());
});
