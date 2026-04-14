import { Download, FileCode, FileJson } from 'lucide-react';
import Dropdown, { type DropdownItems } from '@/components/ui/dropdown';
import { useExport } from '@/hooks/export';

export default function Export() {
  const { exportJson, exportSvg, exportYaml } = useExport();
  const items = [
    { icon: FileJson, label: 'Export JSON', onClick: exportJson },
    { icon: FileCode, label: 'Export YAML', onClick: exportYaml },
    { icon: Download, label: 'Export SVG', onClick: exportSvg },
  ] satisfies DropdownItems;

  return <Dropdown label="Export" items={items} />;
}
