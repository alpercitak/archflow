import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Pause, Play, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  resetSimulationActionAtom,
  type SimSpeed,
  simHistoryAtom,
  simPlayingAtom,
  simSpeedAtom,
  simTimeAtom,
  simulationEnabledAtom,
} from '@/stores/simulation';
import { SIM_SPEEDS } from '@/stores/simulation/constants';
import type { SimSample } from '@/types';
import { useSimClock } from './hooks/sim-clock';
import styles from './index.module.css';

const maxOf = (values: Array<number>): number => Math.max(1, ...values);

const toPoints = (values: Array<number>, max: number): string =>
  values
    .map((value, i) => {
      const x = values.length > 1 ? (i / (values.length - 1)) * 100 : 0;
      return `${x},${100 - (value / max) * 100}`;
    })
    .join(' ');

const nextSpeed = (speed: SimSpeed): SimSpeed => SIM_SPEEDS.find((s) => s > speed) ?? SIM_SPEEDS[0];

const formatValue = (sample: SimSample | undefined, pick: (s: SimSample) => number): string =>
  sample ? `${Math.round(pick(sample))}` : '-';

export default function SimTimeline() {
  const enabled = useAtomValue(simulationEnabledAtom);
  const [playing, setPlaying] = useAtom(simPlayingAtom);
  const [speed, setSpeed] = useAtom(simSpeedAtom);
  const time = useAtomValue(simTimeAtom);
  const history = useAtomValue(simHistoryAtom);
  const reset = useSetAtom(resetSimulationActionAtom);
  useSimClock();

  if (!enabled) {
    return null;
  }

  const flowMax = maxOf(history.map((s) => s.throughputRps + s.droppedRps));
  const latencyMax = maxOf(history.map((s) => s.latencyMs));
  const last = history.at(-1);

  return (
    <div className={styles['sim-timeline']}>
      <div className={styles['sim-timeline__controls']}>
        <Button onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
          <Icon icon={playing ? Pause : Play} />
        </Button>
        <Button onClick={() => reset()} aria-label="Reset">
          <Icon icon={RotateCcw} />
        </Button>
        <Button onClick={() => setSpeed(nextSpeed(speed))} aria-label="Speed">
          {`${speed}×`}
        </Button>
        <span className={styles['sim-timeline__time']}>{`t = ${time.toFixed(1)}s`}</span>
      </div>
      <div className={styles['sim-timeline__chart']}>
        <svg
          className={styles['sim-timeline__svg']}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label="Simulation history"
        >
          <polyline
            className={styles['sim-timeline__line--throughput']}
            points={toPoints(
              history.map((s) => s.throughputRps),
              flowMax,
            )}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            className={styles['sim-timeline__line--dropped']}
            points={toPoints(
              history.map((s) => s.droppedRps),
              flowMax,
            )}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            className={styles['sim-timeline__line--latency']}
            points={toPoints(
              history.map((s) => s.latencyMs),
              latencyMax,
            )}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className={styles['sim-timeline__legend']}>
          <span className={styles['sim-timeline__legend-item--throughput']}>
            {`throughput ${formatValue(last, (s) => s.throughputRps)} rps`}
          </span>
          <span className={styles['sim-timeline__legend-item--dropped']}>
            {`dropped ${formatValue(last, (s) => s.droppedRps)} rps`}
          </span>
          <span className={styles['sim-timeline__legend-item--latency']}>
            {`latency ${formatValue(last, (s) => s.latencyMs)} ms`}
          </span>
        </div>
      </div>
    </div>
  );
}
