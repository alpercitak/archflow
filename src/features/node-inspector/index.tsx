import { useAtomValue } from 'jotai';
import { Circle, Diamond } from 'lucide-react';
import { useMemo } from 'react';
import NodeActions from '@/components/app/node-actions';
import { edgesAtom, nodesAtom, selectedNodeIdAtom } from '@/stores/diagram';
import { simulationResultAtom } from '@/stores/simulation';
import { SIM_DEFAULTS } from '@/stores/simulation/constants';
import InputField from './components/input-field';
import NumberField from './components/number-field';
import ProfileFields from './components/profile-fields';
import styles from './index.module.css';

export default function NodeInspector() {
  const nodes = useAtomValue(nodesAtom);
  const edges = useAtomValue(edgesAtom);
  const selectedNodeId = useAtomValue(selectedNodeIdAtom);
  const simResult = useAtomValue(simulationResultAtom);

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);

  const selectedNodeConnections = useMemo(() => {
    if (!selectedNodeId) {
      return 0;
    }
    return edges.filter((edge) => edge.from === selectedNodeId || edge.to === selectedNodeId).length;
  }, [edges, selectedNodeId]);

  if (!selectedNode) {
    return (
      <div className={styles['node-inspector']}>
        <div className={styles['node-inspector__empty']}>
          <Diamond />
          <div className={styles['node-inspector__empty-title']}>Select a node to inspect its properties</div>
        </div>
      </div>
    );
  }

  const sim = simResult?.nodes.get(selectedNode.id);

  return (
    <div className={styles['node-inspector']}>
      <div className={styles['node-inspector__header']}>
        <div className={styles['node-inspector__title']}>{selectedNode.type}</div>
        <div className={styles['node-inspector__name']}>{selectedNode.label}</div>
      </div>
      <div className={styles['node-inspector__section']}>
        <div className={styles['node-inspector__section-title']}>Properties</div>
        <InputField node={selectedNode} label="Label" field="label" />
        <InputField node={selectedNode} label="Sublabel" field="meta" />
        <InputField node={selectedNode} label="Protocol" field="tag" />
        {selectedNode.type === 'client' ? (
          <>
            <NumberField node={selectedNode} label="Load rps" field="load" placeholder={SIM_DEFAULTS.client.load} />
            <ProfileFields node={selectedNode} />
          </>
        ) : null}
        {selectedNode.type !== 'client' && selectedNode.type !== 'note' ? (
          <>
            <NumberField
              node={selectedNode}
              label="Capacity rps"
              field="capacity"
              placeholder={SIM_DEFAULTS[selectedNode.type].capacity}
            />
            <NumberField
              node={selectedNode}
              label="Latency ms"
              field="latencyMs"
              placeholder={SIM_DEFAULTS[selectedNode.type].latencyMs}
            />
          </>
        ) : null}
      </div>
      <div className={styles['node-inspector__section']}>
        <div className={styles['node-inspector__section-title']}>Status</div>
        {sim ? (
          <>
            <div className={styles['node-inspector__property']}>
              <span className={styles['node-inspector__property-label']}>state</span>
              <span className={styles['node-inspector__property-value']}>
                <Circle fill="currentColor" size={6} />
                {sim.status}
              </span>
            </div>
            <div className={styles['node-inspector__property']}>
              <span className={styles['node-inspector__property-label']}>load</span>
              <span className={styles['node-inspector__property-value']}>{`${Math.round(sim.inRps)} rps`}</span>
            </div>
            {selectedNode.type !== 'client' ? (
              <div className={styles['node-inspector__property']}>
                <span className={styles['node-inspector__property-label']}>utilization</span>
                <span className={styles['node-inspector__property-value']}>
                  {`${Math.round(sim.utilization * 100)}%`}
                </span>
              </div>
            ) : null}
            <div className={styles['node-inspector__property']}>
              <span className={styles['node-inspector__property-label']}>latency</span>
              <span className={styles['node-inspector__property-value']}>{`${Math.round(sim.latencyMs)} ms`}</span>
            </div>
          </>
        ) : null}
        <div className={styles['node-inspector__property']}>
          <span className={styles['node-inspector__property-label']}>connections</span>
          <span className={styles['node-inspector__property-value']}>{selectedNodeConnections}</span>
        </div>
      </div>
      <div className={styles['node-inspector__section']}>
        <div className={styles['node-inspector__section-title']}>Actions</div>
        <NodeActions nodeId={selectedNode.id} />
      </div>
    </div>
  );
}
