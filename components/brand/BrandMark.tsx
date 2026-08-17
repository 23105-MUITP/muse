import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  size?: number;
  pulse?: boolean;
}

export function BrandMark({ className, size = 32, pulse = false }: BrandMarkProps) {
  return (
    <span
      className={cn('muse-orb', pulse && 'muse-orb-pulse', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
