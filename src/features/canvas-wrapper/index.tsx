import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useAtomValue } from 'jotai';
import { panXAtom, panYAtom, toolModeAtom, zoomAtom } from '@/stores/canvas';
import { nodesAtom } from '@/stores/diagram';
import EdgeLayer from './components/edge-layer';
import EdgeConnector from './components/edge-connector';
import NodeItem from './components/node-item';
import { useCanvasZoom } from './hooks/canvas-zoom';
import { useKeyboardShortcuts } from './hooks/keyboard-shortcuts';
import { useCanvasEvents } from './hooks/canvas-events';
import styles from './index.module.css';

export default function CanvasWrapper() {
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts();
  const { startDrag, onMouseDown, onDrop } = useCanvasEvents(wrapperRef);
  const { handleWheel } = useCanvasZoom(wrapperRef);

  const zoom = useAtomValue(zoomAtom);
  const panX = useAtomValue(panXAtom);
  const panY = useAtomValue(panYAtom);
  const toolMode = useAtomValue(toolModeAtom);
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
      className={`${styles['canvas-wrapper']} ${toolMode === 'pan' ? styles['canvas-wrapper--panning'] : ''}`}
      onWheel={handleWheel}
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
