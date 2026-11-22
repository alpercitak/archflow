import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import Link from '@/components/ui/link';
import { GITHUB_LINK } from '@/constants';
import { cursorWorldAtom } from '@/stores/cursor';
import { edgesAtom, nodesAtom } from '@/stores/diagram';
import { simulationResultAtom } from '@/stores/simulation';
import styles from './index.module.css';

export default function StatusBar() {
  const cursorWorld = useAtomValue(cursorWorldAtom);
  const nodes = useAtomValue(nodesAtom);
  const edges = useAtomValue(edgesAtom);
  const simResult = useAtomValue(simulationResultAtom);

  const nodesText = useMemo(() => {
    return `${nodes.length} node${nodes.length !== 1 ? 's' : ''}`;
  }, [nodes]);

  const edgesText = useMemo(() => {
    return `${edges.length} edge${edges.length !== 1 ? 's' : ''}`;
  }, [edges]);

  const positionText = useMemo(() => {
    return `x: ${Math.round(cursorWorld.x)}, y: ${Math.round(cursorWorld.y)}`;
  }, [cursorWorld]);

  const clientLatencies = simResult ? [...simResult.clientLatencyMs.values()] : [];
  const avgLatencyMs = clientLatencies.reduce((sum, ms) => sum + ms, 0) / clientLatencies.length;

  return (
    <div className={styles['status-bar']}>
      <span>
        <span className={styles['status-bar__dot']} />
        Ready
      </span>
      <span>{nodesText}</span>
      <span>{edgesText}</span>
      <span>{positionText}</span>
      {simResult ? (
        <>
          <span>{`throughput ${Math.round(simResult.throughputRps)} rps`}</span>
          <span>{`dropped ${Math.round(simResult.droppedRps)} rps`}</span>
          {clientLatencies.length > 0 ? <span>{`latency ${Math.round(avgLatencyMs)} ms`}</span> : null}
          {simResult.cycleNodeIds.length > 0 ? (
            <span>{`${simResult.cycleNodeIds.length} in cycles skipped`}</span>
          ) : null}
        </>
      ) : null}
      <div className={styles['status-bar__right']}>
        <Link href={GITHUB_LINK} external>
          Github
        </Link>
      </div>
    </div>
  );
}
