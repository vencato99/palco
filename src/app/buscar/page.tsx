import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { searchVenuesByCity } from '@/server/services/venue.service';
import { getSession } from '@/lib/auth';
import { parseQuery } from '@/lib/search-parser';
import { venueFiltersSchema } from '@/lib/validators';
import { filtersToParams } from '@/lib/filters';
import { SmartSearch } from '@/components/tour/SmartSearch';
import { TourPanel } from '@/components/tour/TourPanel';
import { AddToTourButton } from '@/components/tour/AddToTourButton';
import { businessModelLabel } from '@/components/venue/VenueCard';
import { EmptyState, Icon } from '@/components/ui';
import { formatNumber, formatRating } from '@/lib/utils';

export const metadata: Metadata = { title: 'Montar turnê' };

export default async function TourSearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.slice(0, 200) ?? '';
  const parsed = q ? parseQuery(q) : null;
  const { chips = [], regions: _r, ...f } = parsed ?? { chips: [] };
  const filters = venueFiltersSchema.parse({ ...f, sort: 'rating' });
  const [groups, session] = await Promise.all([q ? searchVenuesByCity(filters) : Promise.resolve([]), getSession()]);
  const total = groups.reduce((s, g) => s + g.venues.length, 0);

  return (
    <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-8 pb-48 md:px-6 md:pb-8">
      <Suspense><SmartSearch size="md" /></Suspense>

      {chips.length ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line p-4">
          <span className="text-sm font-semibold text-mute">Entendemos sua busca como:</span>
          {chips.map((c) => <span key={c} className="rounded-full bg-paper px-3 py-1.5 text-sm font-semibold text-ink">{c}</span>)}
          <Link href={`/locais?${filtersToParams(filters)}`} className="ml-auto text-sm font-semibold underline">Ajustar filtros</Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <section className="flex min-w-0 flex-1 flex-col gap-8">
          {!q ? (
            <EmptyState icon="route" title="Descreva os locais da turnê" text="Ex.: “teatro para mais de 1000 pessoas no Sul e Sudeste”. Mostramos os resultados por cidade, na ordem da estrada." />
          ) : !total ? (
            <EmptyState icon="search" title="Nenhum local para essa busca" text="Tente reduzir a capacidade mínima ou incluir mais estados." />
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold">{formatNumber(total)} locais em {groups.length} {groups.length === 1 ? 'cidade' : 'cidades'}</h1>
              {groups.map((g, gi) => (
                <div key={`${g.state}-${g.city}`} className="flex flex-col gap-3">
                  <h2 className="flex items-center gap-3 text-xl font-bold">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-sm text-ink">{gi + 1}</span>
                    {g.city}, {g.state}
                    <span className="text-sm font-normal text-mute">{g.venues.length} {g.venues.length === 1 ? 'local' : 'locais'}</span>
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {g.venues.map((v) => (
                      <li key={v.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-ink-2 p-3 transition-colors hover:border-mute/60 hover:bg-ink-3">
                        <div className="min-w-0 flex-1 basis-56">
                          <Link href={`/${v.slug}`} className="text-lg font-bold hover:underline">{v.name}</Link>
                          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-mute">
                            <span>{formatNumber(v.capacity)} lugares</span>
                            <span>{businessModelLabel(v)}</span>
                            {v.ratingCount ? <span className="flex items-center gap-1"><Icon name="star" size={13} fill="currentColor" />{formatRating(v.ratingAvg)}</span> : null}
                          </p>
                        </div>
                        <AddToTourButton stop={{ venueId: v.id, slug: v.slug, name: v.name, city: v.city, state: v.state, capacity: v.capacity, lat: v.latitude, lng: v.longitude }} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </section>
        <div className="md:sticky md:top-24 md:w-[380px] md:shrink-0">
          <TourPanel loggedIn={!!session} />
        </div>
      </div>
    </div>
  );
}
