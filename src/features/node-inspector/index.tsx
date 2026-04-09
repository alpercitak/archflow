import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { Circle, Diamond } from 'lucide-react';
import { edgesAtom, nodesAtom, selectedNodeIdAtom } from '@/stores/diagram';
import NodeActions from '@/components/app/node-actions';
import InputField from './components/input-field';
import styles from './index.module.css';

export default function NodeInspector() {
  const nodes = useAtomValue(nodesAtom);
  const edges = useAtomValue(edgesAtom);
  const selectedNodeId = useAtomValue(selectedNodeIdAtom);

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
      </div>
      <div className={styles['node-inspector__section']}>
        <div className={styles['node-inspector__section-title']}>Status</div>
        <div className={styles['node-inspector__property']}>
          <span className={styles['node-inspector__property-label']}>state</span>
          <span className={styles['node-inspector__property-value']}>
            <Circle fill="currentColor" size={6} />
            healthy
          </span>
        </div>
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
