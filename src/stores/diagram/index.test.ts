import { createStore } from 'jotai';
import { beforeEach, describe, expect, test } from 'bun:test';
import { DEFAULT_NODES } from './constants';

const memory = new Map<string, string>();
globalThis.localStorage = {
  get length() {
    return memory.size;
  },
  key: (index) => [...memory.keys()][index] ?? null,
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => void memory.set(key, value),
  removeItem: (key) => void memory.delete(key),
  clear: () => memory.clear(),
};

const { addNodeActionAtom, deleteNodeActionAtom, nodesAtom, redoActionAtom, undoActionAtom, updateNodeActionAtom } =
  await import('.');

const moveTo = (x: number, historyKey?: string) => ({
  nodeId: 1,
  updater: (n: (typeof DEFAULT_NODES)[number]) => ({ ...n, x }),
  historyKey,
});

describe('diagram history', () => {
  beforeEach(() => memory.clear());

  test('undoes and redoes a delete', () => {
    const store = createStore();
    store.set(deleteNodeActionAtom, 1);
    expect(store.get(nodesAtom).some((n) => n.id === 1)).toBe(false);
    store.set(undoActionAtom);
    expect(store.get(nodesAtom)).toEqual(DEFAULT_NODES);
    store.set(redoActionAtom);
    expect(store.get(nodesAtom).some((n) => n.id === 1)).toBe(false);
  });

  test('merges a whole drag into one step, but not two drags', () => {
    const store = createStore();
    store.set(updateNodeActionAtom, moveTo(100, 'drag:1'));
    store.set(updateNodeActionAtom, moveTo(200, 'drag:1'));
    store.set(updateNodeActionAtom, moveTo(300, 'drag:2'));
    store.set(undoActionAtom);
    expect(store.get(nodesAtom).find((n) => n.id === 1)?.x).toBe(200);
    store.set(undoActionAtom);
    expect(store.get(nodesAtom)).toEqual(DEFAULT_NODES);
  });

  test('a new change clears redo', () => {
    const store = createStore();
    store.set(deleteNodeActionAtom, 1);
    store.set(undoActionAtom);
    store.set(addNodeActionAtom, { item: { type: 'note', label: 'Note', meta: '' } });
    store.set(redoActionAtom);
    expect(store.get(nodesAtom).some((n) => n.id === 1)).toBe(true);
  });
});
