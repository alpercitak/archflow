import { useEffect } from 'react';
import { useSetAtom, useStore } from 'jotai';
import { resetViewAtom, toolModeAtom } from '@/stores/canvas';
import { contextMenuAtom } from '@/stores/context-menu';
import {
  cancelConnectingActionAtom,
  deleteNodeActionAtom,
  duplicateNodeActionAtom,
  selectedNodeIdAtom,
} from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';

export function useKeyboardShortcuts() {
  const store = useStore();
  const deleteNode = useSetAtom(deleteNodeActionAtom);
  const duplicateNode = useSetAtom(duplicateNodeActionAtom);
  const cancelConnecting = useSetAtom(cancelConnectingActionAtom);
  const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const setToolMode = useSetAtom(toolModeAtom);
  const resetView = useSetAtom(resetViewAtom);
  const showToast = useSetAtom(showToastAtom);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const editing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.getAttribute('contenteditable') === 'true';

      const selectedNodeId = store.get(selectedNodeIdAtom);

      if ((e.key === 'Delete' || e.key === 'Backspace') && !editing && selectedNodeId) {
        deleteNode(selectedNodeId);
        showToast('Deleted');
      }
      if (e.key === 'v' || e.key === 'V') setToolMode('select');
      if (e.key === 'h' || e.key === 'H') setToolMode('pan');
      if (e.key === 'Escape') {
        cancelConnecting();
        setSelectedNodeId(null);
        setContextMenu(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && selectedNodeId) {
        e.preventDefault();
        duplicateNode(selectedNodeId);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        resetView();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
