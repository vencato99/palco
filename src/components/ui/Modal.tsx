'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

/** Usa <dialog> nativo: foco preso, Esc fecha e backdrop sem JS extra. No mobile vira gaveta inferior. */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}
      className={cn('m-0 mt-auto w-full max-w-none rounded-t-3xl bg-ink-2 p-0 text-paper backdrop:bg-black/70 sm:m-auto sm:rounded-3xl',
        size === 'sm' && 'sm:max-w-md', size === 'md' && 'sm:max-w-xl', size === 'lg' && 'sm:max-w-3xl')}>
      <div className="flex max-h-[90dvh] flex-col">
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink-3">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
