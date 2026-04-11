import type { MouseEvent } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import clsx from 'clsx';
import { finishConnectingActionAtom, pendingConnectionAtom, startConnectingActionAtom } from '@/stores/diagram';
import type { Port } from '@/types';
import styles from './index.module.css';

type Props = {
  nodeId: number;
  port: Port;
  active: boolean;
};

export default function NodePort({ nodeId, port, active }: Props) {
  const startConnecting = useSetAtom(startConnectingActionAtom);
  const finishConnecting = useSetAtom(finishConnectingActionAtom);
  const pendingConnection = useAtomValue(pendingConnectionAtom);

  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    if (pendingConnection) {
      finishConnecting({ toNodeId: nodeId, toPort: port });
    } else {
      startConnecting({ nodeId, port });
    }
  };

  const className = clsx(styles['node-port'], styles[`node-port__${port}`], active && styles['node-port--active']);

  return <div key={port} className={className} onMouseDown={onMouseDown} />;
}
