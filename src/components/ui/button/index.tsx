import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import styles from './index.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export default function Button({ children, active, className, ...rest }: Props) {
  return (
    <button className={clsx(styles.button, active && styles.active, className)} type="button" {...rest}>
      {children}
    </button>
  );
}
