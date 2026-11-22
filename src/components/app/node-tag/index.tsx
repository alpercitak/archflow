import clsx from 'clsx';
import nodeStyles from '@/styles/nodes.module.css';
import type { NodeType } from '@/types';
import styles from './index.module.css';

interface Props {
  type: NodeType;
  tag: string;
}

export default function NodeTag({ type, tag }: Props) {
  return <span className={clsx(styles['node-tag'], nodeStyles[type])}>{tag}</span>;
}
