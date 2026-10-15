'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';
import { Icon } from '@/components/ui';

const EXAMPLES = ['Teatro para mais de 1000 pessoas no Sul e Sudeste', 'Casa de show de pé até 800 pessoas em SP', 'Auditório com bilheteria no Nordeste', 'Espaço híbrido com 4 camarins'];

/** Busca em linguagem natural. Grande no hero, compacta no topo da página de turnê. */
export function SmartSearch({ size = 'lg', action = '/buscar' }: { size?: 'lg' | 'md'; action?: string }) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    start(() => router.push(`${action}?q=${encodeURIComponent(q.trim())}`));
  }

  return (
    <div className="flex flex-col gap-3">
      <form role="search" onSubmit={submit} className="flex flex-wrap gap-2 rounded-2xl bg-paper p-2 text-ink">
        <label htmlFor="smart-q" className="sr-only">Descreva o local que você procura</label>
        <div className="flex min-w-0 flex-1 basis-64 items-center gap-3 px-3">
          <Icon name="search" className="shrink-0 text-ink/60" />
          <input id="smart-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: teatro para mais de 1000 pessoas no Sul"
            className={size === 'lg' ? 'w-full bg-transparent py-3 text-lg outline-none' : 'w-full bg-transparent py-2 outline-none'} />
        </div>
        <button type="submit" aria-busy={pending} className="h-12 rounded-xl bg-stage px-6 font-bold text-white hover:bg-stage-dark">
          {pending ? 'Buscando…' : 'Buscar e montar roteiro'}
        </button>
      </form>
      {size === 'lg' ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-mute">Experimente:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => { setQ(ex); start(() => router.push(`${action}?q=${encodeURIComponent(ex)}`)); }}
              className="rounded-full border border-line px-3.5 py-2 text-sm text-paper/90 hover:border-mute">{ex}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
