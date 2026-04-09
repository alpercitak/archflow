import { useAtomValue } from 'jotai';
import { zoomAtom } from '@/stores/canvas';
import styles from './index.module.css';

export default function ZoomDisplay() {
  const zoom = useAtomValue(zoomAtom);
  return <span className={styles['zoom-display']}>{Math.round(zoom * 100)}%</span>;
}
