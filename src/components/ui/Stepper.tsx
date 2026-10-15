import { cn } from '@/lib/utils';
import { Icon } from './Icon';

/** Etapas clicáveis; etapas futuras só abrem depois da validação da atual. */
export function Stepper({ steps, current, onGo }: { steps: string[]; current: number; onGo: (i: number) => void }) {
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1" aria-label="Etapas">
      {steps.map((s, i) => (
        <li key={s}>
          <button type="button" onClick={() => onGo(i)} aria-current={i === current ? 'step' : undefined}
            className={cn('flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap',
              i === current ? 'bg-paper text-ink' : i < current ? 'border border-paper' : 'border border-line text-mute')}>
            {i < current ? <Icon name="check" size={14} /> : <span>{i + 1}</span>}
            {s}
          </button>
        </li>
      ))}
    </ol>
  );
}
