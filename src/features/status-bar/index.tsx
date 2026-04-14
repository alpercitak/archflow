import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import Link from '@/components/ui/link';
import { GITHUB_LINK } from '@/constants';
import { cursorWorldAtom } from '@/stores/cursor';
import { edgesAtom, nodesAtom } from '@/stores/diagram';
import styles from './index.module.css';

export default function StatusBar() {
  const cursorWorld = useAtomValue(cursorWorldAtom);
  const nodes = useAtomValue(nodesAtom);
  const edges = useAtomValue(edgesAtom);

  const nodesText = useMemo(() => {
    return `${nodes.length} node${nodes.length !== 1 ? 's' : ''}`;
  }, [nodes]);

  const edgesText = useMemo(() => {
    return `${edges.length} edge${edges.length !== 1 ? 's' : ''}`;
  }, [edges]);

  const positionText = useMemo(() => {
    return `x: ${Math.round(cursorWorld.x)}, y: ${Math.round(cursorWorld.y)}`;
  }, [cursorWorld]);

  return (
    <div className={styles['status-bar']}>
      <span>
        <span className={styles['status-bar__dot']} />
        Ready
      </span>
      <span>{nodesText}</span>
      <span>{edgesText}</span>
      <span>{positionText}</span>
      <div className={styles['status-bar__right']}>
        <Link href={GITHUB_LINK} external>
          Github
        </Link>
      </div>
    </div>
  );
}
