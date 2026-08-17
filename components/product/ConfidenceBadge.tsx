'use client';

import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  score: number;
  className?: string;
}

export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7355ca]',
        className
      )}
    >
      {score}% match
    </span>
  );
}
