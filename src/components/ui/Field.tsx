'use client';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const control = 'w-full rounded-xl border bg-ink-2 px-4 py-3 text-[15px] text-paper placeholder:text-mute/70 outline-none transition-colors focus:border-paper';
const tone = (error?: string) => (error ? 'border-stage bg-stage-soft/40' : 'border-line');

type Wrap = { label: string; error?: string; hint?: string; className?: string };

function FieldShell({ id, label, error, hint, className, children }: Wrap & { id: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-paper">{label}</label>
      {children}
      {error ? <p id={`${id}-err`} className="text-[13px] font-medium text-stage">{error}</p>
        : hint ? <p className="text-[13px] text-mute">{hint}</p> : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, Wrap & InputHTMLAttributes<HTMLInputElement>>(function Input(
  { label, error, hint, className, id, ...rest }, ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} error={error} hint={hint} className={className}>
      <input ref={ref} id={fid} aria-invalid={!!error} aria-describedby={error ? `${fid}-err` : undefined} className={cn(control, tone(error))} {...rest} />
    </FieldShell>
  );
});

export function Select({ label, error, hint, className, id, children, ...rest }: Wrap & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} error={error} hint={hint} className={className}>
      <select id={fid} aria-invalid={!!error} className={cn(control, tone(error), 'appearance-none')} {...rest}>{children}</select>
    </FieldShell>
  );
}

export function Textarea({ label, error, hint, className, id, ...rest }: Wrap & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} error={error} hint={hint} className={className}>
      <textarea id={fid} aria-invalid={!!error} className={cn(control, tone(error), 'min-h-28 resize-y')} {...rest} />
    </FieldShell>
  );
}
