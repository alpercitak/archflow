import { useAtomValue, useSetAtom } from 'jotai';
import type { MouseEvent } from 'react';
import { edgesAtom, nodeByIdAtom } from '@/stores/diagram';
import { simulationResultAtom } from '@/stores/simulation';
import type { DiagramEdge } from '@/types';
import { getCubicPath } from '@/utils/cubic-path';
import { getPortPosition } from '@/utils/port-position';
import styles from './index.module.css';

interface Props {
  edge: DiagramEdge;
}

export default function EdgeItem({ edge }: Props) {
  const setEdges = useSetAtom(edgesAtom);
  const fromNode = useAtomValue(nodeByIdAtom(edge.from));
  const toNode = useAtomValue(nodeByIdAtom(edge.to));
  const simResult = useAtomValue(simulationResultAtom);

  if (!fromNode || !toNode) {
    return null;
  }

  const from = getPortPosition(fromNode, edge.fromPort);
  const to = getPortPosition(toNode, edge.toPort);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - 8;
  const d = getCubicPath(from.x, from.y, to.x, to.y);
  const rps = simResult?.edges.get(edge.id);
  const labelText =
    rps === undefined ? edge.label : edge.label ? `${edge.label} · ${Math.round(rps)} rps` : `${Math.round(rps)} rps`;

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    const confirmed = window.confirm('Delete this connection?');
    if (confirmed) {
      setEdges((current) => current.filter((currentEdge) => currentEdge.id !== edge.id));
    }
  };

  const onDoubleClick = () => {
    const label = window.prompt('Edge label', edge.label);
    if (label !== null) {
      setEdges((current) =>
        current.map((currentEdge) =>
          currentEdge.id === edge.id ? { ...currentEdge, label: label.trim() } : currentEdge,
        ),
      );
    }
  };

  return (
    <g>
      <path
        className={styles['edge-item__path']}
        d={d}
        markerEnd="url(#arrowhead)"
        onContextMenu={onContextMenu}
        onDoubleClick={onDoubleClick}
      />
      {labelText ? (
        <text className={styles['edge-item__label']} x={midX} y={midY} textAnchor="middle">
          {labelText}
        </text>
      ) : null}
    </g>
  );
}
