import { atom } from 'jotai';
import { edgesAtom, nodesAtom } from '@/stores/diagram';
import type { SimSample } from '@/types';
import { simulate } from '@/utils/simulate';
import { SIM_HISTORY_SIZE, type SIM_SPEEDS } from './constants';

export type SimSpeed = (typeof SIM_SPEEDS)[number];

export const simulationEnabledAtom = atom(false);

export const simTimeAtom = atom(0);
export const simPlayingAtom = atom(false);
export const simSpeedAtom = atom<SimSpeed>(1);
export const simHistoryAtom = atom<Array<SimSample>>([]);

export const simulationResultAtom = atom((get) =>
  get(simulationEnabledAtom) ? simulate(get(nodesAtom), get(edgesAtom), get(simTimeAtom)) : null,
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

export const resetSimulationActionAtom = atom(null, (_, set) => {
  set(simTimeAtom, 0);
  set(simPlayingAtom, false);
  set(simHistoryAtom, []);
});
