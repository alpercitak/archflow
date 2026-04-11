import { useAtomValue, useSetAtom } from 'jotai';
import type { LucideIcon } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toolModeAtom } from '@/stores/canvas';
import type { ToolMode } from '@/types';

interface Props {
  mode: ToolMode;
  label: string;
  icon: LucideIcon;
}

export default function ToolModeButton({ mode, label, icon }: Props) {
  const toolMode = useAtomValue(toolModeAtom);
  const setToolMode = useSetAtom(toolModeAtom);

  return (
    <Button active={toolMode === mode} onClick={() => setToolMode(mode)}>
      <Icon icon={icon} />
      {label}
    </Button>
  );
}
