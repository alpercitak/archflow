import { useSetAtom } from 'jotai';
import { StickyNote } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { addNodeActionAtom } from '@/stores/diagram';
import { showToastAtom } from '@/stores/toast';

const NOTE_ENTRY = {
  item: { type: 'note', label: 'Note', meta: 'Click to edit', tag: 'Note' },
  x: 300,
  y: 200,
} as const;

export default function AddNote() {
  const addNode = useSetAtom(addNodeActionAtom);
  const showToast = useSetAtom(showToastAtom);

  const addNote = () => {
    addNode(NOTE_ENTRY);
    showToast('Note added');
  };

  return (
    <Button onClick={addNote}>
      <Icon icon={StickyNote} />
      Note
    </Button>
  );
}
