import { MousePointer2 } from 'lucide-react';
import ToolModeButton from '@/components/app/tool-mode-button';

export default function ToolModeSelect() {
  return <ToolModeButton mode="select" label="Select" icon={MousePointer2} />;
}
