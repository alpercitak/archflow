import { useSetAtom } from 'jotai';
import { updateNodeActionAtom } from '@/stores/diagram';
import type { DiagramNode } from '@/types';
import Input from '@/components/ui/input';
import styles from './index.module.css';

interface Props {
  node: DiagramNode;
  label: string;
  field: keyof DiagramNode;
}

export default function InputField({ node, label, field }: Props) {
  const updateNode = useSetAtom(updateNodeActionAtom);

  const onChange = (event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) =>
    updateNode({ nodeId: node.id, updater: (prev) => ({ ...prev, [field]: event.target.value }) });

  return (
    <div className={styles['input-field']}>
      <span className={styles['input-field__label']}>{label}</span>
      <Input value={String(node[field] ?? '')} onChange={onChange} />
    </div>
  );
}
