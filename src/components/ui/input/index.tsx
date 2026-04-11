import type { InputHTMLAttributes } from 'react';
import styles from './index.module.css';

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={styles.input} type="text" {...props} />;
}
