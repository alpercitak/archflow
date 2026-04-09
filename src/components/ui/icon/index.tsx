import type { LucideProps, LucideIcon } from 'lucide-react';

interface Props extends Omit<LucideProps, 'size' | 'strokeWidth'> {
  icon: LucideIcon;
}

export default function Icon({ icon: Component, ...props }: Props) {
  return <Component size={12} strokeWidth={1.4} {...props} />;
}
