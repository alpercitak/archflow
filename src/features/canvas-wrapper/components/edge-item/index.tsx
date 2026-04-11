import { useAtomValue, useSetAtom } from 'jotai';
import { edgesAtom, nodeByIdAtom } from '@/stores/diagram';
import { getPortPosition } from '@/utils/port-position';
import { getCubicPath } from '@/utils/cubic-path';
import type { DiagramEdge } from '@/types';
import styles from './index.module.css';

export default function EdgeItem({ edge }: { edge: DiagramEdge }) {
  const setEdges = useSetAtom(edgesAtom);
  const fromNode = useAtomValue(nodeByIdAtom(edge.from));
  const toNode = useAtomValue(nodeByIdAtom(edge.to));

  if (!fromNode || !toNode) {
    return null;
  }

  const from = getPortPosition(fromNode, edge.fromPort);
  const to = getPortPosition(toNode, edge.toPort);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - 8;
  const d = getCubicPath(from.x, from.y, to.x, to.y);

  const onContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    const confirmed = window.confirm('Delete this connection?');
    if (confirmed) {
      setEdges((current) => current.filter((currentEdge) => currentEdge.id !== edge.id));
    }
  };

  return (
    <g key={edge.id}>
      <path className={styles['edge-item__path']} d={d} markerEnd="url(#arrowhead)" onContextMenu={onContextMenu} />
      {edge.label ? (
        <text className={styles['edge-item__label']} x={midX} y={midY} textAnchor="middle">
          {edge.label}
        </text>
      ) : null}
    </g>
  );
}
