import { useSetAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import Input from '@/components/ui/input';
import { useEditHistoryKey } from '@/hooks/edit-history-key';
import { updateNodeActionAtom } from '@/stores/diagram';
import { SIM_DEFAULTS, SIM_PROFILE_DEFAULTS } from '@/stores/simulation/constants';
import type { DiagramNode, LoadProfile, LoadProfileKind } from '@/types';
import inputStyles from '../input-field/index.module.css';
import styles from './index.module.css';

type ProfileChoice = LoadProfileKind | 'none';

const CHOICES: ReadonlyArray<{ value: ProfileChoice; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'ramp', label: 'Ramp' },
  { value: 'spike', label: 'Spike' },
  { value: 'wave', label: 'Wave' },
];

const NUMBER_FIELDS: ReadonlyArray<{ field: keyof Pick<LoadProfile, 'peak' | 'startS' | 'durationS'>; label: string }> =
  [
    { field: 'peak', label: 'Peak rps' },
    { field: 'startS', label: 'Start s' },
    { field: 'durationS', label: 'Duration s' },
  ];

interface Props {
  node: DiagramNode;
}

export default function ProfileFields({ node }: Props) {
  const updateNode = useSetAtom(updateNodeActionAtom);
  const { historyKey, onFocus } = useEditHistoryKey();
  const profile = node.profile;

  const onKindChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const choice = CHOICES.find((c) => c.value === event.target.value);
    if (!choice) {
      return;
    }
    updateNode({
      nodeId: node.id,
      updater: (prev) => ({
        ...prev,
        profile:
          choice.value === 'none'
            ? undefined
            : {
                peak: (prev.load ?? SIM_DEFAULTS.client.load) * SIM_PROFILE_DEFAULTS.peakFactor,
                startS: SIM_PROFILE_DEFAULTS.startS,
                durationS: SIM_PROFILE_DEFAULTS.durationS,
                ...prev.profile,
                kind: choice.value,
              },
      }),
    });
  };

  const onNumberChange = (field: (typeof NUMBER_FIELDS)[number]['field']) => (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const value = Number(raw);
    if (raw === '' || !Number.isFinite(value) || value < 0) {
      return;
    }
    updateNode({
      nodeId: node.id,
      updater: (prev) => (prev.profile ? { ...prev, profile: { ...prev.profile, [field]: value } } : prev),
      historyKey: historyKey.current,
    });
  };

  return (
    <>
      <div className={inputStyles['input-field']}>
        <span className={inputStyles['input-field__label']}>Profile</span>
        <select className={styles['profile-fields__select']} value={profile?.kind ?? 'none'} onChange={onKindChange}>
          {CHOICES.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </div>
      {profile
        ? NUMBER_FIELDS.map(({ field, label }) => (
            <div key={field} className={inputStyles['input-field']}>
              <span className={inputStyles['input-field__label']}>{label}</span>
              <Input type="number" min={0} value={profile[field]} onFocus={onFocus} onChange={onNumberChange(field)} />
            </div>
          ))
        : null}
    </>
  );
}
