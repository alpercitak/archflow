import { useSetAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import Input from '@/components/ui/input';
import { useEditHistoryKey } from '@/hooks/edit-history-key';
import { updateNodeActionAtom } from '@/stores/diagram';
import { SIM_FAULT_DEFAULTS } from '@/stores/simulation/constants';
import type { DiagramNode, NodeFault, NodeHealth } from '@/types';
import inputStyles from '../input-field/index.module.css';
import styles from './index.module.css';

type FaultChoice = NodeHealth | 'none';

const CHOICES: ReadonlyArray<{ value: FaultChoice; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'down', label: 'Down' },
  { value: 'degraded', label: 'Degraded' },
];

const NUMBER_FIELDS: ReadonlyArray<{ field: keyof Pick<NodeFault, 'startS' | 'durationS'>; label: string }> = [
  { field: 'startS', label: 'Start s' },
  { field: 'durationS', label: 'Duration s' },
];

interface Props {
  node: DiagramNode;
}

export default function FaultFields({ node }: Props) {
  const updateNode = useSetAtom(updateNodeActionAtom);
  const { historyKey, onFocus } = useEditHistoryKey();
  const fault = node.fault;

  const onChoiceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const choice = CHOICES.find((c) => c.value === event.target.value);
    if (!choice) {
      return;
    }
    updateNode({
      nodeId: node.id,
      updater: (prev) => ({
        ...prev,
        fault:
          choice.value === 'none'
            ? undefined
            : {
                startS: SIM_FAULT_DEFAULTS.startS,
                durationS: SIM_FAULT_DEFAULTS.durationS,
                ...prev.fault,
                health: choice.value,
              },
      }),
    });
  };

  const onNumberChange = (field: (typeof NUMBER_FIELDS)[number]['field']) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (event.target.value === '' || !Number.isFinite(value) || value < 0) {
      return;
    }
    updateNode({
      nodeId: node.id,
      updater: (prev) => (prev.fault ? { ...prev, fault: { ...prev.fault, [field]: value } } : prev),
      historyKey: historyKey.current,
    });
  };

  return (
    <>
      <div className={inputStyles['input-field']}>
        <span className={inputStyles['input-field__label']}>Fault</span>
        <select className={styles['fault-fields__select']} value={fault?.health ?? 'none'} onChange={onChoiceChange}>
          {CHOICES.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </div>
      {fault
        ? NUMBER_FIELDS.map(({ field, label }) => (
            <div key={field} className={inputStyles['input-field']}>
              <span className={inputStyles['input-field__label']}>{label}</span>
              <Input type="number" min={0} value={fault[field]} onFocus={onFocus} onChange={onNumberChange(field)} />
            </div>
          ))
        : null}
    </>
  );
}
