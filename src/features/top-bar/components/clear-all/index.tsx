import { useSetAtom } from 'jotai';
import { X } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { contextMenuAtom } from '@/stores/context-menu';
import { edgesAtom, nodesAtom, pendingConnectionAtom, selectedNodeIdAtom } from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';

export default function ClearAll() {
  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);
  const setPendingConnection = useSetAtom(pendingConnectionAtom);
  const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const showToast = useSetAtom(showToastAtom);

  const clearAll = () => {
    const confirmed = window.confirm('Clear the entire canvas?');
    if (!confirmed) {
      return;
    }
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setPendingConnection(null);
    setContextMenu(null);
    showToast('Canvas cleared');
  };

  return (
    <Button onClick={clearAll}>
      <Icon icon={X} />
      Clear
    </Button>
  );
}
