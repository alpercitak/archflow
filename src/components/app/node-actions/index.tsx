import { useAtomValue, useSetAtom } from 'jotai';
import { ArrowRightFromLine, Copy, Gauge, Power, RotateCcw, X } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { deleteNodeActionAtom, duplicateNodeActionAtom, nodesAtom, startConnectingActionAtom } from '@/stores/diagram';
import { setNodeHealthActionAtom, simHealthAtom, simulationEnabledAtom } from '@/stores/simulation';
import styles from './index.module.css';

interface Props {
  nodeId: number;
}

export default function NodeActions({ nodeId }: Props) {
  const duplicateNode = useSetAtom(duplicateNodeActionAtom);
  const startConnecting = useSetAtom(startConnectingActionAtom);
  const deleteNode = useSetAtom(deleteNodeActionAtom);
  const simulating = useAtomValue(simulationEnabledAtom);
  const nodeType = useAtomValue(nodesAtom).find((node) => node.id === nodeId)?.type;
  const health = useAtomValue(simHealthAtom).get(nodeId);
  const setNodeHealth = useSetAtom(setNodeHealthActionAtom);

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
      {simulating && nodeType !== 'note' ? (
        <>
          <div className={styles['node-actions__divider']} />
          {health === undefined ? (
            <>
              <Button onClick={() => setNodeHealth({ nodeId, health: 'down' })}>
                <Icon icon={Power} />
                Fail node
              </Button>
              <Button onClick={() => setNodeHealth({ nodeId, health: 'degraded' })}>
                <Icon icon={Gauge} />
                Degrade node
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setNodeHealth({ nodeId, health: null })}>
                <Icon icon={RotateCcw} />
                Recover node
              </Button>
              {health === 'down' ? (
                <Button onClick={() => setNodeHealth({ nodeId, health: 'degraded' })}>
                  <Icon icon={Gauge} />
                  Degrade node
                </Button>
              ) : (
                <Button onClick={() => setNodeHealth({ nodeId, health: 'down' })}>
                  <Icon icon={Power} />
                  Fail node
                </Button>
              )}
            </>
          )}
        </>
      ) : null}
      <div className={styles['node-actions__divider']} />
      <Button onClick={() => deleteNode(nodeId)}>
        <Icon icon={X} />
        Delete node
      </Button>
    </div>
  );
}
