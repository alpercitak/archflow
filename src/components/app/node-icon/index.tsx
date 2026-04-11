import type { NodeType } from '@/types';
import { getNodeIcon } from '@/utils/node-icon';
import Icon from '@/components/ui/icon';
import nodeStyles from '@/styles/nodes.module.css';
import styles from './index.module.css';

interface Props {
  type: NodeType;
}

export default function NodeIcon({ type }: Props) {
  const icon = getNodeIcon(type);
  return (
    <div className={`${styles['node-icon']} ${nodeStyles[type]}`}>
      <Icon icon={icon} />
    </div>
  );
}
