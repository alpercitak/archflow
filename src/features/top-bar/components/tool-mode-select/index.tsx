import Button from '@/components/ui/button';
import { MousePointer2 } from 'lucide-react';
import { toolModeAtom } from '@/stores/canvas';
import { useAtomValue, useSetAtom } from 'jotai';

// TODO: shared tool-mode-button
export default function ToolModeSelect() {
  const toolMode = useAtomValue(toolModeAtom);
  const setToolMode = useSetAtom(toolModeAtom);

  return (
    <Button active={toolMode === 'select'} title="Select (V)" onClick={() => setToolMode('select')}>
      <MousePointer2 size={13} strokeWidth={1.4} />
      Select
    </Button>
  );
}
