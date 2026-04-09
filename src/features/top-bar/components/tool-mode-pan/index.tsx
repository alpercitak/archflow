import { useAtomValue, useSetAtom } from 'jotai';
import { Hand } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toolModeAtom } from '@/stores/canvas';

// TODO: shared tool-mode-button
export default function ToolModePan() {
  const toolMode = useAtomValue(toolModeAtom);
  const setToolMode = useSetAtom(toolModeAtom);

  return (
    <Button active={toolMode === 'pan'} title="Pan (H)" onClick={() => setToolMode('pan')}>
      <Icon icon={Hand} />
      Pan
    </Button>
  );
}
