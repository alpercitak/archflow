import { useAtomValue, useStore } from 'jotai';
import { useEffect } from 'react';
import { simPlayingAtom, simSpeedAtom, tickSimulationActionAtom } from '@/stores/simulation';
import { SIM_TICK_MS } from '@/stores/simulation/constants';

export const useSimClock = () => {
  const store = useStore();
  const playing = useAtomValue(simPlayingAtom);

  useEffect(() => {
    if (!playing) {
      return;
    }
    const id = setInterval(() => {
      store.set(tickSimulationActionAtom, (SIM_TICK_MS / 1000) * store.get(simSpeedAtom));
    }, SIM_TICK_MS);
    return () => clearInterval(id);
  }, [playing, store]);
};
