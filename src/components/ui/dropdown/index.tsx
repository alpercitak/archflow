import { useEffect, useState, useRef, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import Icon from '@/components/ui/icon';
import styles from './index.module.css';
import Button from '../button';

interface DropdownItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface Props {
  trigger: ReactNode;
  items: Array<DropdownItem>;
}

export function Dropdown({ trigger, items }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onTriggerClick = () => setOpen((o) => !o);

  const onMenuItemClick = (item: DropdownItem) => {
    item.onClick();
    setOpen(false);
  };

  return (
    <div ref={ref} className={styles['dropdown']}>
      <div onClick={onTriggerClick}>{trigger}</div>
      {open && (
        <div className={styles['dropdown__menu']}>
          {items.map((item) => (
            <Button key={item.label} className={styles['dropdown__item']} onClick={() => onMenuItemClick(item)}>
              <Icon icon={item.icon} />
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
