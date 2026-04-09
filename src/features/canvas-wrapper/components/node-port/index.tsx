import type { MouseEvent } from 'react';
import { useSetAtom } from 'jotai';
import { startConnectingActionAtom } from '@/stores/diagram';
import type { Port } from '@/types';
import styles from './index.module.css';

type Props = {
  nodeId: number;
  port: Port;
  active: boolean;
};

export default function NodePort({ nodeId, port, active }: Props) {
  const startConnecting = useSetAtom(startConnectingActionAtom);

  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    startConnecting({ nodeId, port });
  };

  const className = [
    styles['node-port'],
    `${styles[`node-port__${port}`]}`,
    active ? styles['node-port--active'] : '',
  ].join(' ');

  return <div key={port} className={className} onMouseDown={onMouseDown} />;
}
