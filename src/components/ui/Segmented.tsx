'use client';
import { cn } from '@/lib/utils';

export function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value?: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
      <div className="grid overflow-hidden rounded-xl border border-line" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
            className={cn('h-11 border-l border-line px-2 text-sm first:border-l-0', value === o.value ? 'bg-paper font-semibold text-ink' : 'hover:bg-ink-3')}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Counter({ label, hint, value, onChange, min = 0, step = 1 }: {
  label: string; hint?: string; value: number; onChange: (n: number) => void; min?: number; step?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
      <div><p className="font-semibold">{label}</p>{hint ? <p className="text-sm text-mute">{hint}</p> : null}</div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Diminuir ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}
          className="h-11 w-11 rounded-full border border-line text-xl disabled:opacity-40">−</button>
        <output className="min-w-8 text-center font-bold" aria-live="polite">{value}</output>
        <button type="button" aria-label={`Aumentar ${label}`} onClick={() => onChange(value + step)}
          className="h-11 w-11 rounded-full border border-line text-xl">+</button>
      </div>
    </div>
  );
}
