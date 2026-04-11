import { useAtomValue, useSetAtom } from 'jotai';
import { Download } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { edgesAtom, nodesAtom } from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';
import { exportDiagramToSvg } from '@/utils/export-svg';

export default function ExportSvg() {
  const nodes = useAtomValue(nodesAtom);
  const edges = useAtomValue(edgesAtom);
  const showToast = useSetAtom(showToastAtom);

  const handleExport = () => {
    const exported = exportDiagramToSvg(nodes, edges);
    showToast(exported ? 'SVG export downloaded' : 'Add at least one node to export');
  };

  return (
    <Button onClick={handleExport}>
      <Icon icon={Download} />
      Export SVG
    </Button>
  );
}
