import { atom, type Atom } from 'jotai';
import { DEFAULT_EDGES, DEFAULT_NODES } from './constants';
import { contextMenuAtom } from '@/stores/context-menu';
import { showToastAtom } from '@/stores/toast';
import type { ConnectingState, DiagramEdge, DiagramNode, Port } from '@/types';
import { getNodeIcon } from '@/utils/node-icon';
import { getRandomNodePosition } from '@/utils/node-position';
import { getNodeTag } from '@/utils/node-tag';
import type { AddNodeArgs, UpdateNodeArgs } from './index.types';

const getInitialId = (items: Array<DiagramNode | DiagramEdge>): number => {
  if (items.length === 0) {
    return 1;
  }
  const ids = items.map((n) => n.id);
  return Math.max(...ids) + 1;
};

// nodes

const nodeAtomCache = new Map<number, Atom<DiagramNode | undefined>>();

export const nodeByIdAtom = (id: number) => {
  if (!nodeAtomCache.has(id)) {
    nodeAtomCache.set(
      id,
      atom((get) => get(nodesAtom).find((n) => n.id === id)),
    );
  }
  return nodeAtomCache.get(id)!;
};

const nextNodeIdAtom = atom(getInitialId(DEFAULT_NODES));

export const nodesAtom = atom<Array<DiagramNode>>(DEFAULT_NODES);

export const selectedNodeIdAtom = atom<number | null>(null);

export const selectedNodeAtom = atom((get) => {
  const nodes = get(nodesAtom);
  const id = get(selectedNodeIdAtom);
  return nodes.find((n) => n.id === id) || null;
});

export const addNodeActionAtom = atom(null, (get, set, { item, x, y }: AddNodeArgs) => {
  const currentId = get(nextNodeIdAtom);

  const newNode: DiagramNode = {
    id: currentId,
    type: item.type,
    label: item.label,
    meta: item.meta,
    tag: getNodeTag(item.type),
    icon: getNodeIcon(item.type),
    x: x ?? getRandomNodePosition(),
    y: y ?? getRandomNodePosition(),
  };
  set(nodesAtom, (prev) => [...prev, newNode]);
  set(selectedNodeIdAtom, newNode.id);
  set(nextNodeIdAtom, currentId + 1);
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

// edges

export const edgesAtom = atom<Array<DiagramEdge>>(DEFAULT_EDGES);

const nextEdgeIdAtom = atom(getInitialId(DEFAULT_EDGES));

// connection

export const pendingConnectionAtom = atom<ConnectingState | null>(null);

export const startConnectingActionAtom = atom(null, (get, set, { nodeId, port }: { nodeId: number; port: Port }) => {
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
    const nextId = get(nextEdgeIdAtom);
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
    set(nextEdgeIdAtom, nextId + 1);
    set(showToastAtom, 'Connected!');
  }

  set(pendingConnectionAtom, null);
});
