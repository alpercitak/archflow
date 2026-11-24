import { useAtomValue, useSetAtom } from 'jotai';
import type { MouseEvent } from 'react';
import { contextMenuAtom } from '@/stores/context-menu';
import { nodeByIdAtom, nodeSizesAtom } from '@/stores/diagram';
import { simulationResultAtom } from '@/stores/simulation';
import type { DiagramEdge } from '@/types';
import { getCubicPath } from '@/utils/cubic-path';
import { getPortPosition } from '@/utils/port-position';
import styles from './index.module.css';

interface Props {
  edge: DiagramEdge;
}

export default function EdgeItem({ edge }: Props) {
  const setContextMenu = useSetAtom(contextMenuAtom);
  const fromNode = useAtomValue(nodeByIdAtom(edge.from));
  const toNode = useAtomValue(nodeByIdAtom(edge.to));
  const simResult = useAtomValue(simulationResultAtom);
  const sizes = useAtomValue(nodeSizesAtom);

  if (!fromNode || !toNode) {
    return null;
  }

  const from = getPortPosition(fromNode, edge.fromPort, sizes.get(fromNode.id));
  const to = getPortPosition(toNode, edge.toPort, sizes.get(toNode.id));
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - 8;
  const d = getCubicPath(from.x, from.y, to.x, to.y);
  const rps = simResult?.edges.get(edge.id);
  const labelText =
    rps === undefined ? edge.label : edge.label ? `${edge.label} · ${Math.round(rps)} rps` : `${Math.round(rps)} rps`;

  const openMenu = (event: MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, edgeId: edge.id });
  };

  return (
    <g className={styles['edge-item']}>
      <path className={styles['edge-item__path']} d={d} markerEnd="url(#arrowhead)" />
      <path className={styles['edge-item__hit']} d={d} onContextMenu={openMenu} onDoubleClick={openMenu} />
      {labelText ? (
        <text className={styles['edge-item__label']} x={midX} y={midY} textAnchor="middle">
          {labelText}
        </text>
      ) : null}
    </g>
  );
}
