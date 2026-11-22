import { useSetAtom, useStore } from 'jotai';
import { useFilePicker } from '@/hooks/file-picker';
import { contextMenuAtom } from '@/stores/context-menu';
import { edgesAtom, nodesAtom, pendingConnectionAtom, selectedNodeIdAtom } from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';
import type { DiagramEdge, DiagramNode, NodeType, Port } from '@/types';
import { NODE_TYPES } from '@/utils/node-tag';
import { importJson } from './import-json';
import { importYaml } from './import-yaml';

const PORTS: ReadonlyArray<Port> = ['top', 'right', 'bottom', 'left'];

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isNode = (value: unknown): value is DiagramNode =>
  isObject(value) &&
  typeof value.id === 'number' &&
  typeof value.x === 'number' &&
  typeof value.y === 'number' &&
  typeof value.label === 'string' &&
  typeof value.meta === 'string' &&
  typeof value.tag === 'string' &&
  NODE_TYPES.includes(value.type as NodeType);

const isEdge = (value: unknown): value is DiagramEdge =>
  isObject(value) &&
  typeof value.id === 'number' &&
  typeof value.from === 'number' &&
  typeof value.to === 'number' &&
  typeof value.label === 'string' &&
  PORTS.includes(value.fromPort as Port) &&
  PORTS.includes(value.toPort as Port);

const parseDiagram = (data: unknown): { nodes: Array<DiagramNode>; edges: Array<DiagramEdge> } | null => {
  if (!isObject(data) || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    return null;
  }
  const nodes: Array<unknown> = data.nodes;
  const edges: Array<unknown> = data.edges;
  if (!nodes.every(isNode) || !edges.every(isEdge)) {
    return null;
  }
  return { nodes, edges };
};

export const useImport = () => {
  const openFilePicker = useFilePicker();
  const store = useStore();
  const showToast = useSetAtom(showToastAtom);

  const handleImport = async (importFn: (data: string) => unknown, extension: string) => {
    const file = await openFilePicker(extension);
    if (!file) {
      return;
    }
    try {
      const diagram = parseDiagram(importFn(await file.text()));
      if (!diagram) {
        showToast('Import failed.');
        return;
      }
      store.set(nodesAtom, diagram.nodes);
      store.set(edgesAtom, diagram.edges);
      store.set(selectedNodeIdAtom, null);
      store.set(pendingConnectionAtom, null);
      store.set(contextMenuAtom, null);
      showToast(`Imported: ${file.name}`);
    } catch {
      showToast('Import failed.');
    }
  };

  return {
    importJson: () => handleImport(importJson, '.json'),
    importYaml: () => handleImport(importYaml, '.yaml'),
  };
};
