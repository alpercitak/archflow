import type { NodeType } from '@/types';
import { getNodeIcon } from '@/utils/node-icon';
import Icon from '@/components/ui/icon';
import styles from './index.module.css';
import nodeStyles from '@/styles/nodes.module.css';

type Props = {
  type: NodeType;
};

export default function NodeIcon({ type }: Props) {
  const icon = getNodeIcon(type);
  const className = [styles['node-icon'], nodeStyles[type]].join(' ');
  return (
    <div className={className}>
      <Icon icon={icon} />
    </div>
  );
}
