import { useAtom, useSetAtom } from 'jotai';
import { Activity } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { resetSimulationActionAtom, simulationEnabledAtom } from '@/stores/simulation';

export default function Simulate() {
  const [enabled, setEnabled] = useAtom(simulationEnabledAtom);
  const reset = useSetAtom(resetSimulationActionAtom);

  const onClick = () => {
    if (enabled) {
      reset();
    }
    setEnabled(!enabled);
  };

  return (
    <Button active={enabled} onClick={onClick}>
      <Icon icon={Activity} />
      Simulate
    </Button>
  );
}
