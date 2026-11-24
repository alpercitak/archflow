import { type Atom, atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { contextMenuAtom } from '@/stores/context-menu';
import { showToastAtom } from '@/stores/toast';
import type { ConnectingState, DiagramEdge, DiagramNode, Port } from '@/types';
import { hasUniqueIds, isEdge, isNode } from '@/utils/diagram-guards';
import { getRandomNodePosition } from '@/utils/node-position';
import { getNodeTag } from '@/utils/node-tag';
import { DEFAULT_EDGES, DEFAULT_NODES, HISTORY_LIMIT, PERSIST_DELAY_MS } from './constants';
import type { AddNodeArgs, DiagramSnapshot, NodeSize, UpdateNodeArgs } from './index.types';

const getNextId = (items: Array<DiagramNode | DiagramEdge>): number => {
  if (items.length === 0) {
    return 1;
  }
  const ids = items.map((n) => n.id);
  return Math.max(...ids) + 1;
};

// Writes are delayed so a drag or typing burst saves once; pending writes are flushed when the page is hidden.
const validatedStorage = <T extends { id: number }>(isItem: (value: unknown) => value is T) => {
  const storage = createJSONStorage<Array<T>>(() => localStorage);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let flush = () => {};
  addEventListener('pagehide', () => flush());
  return {
    ...storage,
    getItem: (key: string, initialValue: Array<T>) => {
      const value: unknown = storage.getItem(key, initialValue);
      return Array.isArray(value) && value.every(isItem) && hasUniqueIds(value) ? value : initialValue;
    },
    setItem: (key: string, value: Array<T>) => {
      clearTimeout(timer);
      flush = () => {
        clearTimeout(timer);
        flush = () => {};
        storage.setItem(key, value);
      };
      timer = setTimeout(flush, PERSIST_DELAY_MS);
    },
  };
};

// history

const pastAtom = atom<Array<DiagramSnapshot>>([]);
const futureAtom = atom<Array<DiagramSnapshot>>([]);
const lastHistoryKeyAtom = atom<string | null>(null);

// Records the current diagram as an undo step. Consecutive calls with the same key merge into one step.
const checkpointActionAtom = atom(null, (get, set, key: string | null = null) => {
  if (key !== null && key === get(lastHistoryKeyAtom)) {
    return;
  }
  set(lastHistoryKeyAtom, key);
  set(pastAtom, (prev) => [...prev, { nodes: get(nodesAtom), edges: get(edgesAtom) }].slice(-HISTORY_LIMIT));
  set(futureAtom, []);
});

const restoreActionAtom = atom(null, (get, set, direction: 'undo' | 'redo') => {
  const [fromAtom, toAtom] = direction === 'undo' ? [pastAtom, futureAtom] : [futureAtom, pastAtom];
  const snapshot = get(fromAtom).at(-1);
  if (!snapshot) {
    return;
  }
  set(fromAtom, (prev) => prev.slice(0, -1));
  set(toAtom, (prev) => [...prev, { nodes: get(nodesAtom), edges: get(edgesAtom) }]);
  set(lastHistoryKeyAtom, null);
  set(nodesAtom, snapshot.nodes);
  set(edgesAtom, snapshot.edges);
  set(pendingConnectionAtom, null);
  set(contextMenuAtom, null);
});

export const undoActionAtom = atom(null, (_, set) => set(restoreActionAtom, 'undo'));
export const redoActionAtom = atom(null, (_, set) => set(restoreActionAtom, 'redo'));

// nodes

const nodeAtomCache = new Map<number, Atom<DiagramNode | undefined>>();

export const nodeByIdAtom = (id: number) => {
  let nodeAtom = nodeAtomCache.get(id);
  if (!nodeAtom) {
    nodeAtom = atom((get) => get(nodesAtom).find((n) => n.id === id));
    nodeAtomCache.set(id, nodeAtom);
  }
  return nodeAtom;
};

export const nodesAtom = atomWithStorage<Array<DiagramNode>>(
  'archflow:nodes',
  DEFAULT_NODES,
  validatedStorage(isNode),
  { getOnInit: true },
);

export const selectedNodeIdAtom = atom<number | null>(null);

export const selectedNodeAtom = atom((get) => {
  const nodes = get(nodesAtom);
  const id = get(selectedNodeIdAtom);
  return nodes.find((n) => n.id === id) || null;
});

export const addNodeActionAtom = atom(null, (get, set, { item, x, y }: AddNodeArgs) => {
  const newNode: DiagramNode = {
    id: getNextId(get(nodesAtom)),
    type: item.type,
    label: item.label,
    meta: item.meta,
    tag: item.tag ?? getNodeTag(item.type),
    x: x ?? getRandomNodePosition(),
    y: y ?? getRandomNodePosition(),
  };
  set(checkpointActionAtom);
  set(nodesAtom, (prev) => [...prev, newNode]);
  set(selectedNodeIdAtom, newNode.id);
  return newNode;
});

export const updateNodeActionAtom = atom(null, (_, set, { nodeId, updater, historyKey }: UpdateNodeArgs) => {
  set(checkpointActionAtom, historyKey);
  set(nodesAtom, (current) => current.map((node) => (node.id === nodeId ? updater(node) : node)));
});

export const duplicateNodeActionAtom = atom(null, (get, set, nodeId: number) => {
  const nodes = get(nodesAtom);
  const originalNode = nodes.find((n) => n.id === nodeId);

  if (!originalNode) {
    return;
  }

  set(addNodeActionAtom, {
    item: {
      ...originalNode,
      label: `${originalNode.label} copy`,
    },
    x: originalNode.x + 30,
    y: originalNode.y + 30,
  });

  set(showToastAtom, 'Node duplicated');
});

export const deleteNodeActionAtom = atom(null, (get, set, nodeId: number) => {
  set(checkpointActionAtom);
  set(nodesAtom, (prev) => prev.filter((node) => node.id !== nodeId));
  set(edgesAtom, (prev) => prev.filter((edge) => edge.from !== nodeId && edge.to !== nodeId));

  const currentSelectedId = get(selectedNodeIdAtom);
  if (currentSelectedId === nodeId) {
    set(selectedNodeIdAtom, null);
  }

  const pending = get(pendingConnectionAtom);
  if (pending?.nodeId === nodeId) {
    set(pendingConnectionAtom, null);
  }

  set(showToastAtom, 'Node deleted');
  set(contextMenuAtom, null);
});

export const nodeSizesAtom = atom<ReadonlyMap<number, NodeSize>>(new Map());

export const setNodeSizeActionAtom = atom(
  null,
  (get, set, { nodeId, width, height }: { nodeId: number } & NodeSize) => {
    const current = get(nodeSizesAtom).get(nodeId);
    if (current?.width === width && current.height === height) {
      return;
    }
    set(nodeSizesAtom, (prev) => new Map(prev).set(nodeId, { width, height }));
  },
);

// Called when a node leaves the canvas (delete, undo, import) so per-node caches don't grow forever.
export const forgetNodeActionAtom = atom(null, (_, set, nodeId: number) => {
  nodeAtomCache.delete(nodeId);
  set(nodeSizesAtom, (prev) => {
    const next = new Map(prev);
    next.delete(nodeId);
    return next;
  });
});

// edges

export const edgesAtom = atomWithStorage<Array<DiagramEdge>>(
  'archflow:edges',
  DEFAULT_EDGES,
  validatedStorage(isEdge),
  { getOnInit: true },
);

export const updateEdgeLabelActionAtom = atom(
  null,
  (_, set, { edgeId, label, historyKey }: { edgeId: number; label: string; historyKey?: string }) => {
    set(checkpointActionAtom, historyKey);
    set(edgesAtom, (prev) => prev.map((edge) => (edge.id === edgeId ? { ...edge, label } : edge)));
  },
);

export const deleteEdgeActionAtom = atom(null, (_, set, edgeId: number) => {
  set(checkpointActionAtom);
  set(edgesAtom, (prev) => prev.filter((edge) => edge.id !== edgeId));
  set(contextMenuAtom, null);
  set(showToastAtom, 'Connection deleted');
});

// connection

export const pendingConnectionAtom = atom<ConnectingState | null>(null);

export const startConnectingActionAtom = atom(null, (_, set, { nodeId, port }: { nodeId: number; port: Port }) => {
  set(pendingConnectionAtom, { nodeId, port });
  set(selectedNodeIdAtom, nodeId);
  set(contextMenuAtom, null);
  set(showToastAtom, 'Click another port to connect');
});

export const cancelConnectingActionAtom = atom(null, (_, set) => {
  set(pendingConnectionAtom, null);
});

export const finishConnectingActionAtom = atom(null, (get, set, payload: { toNodeId: number; toPort: Port }) => {
  const pending = get(pendingConnectionAtom);
  const edges = get(edgesAtom);

  if (!pending || pending.nodeId === payload.toNodeId) {
    set(pendingConnectionAtom, null);
    return;
  }

  const exists = edges.some((e) => e.from === pending.nodeId && e.to === payload.toNodeId);

  if (exists) {
    set(showToastAtom, 'Already connected');
  } else {
    const nextId = getNextId(edges);
    set(checkpointActionAtom);
    set(edgesAtom, (current) => [
      ...current,
      {
        id: nextId,
        from: pending.nodeId,
        fromPort: pending.port,
        to: payload.toNodeId,
        toPort: payload.toPort,
        label: '',
      },
    ]);
    set(showToastAtom, 'Connected!');
  }

  set(pendingConnectionAtom, null);
});

export const replaceDiagramActionAtom = atom(null, (_, set, { nodes, edges }: DiagramSnapshot) => {
  set(checkpointActionAtom);
  set(nodesAtom, nodes);
  set(edgesAtom, edges);
  set(selectedNodeIdAtom, null);
  set(pendingConnectionAtom, null);
  set(contextMenuAtom, null);
});
