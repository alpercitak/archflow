import { useSetAtom } from 'jotai';
import { ArrowRightFromLine, Copy, X } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { deleteNodeActionAtom, duplicateNodeActionAtom, startConnectingActionAtom } from '@/stores/diagram';
import styles from './index.module.css';

type Props = {
  nodeId: number;
};

export default function NodeActions({ nodeId }: Props) {
  const duplicateNode = useSetAtom(duplicateNodeActionAtom);
  const startConnecting = useSetAtom(startConnectingActionAtom);
  const deleteNode = useSetAtom(deleteNodeActionAtom);

  return (
    <div>
      <Button onClick={() => duplicateNode(nodeId)}>
        <Icon icon={Copy} />
        Duplicate node
      </Button>
      <Button onClick={() => startConnecting({ nodeId: nodeId, port: 'right' })}>
        <Icon icon={ArrowRightFromLine} />
        Start connection
      </Button>
      <div className={styles['node-actions__divider']} />
      <Button onClick={() => deleteNode(nodeId)}>
        <Icon icon={X} />
        Delete node
      </Button>
    </div>
  );
}
