import { useAtomValue } from 'jotai';
import { edgesAtom } from '@/stores/diagram';
import EdgeItem from '../edge-item';
import styles from './index.module.css';

export default function EdgeLayer() {
  const edges = useAtomValue(edgesAtom);

  return (
    <svg className={styles['edge-layer']}>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" className={styles['edge-layer__arrow']} />
        </marker>
      </defs>
      {edges.map((edge) => (
        <EdgeItem key={`${edge.from}-${edge.to}`} edge={edge} />
      ))}
    </svg>
  );
}
