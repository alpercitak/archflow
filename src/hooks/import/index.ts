import { useSetAtom, useStore } from 'jotai';
import { useFilePicker } from '@/hooks/file-picker';
import { nodesAtom, edgesAtom } from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';
import { importJson } from './import-json';
import { importYaml } from './import-yaml';
import type { ImportResult } from './types';

export const useImport = () => {
  const openFilePicker = useFilePicker();
  const store = useStore();
  const showToast = useSetAtom(showToastAtom);

  const handleImport = async (importFn: (data: string) => ImportResult, extension: string) => {
    const file = await openFilePicker(extension);
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const result = importFn(text);
      const { nodes, edges } = result!;
      store.set(nodesAtom, nodes);
      store.set(edgesAtom, edges);
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
