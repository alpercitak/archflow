import { atom } from 'jotai';
import { edgesAtom, nodesAtom } from '@/stores/diagram';
import { simulate } from '@/utils/simulate';

export const simulationEnabledAtom = atom(false);

export const simulationResultAtom = atom((get) =>
  get(simulationEnabledAtom) ? simulate(get(nodesAtom), get(edgesAtom)) : null,
);
