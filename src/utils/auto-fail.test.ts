import { CRASH_AFTER_S } from '@/stores/simulation/constants';
import type { NodeHealth, SimNodeResult, SimResult, SimStatus } from '@/types';
import { type AutoFailState, stepAutoFail } from '@/utils/auto-fail';
import { describe, expect, test } from 'bun:test';

const DT = 0.1;

const resultWith = (status: SimStatus): SimResult => {
  const nodeResult: SimNodeResult = { inRps: 0, utilization: 0, status, latencyMs: 0 };
  return {
    nodes: new Map([[1, nodeResult]]),
    edges: new Map(),
    clientLatencyMs: new Map(),
    throughputRps: 0,
    droppedRps: 0,
    cycleNodeIds: [],
  };
};

const empty: AutoFailState = { health: new Map(), overloadS: new Map(), recoverAtS: new Map() };

const runFor = (state: AutoFailState, status: SimStatus, seconds: number, startT = 0): AutoFailState => {
  let next = state;
  const steps = Math.round(seconds / DT);
  for (let i = 1; i <= steps; i++) {
    next = stepAutoFail(next, resultWith(status), startT + i * DT, DT);
  }
  return next;
};

describe('stepAutoFail', () => {
  test('accumulates overload and crashes once it reaches CRASH_AFTER_S', () => {
    const almost = runFor(empty, 'overloaded', CRASH_AFTER_S - 1);
    expect(almost.health.has(1)).toBe(false);
    expect(almost.overloadS.get(1)).toBeCloseTo(CRASH_AFTER_S - 1);

    const crashed = runFor(almost, 'overloaded', 1.5, CRASH_AFTER_S - 1);
    expect(crashed.health.get(1)).toBe('down');
    expect(crashed.recoverAtS.get(1)).toBeGreaterThan(CRASH_AFTER_S);
    expect(stepAutoFail(crashed, resultWith('down'), CRASH_AFTER_S + 1.5 + DT, DT).overloadS.has(1)).toBe(false);
  });

  test('resets accumulation when the node is no longer overloaded', () => {
    const partial = runFor(empty, 'overloaded', 3);
    const cooled = stepAutoFail(partial, resultWith('ok'), 3.1, DT);
    expect(cooled.overloadS.has(1)).toBe(false);
    expect(runFor(cooled, 'overloaded', CRASH_AFTER_S - 0.5, 3.1).health.has(1)).toBe(false);
  });

  test('recovers the crashed node after RECOVER_AFTER_S', () => {
    const crashed = runFor(empty, 'overloaded', CRASH_AFTER_S + 0.1);
    const recoverAt = crashed.recoverAtS.get(1) ?? 0;
    const beforeRecovery = stepAutoFail(crashed, resultWith('down'), recoverAt - DT, DT);
    expect(beforeRecovery.health.get(1)).toBe('down');

    const recovered = stepAutoFail(beforeRecovery, resultWith('down'), recoverAt, DT);
    expect(recovered.health.has(1)).toBe(false);
    expect(recovered.recoverAtS.has(1)).toBe(false);
  });

  test('recovery leaves a manually degraded node degraded', () => {
    const health = new Map<number, NodeHealth>([[1, 'degraded']]);
    const state: AutoFailState = { health, overloadS: new Map(), recoverAtS: new Map([[1, 5]]) };
    const next = stepAutoFail(state, resultWith('ok'), 5, DT);
    expect(next.health.get(1)).toBe('degraded');
    expect(next.recoverAtS.has(1)).toBe(false);
  });

  test('does not mutate the input state', () => {
    const state = runFor(empty, 'overloaded', 1);
    const snapshot = new Map(state.overloadS);
    stepAutoFail(state, resultWith('overloaded'), 1.1, DT);
    expect(state.overloadS).toEqual(snapshot);
  });
});
