import { useSetAtom, useStore } from 'jotai';
import { edgesAtom, nodeSizesAtom, nodesAtom } from '@/stores/diagram';
import type { NodeSize } from '@/stores/diagram/index.types';
import { showToastAtom } from '@/stores/toast';
import type { DiagramEdge, DiagramNode } from '@/types';
import { exportJson } from './export-json';
import { exportSvg } from './export-svg';
import { exportYaml } from './export-yaml';
import type { ExportResult } from './types';

const filenameTimestamp = (): string => new Date().toISOString().replaceAll(':', '-').replace(/\..+$/, '');

const download = (result: NonNullable<ExportResult>) => {
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
    exportFn: (
      nodes: Array<DiagramNode>,
      edges: Array<DiagramEdge>,
      sizes: ReadonlyMap<number, NodeSize>,
    ) => ExportResult,
    successMessage: string,
  ) => {
    try {
      const result = exportFn(store.get(nodesAtom), store.get(edgesAtom), store.get(nodeSizesAtom));
      if (!result) {
        showToast('Nothing to export');
        return;
      }
      download(result);
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
