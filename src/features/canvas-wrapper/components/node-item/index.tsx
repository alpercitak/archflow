import clsx from 'clsx';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { type MouseEvent, useLayoutEffect, useRef } from 'react';
import NodeIcon from '@/components/app/node-icon';
import NodeTag from '@/components/app/node-tag';
import { contextMenuAtom } from '@/stores/context-menu';
import {
  forgetNodeActionAtom,
  pendingConnectionAtom,
  selectedNodeIdAtom,
  setNodeSizeActionAtom,
} from '@/stores/diagram';
import { effectiveHealthAtom, simulationResultAtom } from '@/stores/simulation';
import type { DiagramNode, Port } from '@/types';
import type { StartDrag } from '../../hooks/node-drag';
import NodePort from '../node-port';
import styles from './index.module.css';

interface NodeItemProps {
  node: DiagramNode;
  startDrag: StartDrag;
}

const PORTS = ['top', 'right', 'bottom', 'left'] as const satisfies ReadonlyArray<Port>;

export default function NodeItem({ node, startDrag }: NodeItemProps) {
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom);
  const pendingConnection = useAtomValue(pendingConnectionAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const simResult = useAtomValue(simulationResultAtom);
  const sim = simResult?.nodes.get(node.id);
  const health = useAtomValue(effectiveHealthAtom).get(node.id);
  const setNodeSize = useSetAtom(setNodeSizeActionAtom);
  const forgetNode = useSetAtom(forgetNodeActionAtom);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const report = () => setNodeSize({ nodeId: node.id, width: el.offsetWidth, height: el.offsetHeight });
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => {
      observer.disconnect();
      forgetNode(node.id);
    };
  }, [node.id, setNodeSize, forgetNode]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) {
      return;
    }
    setSelectedNodeId(node.id);
    startDrag(e.nativeEvent, node);
  };

  const onContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setSelectedNodeId(node.id);
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
  };

  const connectingNode = pendingConnection?.nodeId === node.id;
  const className = clsx(
    styles['node-item'],
    selectedNodeId === node.id && styles['node-item--selected'],
    connectingNode && styles['node-item--connection-source'],
    sim && styles[`node-item--sim-${sim.status}`],
    health === 'degraded' && styles['node-item--degraded'],
  );
  const style = { left: node.x, top: node.y };

  return (
    <div ref={ref} className={className} style={style} onMouseDown={handleMouseDown} onContextMenu={onContextMenu}>
      {PORTS.map((port) => (
        <NodePort key={`${node.id}-${port}`} nodeId={node.id} port={port} active={connectingNode} />
      ))}
      {sim ? (
        <span className={styles['node-item__sim']}>
          {sim.status === 'down'
            ? 'down'
            : node.type === 'client'
              ? `${Math.round(sim.inRps)} rps`
              : `${Math.round(sim.utilization * 100)}%`}
        </span>
      ) : null}
      <div className={styles['node-item__header']}>
        <NodeIcon type={node.type} />
        <div className={styles['node-item__header-title']}>{node.label}</div>
      </div>
      <div className={styles['node-item__body']}>
        <div className={styles['node-item__body-meta']}>{node.meta}</div>
        <NodeTag type={node.type} tag={node.tag} />
      </div>
    </div>
  );
}
