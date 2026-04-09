import { useSetAtom } from 'jotai';
import { RotateCcw } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { resetViewAtom } from '@/stores/canvas';

export default function ResetView() {
  const resetView = useSetAtom(resetViewAtom);
  return (
    <Button onClick={resetView}>
      <Icon icon={RotateCcw} />
      Reset view
    </Button>
  );
}
