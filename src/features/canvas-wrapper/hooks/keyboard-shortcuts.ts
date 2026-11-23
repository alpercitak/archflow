import { useSetAtom, useStore } from 'jotai';
import { useEffect } from 'react';
import { resetViewAtom } from '@/stores/canvas';
import { contextMenuAtom } from '@/stores/context-menu';
import {
  cancelConnectingActionAtom,
  deleteNodeActionAtom,
  duplicateNodeActionAtom,
  redoActionAtom,
  selectedNodeIdAtom,
  undoActionAtom,
} from '@/stores/diagram';

export const useKeyboardShortcuts = () => {
  const store = useStore();
  const deleteNode = useSetAtom(deleteNodeActionAtom);
  const duplicateNode = useSetAtom(duplicateNodeActionAtom);
  const cancelConnecting = useSetAtom(cancelConnectingActionAtom);
  const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const resetView = useSetAtom(resetViewAtom);
  const undo = useSetAtom(undoActionAtom);
  const redo = useSetAtom(redoActionAtom);

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
      }
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !editing) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store, setContextMenu, deleteNode, setSelectedNodeId, resetView, duplicateNode, cancelConnecting, undo, redo]);
};
