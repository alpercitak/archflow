import { FileCode, FileJson } from 'lucide-react';
import Dropdown, { type DropdownItems } from '@/components/ui/dropdown';
import { useImport } from '@/hooks/import';

export default function Import() {
  const { importJson, importYaml } = useImport();
  const items = [
    { icon: FileJson, label: 'Import JSON', onClick: importJson },
    { icon: FileCode, label: 'Import YAML', onClick: importYaml },
  ] satisfies DropdownItems;
  return <Dropdown label="Import" items={items} />;
}
