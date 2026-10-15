import Link from 'next/link';
import { listTours } from '@/server/services/tour.service';
import { requireUser } from '@/lib/auth';
import { ButtonLink, EmptyState } from '@/components/ui';
import { formatNumber } from '@/lib/utils';

export const metadata = { title: 'Minhas turnês' };
export const dynamic = 'force-dynamic';

export default async function MyToursPage() {
  const tours = await listTours(await requireUser());
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-8 pb-28 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Minhas turnês</h1>
        <ButtonLink href="/buscar">Montar nova turnê</ButtonLink>
      </div>
      {!tours.length ? <EmptyState icon="route" title="Nenhuma turnê salva" text="Busque locais, adicione à turnê e salve na sua conta." action={<ButtonLink href="/buscar">Montar turnê</ButtonLink>} /> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {tours.map((t) => (
            <li key={t.id} className="flex flex-col gap-3 rounded-3xl border border-line bg-ink-2 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-bold">{t.name}</h2>
                <span className="text-sm text-mute">{t.stops.length} datas · {formatNumber(t.stops.reduce((s, x) => s + x.venue.capacity, 0))} lugares</span>
              </div>
              <ol className="flex flex-col gap-1.5 text-sm">
                {t.stops.map((s, i) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <Link href={`/${s.venue.slug}`} className="hover:underline">{i + 1}. {s.venue.name} — {s.venue.city}, {s.venue.state}</Link>
                    <span className="text-mute">{s.date ? s.date.toLocaleDateString('pt-BR') : 'sem data'}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
