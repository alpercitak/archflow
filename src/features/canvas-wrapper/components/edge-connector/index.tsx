import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { cursorWorldAtom } from '@/stores/cursor';
import { nodesAtom, pendingConnectionAtom } from '@/stores/diagram';
import { getPortPosition } from '@/utils/port-position';
import { getCubicPath } from '@/utils/cubic-path';
import styles from './index.module.css';

export default function EdgeConnector() {
  const nodes = useAtomValue(nodesAtom);
  const pendingConnection = useAtomValue(pendingConnectionAtom);
  const cursorWorld = useAtomValue(cursorWorldAtom);

  const sourceNode = useMemo(
    () => nodes.find((node) => node.id === pendingConnection?.nodeId),
    [pendingConnection?.nodeId, nodes],
  );

  const tempPath = useMemo(() => {
    if (!pendingConnection || !sourceNode) {
      return '';
    }
    const from = getPortPosition(sourceNode, pendingConnection.port);
    return getCubicPath(from.x, from.y, cursorWorld.x, cursorWorld.y);
  }, [pendingConnection, sourceNode, cursorWorld]);

  if (!pendingConnection) {
    return null;
  }

  return (
    <svg className={styles['edge-connector']}>
      <path className={styles['edge-connector__path']} d={tempPath} />
    </svg>
  );
}
