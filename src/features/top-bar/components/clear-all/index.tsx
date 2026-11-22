import { useSetAtom } from 'jotai';
import { X } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { replaceDiagramActionAtom } from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';

export default function ClearAll() {
  const replaceDiagram = useSetAtom(replaceDiagramActionAtom);
  const showToast = useSetAtom(showToastAtom);

  const clearAll = () => {
    const confirmed = window.confirm('Clear the entire canvas?');
    if (!confirmed) {
      return;
    }
    replaceDiagram({ nodes: [], edges: [] });
    showToast('Canvas cleared');
  };

  return (
    <Button onClick={clearAll}>
      <Icon icon={X} />
      Clear
    </Button>
  );
}
