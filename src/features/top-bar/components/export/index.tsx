import { Download, FileJson } from 'lucide-react';
import Dropdown, { type DropdownItems } from '@/components/ui/dropdown';
import { useExport } from '@/hooks/export';

export default function Export() {
  const { exportJson, exportSvg } = useExport();
  const items = [
    { icon: FileJson, label: 'Export JSON', onClick: exportJson },
    { icon: Download, label: 'Export SVG', onClick: exportSvg },
  ] satisfies DropdownItems;

  return <Dropdown label="Export" items={items} />;
}
