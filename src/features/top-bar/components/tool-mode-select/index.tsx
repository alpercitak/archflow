import { useAtomValue, useSetAtom } from 'jotai';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { MousePointer2 } from 'lucide-react';
import { toolModeAtom } from '@/stores/canvas';

// TODO: shared tool-mode-button
export default function ToolModeSelect() {
  const toolMode = useAtomValue(toolModeAtom);
  const setToolMode = useSetAtom(toolModeAtom);

  return (
    <Button active={toolMode === 'select'} title="Select (V)" onClick={() => setToolMode('select')}>
      <Icon icon={MousePointer2} />
      Select
    </Button>
  );
}
