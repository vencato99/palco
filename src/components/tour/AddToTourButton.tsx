'use client';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useTour, type TourStop } from './TourProvider';

export function AddToTourButton({ stop, compact }: { stop: TourStop; compact?: boolean }) {
  const { has, toggle } = useTour();
  const on = has(stop.venueId);
  return (
    <button type="button" aria-pressed={on} onClick={() => toggle(stop)}
      aria-label={compact ? (on ? `Remover ${stop.name} da turnê` : `Adicionar ${stop.name} à turnê`) : undefined}
      className={cn('inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors',
        compact ? 'w-11' : 'px-4', on ? 'bg-paper text-ink' : 'border border-paper hover:bg-ink-3')}>
      <Icon name={on ? 'check' : 'plus'} size={16} />
      {compact ? null : on ? 'Na turnê' : 'Adicionar à turnê'}
    </button>
  );
}
