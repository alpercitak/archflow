import { useSetAtom } from 'jotai';
import { type ChangeEvent, type FocusEvent, useRef } from 'react';
import Input from '@/components/ui/input';
import { updateNodeActionAtom } from '@/stores/diagram';
import type { DiagramNode } from '@/types';
import styles from '../input-field/index.module.css';

interface Props {
  node: DiagramNode;
  label: string;
  field: 'load' | 'capacity' | 'latencyMs';
  placeholder: number;
}

export default function NumberField({ node, label, field, placeholder }: Props) {
  const updateNode = useSetAtom(updateNodeActionAtom);
  // Each focus starts a new undo step; keystrokes within it merge.
  const historyKey = useRef('');
  const onFocus = (event: FocusEvent) => {
    historyKey.current = `edit:${event.timeStamp}`;
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw === '') {
      updateNode({
        nodeId: node.id,
        updater: (prev) => ({ ...prev, [field]: undefined }),
        historyKey: historyKey.current,
      });
      return;
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      return;
    }
    updateNode({ nodeId: node.id, updater: (prev) => ({ ...prev, [field]: value }), historyKey: historyKey.current });
  };

  return (
    <div className={styles['input-field']}>
      <span className={styles['input-field__label']}>{label}</span>
      <Input
        type="number"
        min={0}
        value={node[field] ?? ''}
        placeholder={String(placeholder)}
        onFocus={onFocus}
        onChange={onChange}
      />
    </div>
  );
}
