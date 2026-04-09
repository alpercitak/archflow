import CanvasWrapper from '../canvas-wrapper';
import NodeLibrary from '../node-library';
import NodeInspector from '../node-inspector';
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
