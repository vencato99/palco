import type { IconName } from '@/components/ui/Icon';
import { Icon } from '@/components/ui/Icon';
import { AMENITIES } from '@/lib/constants';
import { formatMonthYear, formatNumber, formatRating, initials } from '@/lib/utils';
import { cn } from '@/lib/utils';

/* ---------- Seção com título padronizado ---------- */
export function Section({ title, aside, children, id }: { title: string; aside?: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="flex flex-col gap-5 border-b border-line py-8 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/* ---------- Comodidades: as que o local tem, e as que não tem riscadas ---------- */
export function AmenityList({ keys }: { keys: string[] }) {
  const has = new Set(keys);
  return (
    <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {AMENITIES.map((a) => (
        <li key={a.key} className={cn('flex items-center gap-3 text-[15px]', !has.has(a.key) && 'text-mute line-through')}>
          <Icon name={a.icon as IconName} size={22} />
          {a.label}
          {!has.has(a.key) ? <span className="sr-only">(indisponível)</span> : null}
        </li>
      ))}
    </ul>
  );
}

/* ---------- Ficha técnica ---------- */
const SPEC_LABELS: Record<string, string> = {
  som: 'Som (P.A.)', luz: 'Luz', energia: 'Energia', varas: 'Varas cênicas', cargaDescarga: 'Carga e descarga', horarios: 'Horários',
};
export function TechSheet({ stage, specs, sections }: {
  stage: { w?: number | null; d?: number | null; h?: number | null };
  specs: Record<string, string> | null;
  sections: { id: string; name: string; capacity: number }[];
}) {
  const rows: [string, string][] = [];
  if (stage.w && stage.d) rows.push(['Palco', `${stage.w} × ${stage.d} m${stage.h ? ` · altura ${stage.h} m` : ''}`]);
  for (const [k, v] of Object.entries(specs ?? {})) if (v) rows.push([SPEC_LABELS[k] ?? k, v]);
  return (
    <div className="flex flex-col gap-4">
      {rows.length ? (
        <dl className="overflow-hidden rounded-2xl border border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 border-b border-line px-4 py-3 last:border-0 sm:grid-cols-[200px_1fr]">
              <dt className="text-sm font-semibold text-mute">{k}</dt><dd>{v}</dd>
            </div>
          ))}
        </dl>
      ) : <p className="text-mute">A casa ainda não publicou a ficha técnica.</p>}
      {sections.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sections.map((s) => (
            <div key={s.id} className="rounded-xl bg-ink-2 p-4"><p className="text-sm text-mute">{s.name}</p><p className="text-xl font-extrabold">{formatNumber(s.capacity)}</p></div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Shows realizados ---------- */
export function ShowsList({ shows }: { shows: { id: string; title: string; category: string; date: Date | string; audience: number | null; soldOut: boolean }[] }) {
  if (!shows.length) return <p className="text-mute">Nenhum show registrado ainda.</p>;
  return (
    <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:px-0">
      {shows.map((s) => (
        <li key={s.id} className="w-64 shrink-0 snap-start rounded-2xl border border-line p-4 md:w-auto">
          <p className="font-bold">{s.title}</p>
          <p className="mt-1 text-sm text-mute">{s.category} · {formatMonthYear(s.date)}</p>
          {s.audience ? <p className="mt-2 text-sm">{formatNumber(s.audience)} pessoas{s.soldOut ? ' · esgotado' : ''}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/* ---------- Avaliações de produtores ---------- */
const CRITERIA = [
  ['technical', 'Estrutura técnica'], ['service', 'Atendimento da casa'], ['payment', 'Acerto e pagamento'],
  ['audience', 'Resposta do público'], ['logistics', 'Logística e acesso'],
] as const;

export function RatingBars({ avg }: { avg: Partial<Record<(typeof CRITERIA)[number][0], number | null>> }) {
  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {CRITERIA.map(([k, label]) => {
        const v = avg[k] ?? 0;
        return (
          <div key={k} className="flex flex-col gap-1.5">
            <dt className="text-sm font-semibold">{label}</dt>
            <dd className="text-xl font-extrabold">{v ? formatRating(v) : '—'}</dd>
            <div className="h-1 rounded bg-line" aria-hidden="true"><div className="h-1 rounded bg-paper" style={{ width: `${(v / 5) * 100}%` }} /></div>
          </div>
        );
      })}
    </dl>
  );
}

type ReviewItem = { id: string; overall: number; comment: string; eventName: string; createdAt: Date | string; author: { name: string; company: string | null } };
export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (!reviews.length) return <p className="text-mute">Ainda sem avaliações. Produziu um evento aqui? Conte como foi.</p>;
  return (
    <ul className="grid gap-8 md:grid-cols-2">
      {reviews.map((r) => (
        <li key={r.id} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-3 font-bold">{initials(r.author.name)}</span>
            <div><p className="font-bold">{r.author.name}</p>{r.author.company ? <p className="text-sm text-mute">{r.author.company}</p> : null}</div>
          </div>
          <p className="text-sm">
            <span aria-label={`Nota ${r.overall} de 5`}>{'★'.repeat(r.overall)}<span className="text-line">{'★'.repeat(5 - r.overall)}</span></span>
            <span className="text-mute"> · {formatMonthYear(r.createdAt)} · {r.eventName}</span>
          </p>
          <p className="leading-relaxed">{r.comment}</p>
        </li>
      ))}
    </ul>
  );
}
