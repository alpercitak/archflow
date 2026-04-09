import type { NodeType } from '@/types';
import styles from './index.module.css';
import nodeStyles from '@/styles/nodes.module.css';

type Props = {
  type: NodeType;
  tag: string;
};

export default function NodeTag({ type, tag }: Props) {
  const className = `${styles['node-tag']} ${nodeStyles[type]}`;
  return <span className={className}>{tag}</span>;
}
