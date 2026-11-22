import type { DragEvent } from 'react';
import NodeIcon from '@/components/app/node-icon';
import type { NodeTemplate } from '@/types';
import styles from './index.module.css';

interface Props {
  item: NodeTemplate;
}

export default function NodeItem({ item }: Props) {
  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  return (
    <div className={styles['node-item']} draggable onDragStart={onDragStart}>
      <NodeIcon type={item.type} />
      <span className={styles['node-item__label']}>{item.label}</span>
    </div>
  );
}
