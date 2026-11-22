import { type Atom, atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { contextMenuAtom } from '@/stores/context-menu';
import { showToastAtom } from '@/stores/toast';
import type { ConnectingState, DiagramEdge, DiagramNode, Port } from '@/types';
import { isEdge, isNode } from '@/utils/diagram-guards';
import { getRandomNodePosition } from '@/utils/node-position';
import { getNodeTag } from '@/utils/node-tag';
import { DEFAULT_EDGES, DEFAULT_NODES } from './constants';
import type { AddNodeArgs, NodeSize, UpdateNodeArgs } from './index.types';

const getNextId = (items: Array<DiagramNode | DiagramEdge>): number => {
  if (items.length === 0) {
    return 1;
  }
  const ids = items.map((n) => n.id);
  return Math.max(...ids) + 1;
};

const validatedStorage = <T>(isItem: (value: unknown) => value is T) => {
  const storage = createJSONStorage<Array<T>>(() => localStorage);
  return {
    ...storage,
    getItem: (key: string, initialValue: Array<T>) => {
      const value: unknown = storage.getItem(key, initialValue);
      return Array.isArray(value) && value.every(isItem) ? value : initialValue;
    },
  };
};

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
  set(nodesAtom, (prev) => [...prev, newNode]);
  set(selectedNodeIdAtom, newNode.id);
  return newNode;
});

export const updateNodeActionAtom = atom(null, (_, set, { nodeId, updater }: UpdateNodeArgs) => {
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

// edges

export const edgesAtom = atomWithStorage<Array<DiagramEdge>>(
  'archflow:edges',
  DEFAULT_EDGES,
  validatedStorage(isEdge),
  { getOnInit: true },
);

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

export const replaceDiagramActionAtom = atom(
  null,
  (_, set, { nodes, edges }: { nodes: Array<DiagramNode>; edges: Array<DiagramEdge> }) => {
    set(nodesAtom, nodes);
    set(edgesAtom, edges);
    set(selectedNodeIdAtom, null);
    set(pendingConnectionAtom, null);
    set(contextMenuAtom, null);
  },
);
