import styles from './index.module.css';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export default function Button({ children, active, ...rest }: Props) {
  return (
    <button className={`${styles['button']} ${active ? styles['active'] : ''}`} type="button" {...rest}>
      {children}
    </button>
  );
}
