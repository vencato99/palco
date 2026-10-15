'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button, Icon, useToast } from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';
import { haversineKm, useTour } from './TourProvider';

/** Painel lateral no desktop; no mobile vira gaveta inferior recolhível. */
export function TourPanel({ loggedIn }: { loggedIn: boolean }) {
  const { name, setName, stops, remove, setDate, move, clear } = useTour();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<'save' | 'send' | null>(null);
  const toast = useToast();
  const router = useRouter();

  const { km, cap, cities } = useMemo(() => {
    let km = 0;
    for (let i = 1; i < stops.length; i++) km += haversineKm(stops[i - 1]!, stops[i]!) ?? 0;
    return { km, cap: stops.reduce((s, x) => s + x.capacity, 0), cities: new Set(stops.map((s) => s.city)).size };
  }, [stops]);

  const needLogin = () => { router.push(`/entrar?voltar=${encodeURIComponent('/buscar' + location.search)}`); };

  async function save() {
    if (!loggedIn) return needLogin();
    setBusy('save');
    const res = await fetch('/api/tours', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, stops: stops.map((s) => ({ venueId: s.venueId, date: s.date || null })) }) });
    setBusy(null);
    toast({ message: res.ok ? 'Turnê salva na sua conta.' : 'Não foi possível salvar a turnê.' });
  }

  async function sendAll() {
    if (!loggedIn) return needLogin();
    const first = stops.find((s) => s.date)?.date;
    if (!first) return toast({ message: 'Defina a data de pelo menos uma parada.' });
    setBusy('send');
    // Uma consulta por data: agrupa paradas com a mesma data em uma requisição.
    const byDate = new Map<string, string[]>();
    for (const s of stops) if (s.date) byDate.set(s.date, [...(byDate.get(s.date) ?? []), s.venueId]);
    const results = await Promise.all([...byDate].map(([date, venueIds]) =>
      fetch('/api/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ venueIds, date, eventType: 'Turnê' }) })));
    setBusy(null);
    toast({ message: results.every((r) => r.ok) ? `Consulta enviada para ${stops.filter((s) => s.date).length} locais.` : 'Algumas consultas falharam.' });
  }

  return (
    <aside className={cn('fixed inset-x-0 bottom-[60px] z-30 rounded-t-3xl border-t border-line bg-ink-2 shadow-[0_-12px_40px_rgba(0,0,0,.5)] md:static md:rounded-3xl md:border md:shadow-none')}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left md:hidden">
        <span><span className="block text-xs font-bold text-stage">Minha turnê</span><span className="font-bold">{stops.length} datas · {cities} cidades</span></span>
        <span className="text-sm font-semibold underline">{open ? 'Recolher' : 'Ver roteiro'}</span>
      </button>
      <div className={cn('flex-col gap-5 px-5 pb-5 md:flex md:p-6', open ? 'flex max-h-[60dvh] overflow-y-auto' : 'hidden')}>
        <label className="sr-only" htmlFor="tour-name">Nome da turnê</label>
        <input id="tour-name" value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent font-display text-2xl font-bold outline-none" />
        <dl className="grid grid-cols-3 gap-2">
          {[[stops.length, 'datas'], [formatNumber(cap), 'lugares'], [km ? `~${formatNumber(km)}` : '—', 'km']].map(([v, l]) => (
            <div key={l} className="rounded-xl bg-ink-3 p-3"><dd className="text-xl font-extrabold">{v}</dd><dt className="text-xs text-mute">{l}</dt></div>
          ))}
        </dl>
        {!stops.length ? <p className="text-mute">Adicione locais da lista para montar a sequência de datas.</p> : (
          <ol className="flex flex-col gap-2">
            {stops.map((s, i) => {
              const leg = i > 0 ? haversineKm(stops[i - 1]!, s) : null;
              return (
                <li key={s.venueId} className="flex flex-col gap-1">
                  {leg ? <p className="pl-4 text-xs text-mute">~{formatNumber(leg)} km de estrada</p> : null}
                  <div className="flex items-start gap-3 rounded-2xl border border-line p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stage text-sm font-bold text-white">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <Link href={`/${s.slug}`} className="block truncate font-bold hover:underline">{s.name}</Link>
                      <p className="text-xs text-mute">{s.city}, {s.state} · {formatNumber(s.capacity)} lugares</p>
                      <input type="date" aria-label={`Data em ${s.city}`} value={s.date ?? ''} onChange={(e) => setDate(s.venueId, e.target.value)}
                        className="mt-2 h-9 rounded-lg border border-line bg-ink px-2 text-sm" />
                    </div>
                    <div className="flex flex-col">
                      <button type="button" aria-label="Mover para cima" disabled={i === 0} onClick={() => move(s.venueId, -1)} className="h-8 w-8 rotate-90 text-mute disabled:opacity-30"><Icon name="back" size={16} /></button>
                      <button type="button" aria-label="Mover para baixo" disabled={i === stops.length - 1} onClick={() => move(s.venueId, 1)} className="h-8 w-8 -rotate-90 text-mute disabled:opacity-30"><Icon name="back" size={16} /></button>
                      <button type="button" aria-label={`Remover ${s.name}`} onClick={() => remove(s.venueId)} className="h-8 w-8 text-mute"><Icon name="close" size={16} /></button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <div className="flex flex-col gap-2">
          <Button size="lg" disabled={!stops.length} loading={busy === 'send'} onClick={sendAll}>Enviar consulta de datas a todos</Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" disabled={!stops.length} loading={busy === 'save'} onClick={save}>Salvar turnê</Button>
            <Button variant="ghost" disabled={!stops.length} onClick={clear}>Limpar</Button>
          </div>
          <p className="text-xs text-mute">Distâncias estimadas a partir da localização dos locais.</p>
        </div>
      </div>
    </aside>
  );
}
