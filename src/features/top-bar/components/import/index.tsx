import { FileJson } from 'lucide-react';
import Dropdown, { type DropdownItems } from '@/components/ui/dropdown';
import { useImport } from '@/hooks/import';

export default function Import() {
  const { importJson } = useImport();
  const items = [{ icon: FileJson, label: 'Import JSON', onClick: importJson }] satisfies DropdownItems;
  return <Dropdown label="Import" items={items} />;
}
