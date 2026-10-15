import Link from 'next/link';
import { listSuggestions } from '@/server/services/suggestion.service';
import { VENUE_TYPES } from '@/lib/constants';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Sugestões' };

const TABS = [
  { v: '', label: 'Pendentes' }, { v: 'NEEDS_INFO', label: 'Aguardando a casa' },
  { v: 'APPROVED', label: 'Aprovadas' }, { v: 'REJECTED', label: 'Rejeitadas' },
];
const TONE = { NEW: 'info', IN_REVIEW: 'warn', NEEDS_INFO: 'mute', APPROVED: 'ok', REJECTED: 'danger' } as const;
const LABEL = { NEW: 'Nova', IN_REVIEW: 'Em verificação', NEEDS_INFO: 'Faltam dados', APPROVED: 'Aprovada', REJECTED: 'Rejeitada' } as const;
const RELATION = { MANAGER: 'Responsável pelo local', PRODUCED_THERE: 'Já produziu lá', KNOWS_IT: 'Só conhece' } as const;

export default async function SuggestionsPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = TABS.some((t) => t.v === searchParams.status) ? searchParams.status : '';
  const rows = await listSuggestions(status || undefined);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Sugestões de novos locais</h1>
      <nav className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link key={t.v} href={t.v ? `?status=${t.v}` : '?'} className={cn('h-10 shrink-0 rounded-full px-4 py-2 text-sm font-semibold', status === t.v ? 'bg-paper text-ink' : 'border border-line')}>{t.label}</Link>
        ))}
      </nav>
      <ul className="flex flex-col gap-2">
        {rows.map((s) => (
          <li key={s.id}>
            <Link href={`/admin/sugestoes/${s.id}`} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-ink-2 px-5 py-4 hover:border-mute">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{s.name}</p>
                <p className="text-sm text-mute">{VENUE_TYPES[s.type]} · {s.city}, {s.state}{s.capacity ? ` · ~${s.capacity.toLocaleString('pt-BR')} pessoas` : ''}</p>
                <p className="text-xs text-mute">Enviado por {s.submittedBy?.name ?? 'visitante'} ({RELATION[s.relation]}) · {s.createdAt.toLocaleDateString('pt-BR')}</p>
              </div>
              <Badge tone={TONE[s.status]}>{LABEL[s.status]}</Badge>
            </Link>
          </li>
        ))}
        {!rows.length ? <li className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-mute">Nada por aqui.</li> : null}
      </ul>
    </div>
  );
}
