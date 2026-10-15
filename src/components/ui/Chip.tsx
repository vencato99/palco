import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

/** Chip alternável — aria-pressed comunica o estado para leitores de tela. */
export function Chip({ active, onClick, children, className }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={cn('inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm transition-colors',
        active ? 'bg-paper font-semibold text-ink hover:bg-white' : 'border border-line text-paper hover:border-mute hover:bg-ink-3', className)}>
      {active ? <Icon name="check" size={14} /> : null}
      {children}
    </button>
  );
}

export function Badge({ tone = 'mute', children }: { tone?: 'ok' | 'warn' | 'mute' | 'danger' | 'info'; children: ReactNode }) {
  const tones = {
    ok: 'bg-ok/15 text-ok', warn: 'bg-warn/15 text-warn', mute: 'bg-ink-3 text-mute',
    danger: 'bg-stage/15 text-stage', info: 'bg-sky-400/15 text-sky-300',
  };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold', tones[tone])}>{children}</span>;
}
