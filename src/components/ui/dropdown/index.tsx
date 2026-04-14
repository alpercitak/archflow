import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react';
import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import styles from './index.module.css';

interface DropdownItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface Props {
  label: string;
  items: Array<DropdownItem>;
}

export function Dropdown({ label, items }: Props) {
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
      <Button onClick={onTriggerClick}>
        {label}
        <Icon icon={open ? ArrowUp : ArrowDown} />
      </Button>
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
