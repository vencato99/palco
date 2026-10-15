import Link from 'next/link';
import { adminStats, listSuggestions } from '@/server/services/suggestion.service';
import { VENUE_TYPES } from '@/lib/constants';

export const metadata = { title: 'Admin' };

export default async function AdminHome() {
  const [stats, recent] = await Promise.all([adminStats(), listSuggestions()]);
  const cards = [['Sugestões pendentes', stats.pending], ['Aguardando a casa', stats.needsInfo], ['Publicados no mês', stats.publishedMonth], ['Locais em análise', stats.pendingVenues]] as const;
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Painel</h1>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([k, v]) => <div key={k} className="rounded-2xl border border-line bg-ink-2 p-5"><dt className="text-sm text-mute">{k}</dt><dd className="mt-1 text-3xl font-extrabold">{v}</dd></div>)}
      </dl>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Últimas sugestões</h2>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {recent.slice(0, 8).map((s) => (
            <li key={s.id}><Link href={`/admin/sugestoes/${s.id}`} className="flex justify-between gap-3 px-4 py-3 hover:bg-ink-2">
              <span><strong>{s.name}</strong> <span className="text-mute">· {VENUE_TYPES[s.type]} · {s.city}, {s.state}</span></span>
              <span className="text-sm text-mute">{s.createdAt.toLocaleDateString('pt-BR')}</span>
            </Link></li>
          ))}
          {!recent.length ? <li className="px-4 py-6 text-mute">Nenhuma sugestão pendente.</li> : null}
        </ul>
      </section>
    </div>
  );
}
