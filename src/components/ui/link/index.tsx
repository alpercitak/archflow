import type { AnchorHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './index.module.css';

export default function Link({ children, className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={clsx(styles['link'], className)} {...props}>
      {children}
    </a>
  );
}
