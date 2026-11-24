import { createStore } from 'jotai';
import { beforeEach, describe, expect, test } from 'bun:test';
import { DEFAULT_EDGES, DEFAULT_NODES } from './constants';

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

const {
  addNodeActionAtom,
  deleteEdgeActionAtom,
  deleteNodeActionAtom,
  edgesAtom,
  nodesAtom,
  redoActionAtom,
  undoActionAtom,
  updateEdgeLabelActionAtom,
  updateNodeActionAtom,
} = await import('.');

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

  test('keeps unkeyed updates as separate steps', () => {
    const store = createStore();
    store.set(updateNodeActionAtom, moveTo(100));
    store.set(updateNodeActionAtom, moveTo(200));
    store.set(undoActionAtom);
    expect(store.get(nodesAtom).find((n) => n.id === 1)?.x).toBe(100);
  });

  test('ignores stored nodes with duplicate ids', () => {
    const node = { ...DEFAULT_NODES[0] };
    memory.set('archflow:nodes', JSON.stringify([node, node]));
    expect(createStore().get(nodesAtom)).toEqual(DEFAULT_NODES);
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

describe('edge actions', () => {
  beforeEach(() => memory.clear());

  const labelOf = (store: ReturnType<typeof createStore>) => store.get(edgesAtom).find((e) => e.id === 1)?.label;

  test('merges label typing within one focus into one undo step', () => {
    const store = createStore();
    store.set(updateEdgeLabelActionAtom, { edgeId: 1, label: 'H', historyKey: 'edit:1' });
    store.set(updateEdgeLabelActionAtom, { edgeId: 1, label: 'HTTP', historyKey: 'edit:1' });
    store.set(updateEdgeLabelActionAtom, { edgeId: 1, label: 'HTTPS', historyKey: 'edit:2' });
    expect(labelOf(store)).toBe('HTTPS');
    store.set(undoActionAtom);
    expect(labelOf(store)).toBe('HTTP');
    store.set(undoActionAtom);
    expect(store.get(edgesAtom)).toEqual(DEFAULT_EDGES);
  });

  test('deletes an edge, and undo restores it', () => {
    const store = createStore();
    store.set(deleteEdgeActionAtom, 1);
    expect(store.get(edgesAtom).some((e) => e.id === 1)).toBe(false);
    expect(store.get(edgesAtom)).toHaveLength(DEFAULT_EDGES.length - 1);
    store.set(undoActionAtom);
    expect(store.get(edgesAtom)).toEqual(DEFAULT_EDGES);
  });
});
