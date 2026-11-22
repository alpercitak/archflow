import { CRASH_AFTER_S, RECOVER_AFTER_S } from '@/stores/simulation/constants';
import type { NodeHealth, SimResult } from '@/types';

export interface AutoFailState {
  health: ReadonlyMap<number, NodeHealth>;
  overloadS: ReadonlyMap<number, number>;
  recoverAtS: ReadonlyMap<number, number>;
}

/** Crashes nodes overloaded for CRASH_AFTER_S and schedules their recovery RECOVER_AFTER_S later. */
export const stepAutoFail = (state: AutoFailState, result: SimResult, t: number, dtS: number): AutoFailState => {
  const health = new Map(state.health);
  const overloadS = new Map(state.overloadS);
  const recoverAtS = new Map(state.recoverAtS);

  for (const [nodeId, nodeResult] of result.nodes) {
    if (nodeResult.status !== 'overloaded') {
      overloadS.delete(nodeId);
      continue;
    }
    const accumulated = (overloadS.get(nodeId) ?? 0) + dtS;
    if (accumulated >= CRASH_AFTER_S) {
      health.set(nodeId, 'down');
      recoverAtS.set(nodeId, t + RECOVER_AFTER_S);
      overloadS.delete(nodeId);
    } else {
      overloadS.set(nodeId, accumulated);
    }
  }

  for (const [nodeId, recoverAt] of recoverAtS) {
    if (t >= recoverAt) {
      recoverAtS.delete(nodeId);
      if (health.get(nodeId) === 'down') {
        health.delete(nodeId);
      }
    }
  }

  return { health, overloadS, recoverAtS };
};
