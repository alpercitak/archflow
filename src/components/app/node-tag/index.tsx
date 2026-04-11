import type { NodeType } from '@/types';
import nodeStyles from '@/styles/nodes.module.css';
import styles from './index.module.css';

interface Props {
  type: NodeType;
  tag: string;
}

export default function NodeTag({ type, tag }: Props) {
  return <span className={`${styles['node-tag']} ${nodeStyles[type]}`}>{tag}</span>;
}
