import type { FocusEvent, MouseEvent } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import NodeIcon from '@/components/app/node-icon';
import NodeTag from '@/components/app/node-tag';
import { pendingConnectionAtom, selectedNodeIdAtom, updateNodeActionAtom } from '@/stores/diagram';
import type { DiagramNode, Port } from '@/types';
import { contextMenuAtom } from '@/stores/context-menu';
import type { StartDrag } from '../../hooks/node-drag';
import NodePort from '../node-port';
import styles from './index.module.css';

const PORTS = ['top', 'right', 'bottom', 'left'] as const satisfies ReadonlyArray<Port>;

interface Props {
  node: DiagramNode;
  startDrag: StartDrag;
}

export default function NodeItem({ node, startDrag }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom);
  const pendingConnection = useAtomValue(pendingConnectionAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const updateNode = useSetAtom(updateNodeActionAtom);

  const handleClick = () => {
    if (!pendingConnection) {
      setSelectedNodeId(node.id);
    }
  };

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

  const onTitleBlur = (event: FocusEvent<HTMLDivElement, Element>) => {
    const text = event.currentTarget.textContent ?? '';
    updateNode({
      nodeId: node.id,
      updater: (current) => ({ ...current, label: text }),
    });
  };

  const connectingNode = pendingConnection?.nodeId === node.id;
  const className = [
    styles['node-item'],
    selectedNodeId === node.id ? styles['node-item--selected'] : '',
    connectingNode ? styles['node-item--connection-source'] : '',
  ]
    .join(' ')
    .trim();
  const style = { left: node.x, top: node.y };

  return (
    <div
      key={node.id}
      id={`node-${node.id}`}
      className={className}
      style={style}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={onContextMenu}
    >
      {PORTS.map((port) => (
        <NodePort key={`${node.id}-${port}`} nodeId={node.id} port={port} active={connectingNode} />
      ))}
      <div className={styles['node-item__header']}>
        <NodeIcon type={node.type} />
        <div
          className={styles['node-item__header-title']}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onMouseDown={(event) => event.stopPropagation()}
          onBlur={onTitleBlur}
        >
          {node.label}
        </div>
      </div>
      <div className={styles['node-item__body']}>
        <div className={styles['node-item__body-meta']}>{node.meta}</div>
        <NodeTag type={node.type} tag={node.tag} />
      </div>
    </div>
  );
}
