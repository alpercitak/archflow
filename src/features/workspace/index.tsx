import CanvasWrapper from '../canvas-wrapper';
import NodeInspector from '../node-inspector';
import NodeLibrary from '../node-library';
import styles from './index.module.css';

export default function Workspace() {
  return (
    <div className={styles['workspace']}>
      <NodeLibrary />
      <CanvasWrapper />
      <NodeInspector />
    </div>
  );
}
