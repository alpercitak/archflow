import { useSetAtom } from 'jotai';
import { type FocusEvent, useRef } from 'react';
import Input from '@/components/ui/input';
import { updateNodeActionAtom } from '@/stores/diagram';
import type { DiagramNode } from '@/types';
import styles from './index.module.css';

interface Props {
  node: DiagramNode;
  label: string;
  field: keyof DiagramNode;
}

export default function InputField({ node, label, field }: Props) {
  const updateNode = useSetAtom(updateNodeActionAtom);
  // Each focus starts a new undo step; keystrokes within it merge.
  const historyKey = useRef('');
  const onFocus = (event: FocusEvent) => {
    historyKey.current = `edit:${event.timeStamp}`;
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) =>
    updateNode({
      nodeId: node.id,
      updater: (prev) => ({ ...prev, [field]: event.target.value }),
      historyKey: historyKey.current,
    });

  return (
    <div className={styles['input-field']}>
      <span className={styles['input-field__label']}>{label}</span>
      <Input value={String(node[field] ?? '')} onFocus={onFocus} onChange={onChange} />
    </div>
  );
}
