import { useSetAtom, useStore } from 'jotai';
import { useFilePicker } from '@/hooks/file-picker';
import { replaceDiagramActionAtom } from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';
import type { DiagramEdge, DiagramNode } from '@/types';
import { hasUniqueIds, isEdge, isNode, isObject } from '@/utils/diagram-guards';
import { importJson } from './import-json';
import { importYaml } from './import-yaml';

export const parseDiagram = (data: unknown): { nodes: Array<DiagramNode>; edges: Array<DiagramEdge> } | null => {
  if (!isObject(data) || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    return null;
  }
  const nodes: Array<unknown> = data.nodes;
  const edges: Array<unknown> = data.edges;
  if (!nodes.every(isNode) || !edges.every(isEdge) || !hasUniqueIds(nodes) || !hasUniqueIds(edges)) {
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
      store.set(replaceDiagramActionAtom, diagram);
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
