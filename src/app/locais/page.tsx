import type { Metadata } from 'next';
import { Suspense } from 'react';
import { searchVenues } from '@/server/services/venue.service';
import { filtersFromParams } from '@/lib/filters';
import { FilterBar } from '@/components/venue/FilterBar';
import { LoadMore } from '@/components/venue/LoadMore';
import { VenueCard, VenueGrid } from '@/components/venue/VenueCard';
import { EmptyState, ButtonLink } from '@/components/ui';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Buscar locais' };

type SP = Record<string, string | string[] | undefined>;

export default async function VenuesPage({ searchParams }: { searchParams: SP }) {
  const filters = filtersFromParams(searchParams);
  const { items, total, nextCursor } = await searchVenues(filters);
  const key = JSON.stringify(searchParams);

  return (
    <div className="mx-auto flex max-w-page flex-col gap-8 px-4 py-8 md:px-6">
      <div className="rounded-3xl border border-line bg-ink-2 p-4 md:p-6">
        <Suspense><FilterBar /></Suspense>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl font-bold">{total === 1 ? '1 local encontrado' : `${formatNumber(total)} locais encontrados`}</h1>
        <ButtonLink href={`/buscar${filters.q ? `?q=${encodeURIComponent(filters.q)}` : ''}`} variant="ghost" size="sm">Ver por cidade para montar turnê</ButtonLink>
      </div>
      {items.length ? (
        <div data-results><VenueGrid>
          {items.map((v, i) => <VenueCard key={v.id} venue={v} priority={i < 3} />)}
          <Suspense><LoadMore key={key} initialCursor={nextCursor} /></Suspense>
        </VenueGrid></div>
      ) : (
        <EmptyState icon="search" title="Nenhum local com esses filtros" text="Tente ampliar a capacidade, remover comodidades ou buscar em outro estado."
          action={<ButtonLink href="/locais" variant="secondary">Limpar filtros</ButtonLink>} />
      )}
    </div>
  );
}
