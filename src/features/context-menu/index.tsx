import { useAtom } from 'jotai';
import { contextMenuAtom } from '@/stores/context-menu';
import NodeActions from '@/components/app/node-actions';
import styles from './index.module.css';

export default function ContextMenu() {
  const [contextMenu, setContextMenu] = useAtom(contextMenuAtom);

  if (!contextMenu) {
    return null;
  }

  return (
    <div
      className={styles['context-menu']}
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onMouseLeave={() => setContextMenu(null)}
    >
      <NodeActions nodeId={contextMenu.nodeId} />
    </div>
  );
}
