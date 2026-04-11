import { Hand } from 'lucide-react';
import ToolModeButton from '@/components/app/tool-mode-button';

export default function ToolModePan() {
  return <ToolModeButton mode="pan" label="Pan" icon={Hand} />;
}
