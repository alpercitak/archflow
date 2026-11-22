import { useAtom } from 'jotai';
import { Activity } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { simulationEnabledAtom } from '@/stores/simulation';

export default function Simulate() {
  const [enabled, setEnabled] = useAtom(simulationEnabledAtom);
  return (
    <Button active={enabled} onClick={() => setEnabled((prev) => !prev)}>
      <Icon icon={Activity} />
      Simulate
    </Button>
  );
}
