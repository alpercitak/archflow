import type { AnchorHTMLAttributes, ReactNode } from 'react';
import styles from './index.module.css';
import clsx from 'clsx';

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
}

export default function Link({ children, className, external, ...props }: LinkProps) {
  const externalAttributes = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a className={clsx(styles['link'], className)} {...props} {...externalAttributes}>
      {children}
    </a>
  );
}
