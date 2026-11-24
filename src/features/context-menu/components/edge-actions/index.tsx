import { useAtomValue, useSetAtom } from 'jotai';
import { X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import { useEditHistoryKey } from '@/hooks/edit-history-key';
import { contextMenuAtom } from '@/stores/context-menu';
import { deleteEdgeActionAtom, edgesAtom, updateEdgeLabelActionAtom } from '@/stores/diagram';
import styles from './index.module.css';

interface Props {
  edgeId: number;
}

export default function EdgeActions({ edgeId }: Props) {
  const edge = useAtomValue(edgesAtom).find((e) => e.id === edgeId);
  const updateLabel = useSetAtom(updateEdgeLabelActionAtom);
  const deleteEdge = useSetAtom(deleteEdgeActionAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const { historyKey, onFocus } = useEditHistoryKey();

  if (!edge) {
    return null;
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      setContextMenu(null);
    }
  };

  return (
    <div>
      <div className={styles['edge-actions__label']}>
        <Input
          aria-label="Connection label"
          placeholder="Label"
          autoFocus
          value={edge.label}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          onChange={(event) => updateLabel({ edgeId, label: event.target.value, historyKey: historyKey.current })}
        />
      </div>
      <div className={styles['edge-actions__divider']} />
      <Button onClick={() => deleteEdge(edgeId)}>
        <Icon icon={X} />
        Delete connection
      </Button>
    </div>
  );
}
