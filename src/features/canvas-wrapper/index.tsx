import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { panXAtom, panYAtom, zoomAtom } from '@/stores/canvas';
import { nodesAtom } from '@/stores/diagram';
import EdgeConnector from './components/edge-connector';
import EdgeLayer from './components/edge-layer';
import NodeItem from './components/node-item';
import { useCanvasEvents } from './hooks/canvas-events';
import { useCanvasZoom } from './hooks/canvas-zoom';
import { useKeyboardShortcuts } from './hooks/keyboard-shortcuts';
import styles from './index.module.css';

export default function CanvasWrapper() {
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts();
  const { startDrag, onMouseDown, onDrop } = useCanvasEvents(wrapperRef);
  useCanvasZoom(wrapperRef);

  const zoom = useAtomValue(zoomAtom);
  const panX = useAtomValue(panXAtom);
  const panY = useAtomValue(panYAtom);
  const nodes = useAtomValue(nodesAtom);

  const canvasStyle: CSSProperties = {
    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={clsx(styles['canvas-wrapper'], styles['canvas-wrapper--panning'])}
      onMouseDown={onMouseDown}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <div className={styles['canvas-wrapper__canvas']} style={canvasStyle}>
        <EdgeConnector />
        {mounted && <EdgeLayer />}
        {nodes.map((node) => (
          <NodeItem key={node.id} node={node} startDrag={startDrag} />
        ))}
      </div>
    </div>
  );
}
