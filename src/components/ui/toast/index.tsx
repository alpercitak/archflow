import { useAtomValue } from 'jotai';
import clsx from 'clsx';
import { toastStateAtom } from '@/stores/toast';
import styles from './index.module.css';

export default function Toast() {
  const { message, visible } = useAtomValue(toastStateAtom);

  if (!visible) {
    return null;
  }

  return <div className={clsx(styles['toast'], !visible && styles['hide'])}>{message}</div>;
}
