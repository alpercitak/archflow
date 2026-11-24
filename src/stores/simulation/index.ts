import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { edgesAtom, nodesAtom } from '@/stores/diagram';
import type { NodeHealth, SimEvent, SimSample } from '@/types';
import { stepAutoFail } from '@/utils/auto-fail';
import { effectiveHealth } from '@/utils/effective-health';
import { healthChanges } from '@/utils/health-changes';
import { sameSimInputs } from '@/utils/same-sim-inputs';
import { simulate } from '@/utils/simulate';
import { SIM_HISTORY_SIZE, type SIM_SPEEDS } from './constants';

export type SimSpeed = (typeof SIM_SPEEDS)[number];

export const simulationEnabledAtom = atom(false);

export const simTimeAtom = atom(0);
export const simPlayingAtom = atom(false);
export const simSpeedAtom = atom<SimSpeed>(1);
export const simHistoryAtom = atom<Array<SimSample>>([]);
export const simHealthAtom = atom<ReadonlyMap<number, NodeHealth>>(new Map());
export const simAutoFailAtom = atom(true);
export const simOverloadAtom = atom<ReadonlyMap<number, number>>(new Map());
export const simRecoverAtAtom = atom<ReadonlyMap<number, number>>(new Map());
export const simEventsAtom = atom<Array<SimEvent>>([]);

const simNodesAtom = selectAtom(nodesAtom, (nodes) => nodes, sameSimInputs);

export const effectiveHealthAtom = atom((get) =>
  get(simulationEnabledAtom) ? effectiveHealth(get(simNodesAtom), get(simHealthAtom), get(simTimeAtom)) : new Map(),
);

export const simulationResultAtom = atom((get) =>
  get(simulationEnabledAtom)
    ? simulate(get(simNodesAtom), get(edgesAtom), get(simTimeAtom), get(effectiveHealthAtom))
    : null,
);

export const tickSimulationActionAtom = atom(null, (get, set, dtS: number) => {
  const healthBefore = get(effectiveHealthAtom);
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

  if (get(simAutoFailAtom)) {
    const next = stepAutoFail(
      { health: get(simHealthAtom), overloadS: get(simOverloadAtom), recoverAtS: get(simRecoverAtAtom) },
      result,
      t,
      dtS,
    );
    set(simHealthAtom, next.health);
    set(simOverloadAtom, next.overloadS);
    set(simRecoverAtAtom, next.recoverAtS);
  }

  const events = healthChanges(healthBefore, get(effectiveHealthAtom), t);
  set(simEventsAtom, (prev) => [...prev, ...events].slice(-SIM_HISTORY_SIZE));
});

export const setNodeHealthActionAtom = atom(
  null,
  (get, set, { nodeId, health }: { nodeId: number; health: NodeHealth | null }) => {
    const healthBefore = get(effectiveHealthAtom);
    const next = new Map(get(simHealthAtom));
    if (health === null) {
      next.delete(nodeId);
    } else {
      next.set(nodeId, health);
    }
    set(simHealthAtom, next);
    // A manual change overrides any pending auto-fail crash or recovery for this node.
    set(simOverloadAtom, (prev) => new Map([...prev].filter(([id]) => id !== nodeId)));
    set(simRecoverAtAtom, (prev) => new Map([...prev].filter(([id]) => id !== nodeId)));
    const events = healthChanges(healthBefore, get(effectiveHealthAtom), get(simTimeAtom));
    set(simEventsAtom, (prev) => [...prev, ...events].slice(-SIM_HISTORY_SIZE));
  },
);

export const resetSimulationActionAtom = atom(null, (_, set) => {
  set(simTimeAtom, 0);
  set(simPlayingAtom, false);
  set(simHistoryAtom, []);
  set(simHealthAtom, new Map());
  set(simOverloadAtom, new Map());
  set(simRecoverAtAtom, new Map());
  set(simEventsAtom, []);
});
