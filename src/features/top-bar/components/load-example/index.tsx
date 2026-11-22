import { useSetAtom } from 'jotai';
import { LayoutTemplate } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { replaceDiagramActionAtom } from '@/stores/diagram';
import { DEFAULT_EDGES, DEFAULT_NODES } from '@/stores/diagram/constants';
import { showToastAtom } from '@/stores/toast';

export default function LoadExample() {
  const replaceDiagram = useSetAtom(replaceDiagramActionAtom);
  const showToast = useSetAtom(showToastAtom);

  const loadExample = () => {
    const confirmed = window.confirm('Replace the canvas with the example diagram?');
    if (!confirmed) {
      return;
    }
    replaceDiagram({ nodes: DEFAULT_NODES, edges: DEFAULT_EDGES });
    showToast('Example loaded');
  };

  return (
    <Button onClick={loadExample}>
      <Icon icon={LayoutTemplate} />
      Example
    </Button>
  );
}
