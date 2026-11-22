import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { cursorWorldAtom } from '@/stores/cursor';
import { nodeSizesAtom, nodesAtom, pendingConnectionAtom } from '@/stores/diagram';
import { getCubicPath } from '@/utils/cubic-path';
import { getPortPosition } from '@/utils/port-position';
import styles from './index.module.css';

export default function EdgeConnector() {
  const nodes = useAtomValue(nodesAtom);
  const pendingConnection = useAtomValue(pendingConnectionAtom);
  const cursorWorld = useAtomValue(cursorWorldAtom);
  const sizes = useAtomValue(nodeSizesAtom);

  const sourceNode = useMemo(
    () => nodes.find((node) => node.id === pendingConnection?.nodeId),
    [pendingConnection?.nodeId, nodes],
  );

  const tempPath = useMemo(() => {
    if (!pendingConnection || !sourceNode) {
      return '';
    }
    const from = getPortPosition(sourceNode, pendingConnection.port, sizes.get(sourceNode.id));
    return getCubicPath(from.x, from.y, cursorWorld.x, cursorWorld.y);
  }, [pendingConnection, sourceNode, cursorWorld, sizes]);

  if (!pendingConnection) {
    return null;
  }

  return (
    <svg className={styles['edge-connector']} aria-hidden="true">
      <path className={styles['edge-connector__path']} d={tempPath} />
    </svg>
  );
}
