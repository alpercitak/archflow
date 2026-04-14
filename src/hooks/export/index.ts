import { useSetAtom, useStore } from 'jotai';
import { edgesAtom, nodesAtom } from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';
import type { DiagramEdge, DiagramNode } from '@/types';
import { exportJson } from './export-json';
import { exportSvg } from './export-svg';
import { exportYaml } from './export-yaml';
import type { ExportResult } from './types';

const filenameTimestamp = (): string => new Date().toISOString().replaceAll(':', '-').replace(/\..+$/, '');

const download = (result: ExportResult) => {
  if (!result) {
    return null;
  }
  const { blob, extension } = result;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `archflow-${filenameTimestamp()}.${extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export function useExport() {
  const store = useStore();
  const showToast = useSetAtom(showToastAtom);

  const handleExport = (
    exportFn: (nodes: Array<DiagramNode>, edges: Array<DiagramEdge>) => ExportResult,
    successMessage: string,
  ) => {
    try {
      download(exportFn(store.get(nodesAtom), store.get(edgesAtom))!);
      showToast(successMessage);
    } catch {
      showToast('Export failed');
    }
  };
  return {
    exportSvg: () => handleExport(exportSvg, 'Exported to SVG'),
    exportJson: () => handleExport(exportJson, 'Exported to JSON'),
    exportYaml: () => handleExport(exportYaml, 'Exported to YAML'),
  };
}
