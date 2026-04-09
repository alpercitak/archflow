import NodeIcon from '@/components/app/node-icon';
import type { DiagramNode, NodeType } from '@/types';
import styles from './index.module.css';

type Props = {
  item: Partial<DiagramNode>;
};

export default function NodeItem({ item }: Props) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  return (
    <div className={styles['node-item']} draggable onDragStart={onDragStart}>
      <NodeIcon type={item.type as NodeType} />
      <span className={styles['node-item__label']}>{item.label}</span>
    </div>
  );
}
