import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Pause, Play, RotateCcw } from 'lucide-react';
import type { ChangeEvent } from 'react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { nodesAtom, replaceDiagramActionAtom } from '@/stores/diagram';
import { DEFAULT_EDGES } from '@/stores/diagram/constants';
import {
  resetSimulationActionAtom,
  type SimSpeed,
  simAutoFailAtom,
  simEventsAtom,
  simHistoryAtom,
  simPlayingAtom,
  simSpeedAtom,
  simTimeAtom,
  simulationEnabledAtom,
} from '@/stores/simulation';
import { SIM_SPEEDS } from '@/stores/simulation/constants';
import type { SimSample } from '@/types';
import { SCENARIOS } from './constants';
import { useSimClock } from './hooks/sim-clock';
import styles from './index.module.css';

const maxOf = (values: Array<number>): number => Math.max(1, ...values);

const nextSpeed = (speed: SimSpeed): SimSpeed => SIM_SPEEDS.find((s) => s > speed) ?? SIM_SPEEDS[0];

const formatValue = (sample: SimSample | undefined, pick: (s: SimSample) => number): string =>
  sample ? `${Math.round(pick(sample))}` : '-';

export default function SimTimeline() {
  const enabled = useAtomValue(simulationEnabledAtom);
  const [playing, setPlaying] = useAtom(simPlayingAtom);
  const [speed, setSpeed] = useAtom(simSpeedAtom);
  const [autoFail, setAutoFail] = useAtom(simAutoFailAtom);
  const time = useAtomValue(simTimeAtom);
  const history = useAtomValue(simHistoryAtom);
  const events = useAtomValue(simEventsAtom);
  const nodes = useAtomValue(nodesAtom);
  const reset = useSetAtom(resetSimulationActionAtom);
  const replaceDiagram = useSetAtom(replaceDiagramActionAtom);
  useSimClock();

  if (!enabled) {
    return null;
  }

  const firstT = history[0]?.t ?? 0;
  const lastT = history.at(-1)?.t ?? 0;
  const spanT = lastT - firstT;
  const toX = (t: number): number => (spanT > 0 ? ((t - firstT) / spanT) * 100 : 0);
  const toPoints = (pick: (s: SimSample) => number, max: number): string =>
    history.map((s) => `${toX(s.t)},${100 - (pick(s) / max) * 100}`).join(' ');

  const flowMax = maxOf(history.map((s) => s.throughputRps + s.droppedRps));
  const latencyMax = maxOf(history.map((s) => s.latencyMs));
  const last = history.at(-1);

  const labeledEvents = events.flatMap((event) => {
    const label = nodes.find((node) => node.id === event.nodeId)?.label;
    return label ? [{ event, label: `${event.t.toFixed(1)}s ${label} ${event.health}` }] : [];
  });
  const markers = labeledEvents.filter(({ event }) => event.t >= firstT && event.t <= lastT);
  const recentEvents = labeledEvents.slice(-3);

  const onScenario = (event: ChangeEvent<HTMLSelectElement>) => {
    const scenario = SCENARIOS.find((s) => s.id === event.target.value);
    if (!scenario || !window.confirm(`Replace the canvas with the "${scenario.label}" scenario?`)) {
      return;
    }
    replaceDiagram({ nodes: scenario.nodes, edges: DEFAULT_EDGES });
    reset();
    setPlaying(true);
  };

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
        <Button active={autoFail} onClick={() => setAutoFail(!autoFail)}>
          Auto-fail
        </Button>
        <select className={styles['sim-timeline__scenario']} value="" onChange={onScenario}>
          <option value="">Scenario…</option>
          {SCENARIOS.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.label}
            </option>
          ))}
        </select>
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
            points={toPoints((s) => s.throughputRps, flowMax)}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            className={styles['sim-timeline__line--dropped']}
            points={toPoints((s) => s.droppedRps, flowMax)}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            className={styles['sim-timeline__line--latency']}
            points={toPoints((s) => s.latencyMs, latencyMax)}
            vectorEffect="non-scaling-stroke"
          />
          {markers.map(({ event, label }) => (
            <line
              key={`${event.t}-${event.nodeId}-${event.health}`}
              className={styles[`sim-timeline__marker--${event.health}`]}
              x1={toX(event.t)}
              x2={toX(event.t)}
              y1={0}
              y2={100}
              vectorEffect="non-scaling-stroke"
            >
              <title>{label}</title>
            </line>
          ))}
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
        <div className={styles['sim-timeline__events']}>
          {recentEvents.map(({ event, label }) => (
            <span
              key={`${event.t}-${event.nodeId}-${event.health}`}
              className={styles[`sim-timeline__event--${event.health}`]}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
