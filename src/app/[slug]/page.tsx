import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getReviewBreakdown, getVenueBySlug } from '@/server/services/venue.service';
import { getSession } from '@/lib/auth';
import { RESERVED_SLUGS, SEATING_FORMATS, VENUE_TYPES } from '@/lib/constants';
import { formatBRL, formatNumber, formatRating } from '@/lib/utils';
import { PhotoGallery } from '@/components/venue/PhotoGallery';
import { AmenityList, RatingBars, ReviewList, Section, ShowsList, TechSheet } from '@/components/venue/VenueDetails';
import { ContactCard } from '@/components/venue/ContactCard';
import { AvailabilityCard } from '@/components/venue/AvailabilityCard';
import { AddToTourButton } from '@/components/tour/AddToTourButton';
import { businessModelLabel } from '@/components/venue/VenueCard';
import { Icon } from '@/components/ui/Icon';

type Props = { params: { slug: string } };

async function load(slug: string) {
  if (RESERVED_SLUGS.has(slug)) return null;
  return getVenueBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await load(params.slug);
  if (!v) return {};
  const description = `${VENUE_TYPES[v.type]} em ${v.city}, ${v.state} para até ${formatNumber(v.capacity)} pessoas. ${businessModelLabel(v)}.`;
  return {
    title: `${v.name} — ${v.city}, ${v.state}`,
    description,
    alternates: { canonical: `/${v.slug}` },
    openGraph: { title: v.name, description, images: v.photos[0] ? [v.photos[0].url] : undefined },
  };
}

export default async function VenuePage({ params }: Props) {
  const v = await load(params.slug);
  if (!v) notFound();
  const [breakdown, session] = await Promise.all([getReviewBreakdown(v.id), getSession()]);
  const price = formatBRL(v.rentalPriceCents);
  const pct = v.boxOfficePercent != null ? `${Number(v.boxOfficePercent)}%` : null;

  // Dados estruturados para buscadores (schema.org).
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'EventVenue', name: v.name, maximumAttendeeCapacity: v.capacity,
    address: { '@type': 'PostalAddress', addressLocality: v.city, addressRegion: v.state, addressCountry: 'BR', streetAddress: v.address ?? undefined },
    ...(v.ratingCount ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: v.ratingAvg.toFixed(1), reviewCount: v.ratingCount } } : {}),
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-32 pt-6 md:px-6 md:pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{v.name}</h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {v.ratingCount ? <a href="#avaliacoes" className="flex items-center gap-1 font-bold"><Icon name="star" size={16} fill="currentColor" />{formatRating(v.ratingAvg)} <span className="font-normal underline">{v.ratingCount} avaliações</span></a> : null}
            <span className="text-mute">{v.city}, {v.state}</span>
            {v.verified ? <span className="flex items-center gap-1 font-semibold text-ok"><Icon name="shield" size={16} />Verificado</span> : null}
          </p>
        </div>
        <AddToTourButton stop={{ venueId: v.id, slug: v.slug, name: v.name, city: v.city, state: v.state, capacity: v.capacity, lat: v.latitude, lng: v.longitude }} />
      </div>

      <PhotoGallery photos={v.photos} name={v.name} />

      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <Section title={`${VENUE_TYPES[v.type]} · ${SEATING_FORMATS[v.seatingFormat]} · até ${formatNumber(v.capacity)} pessoas`}>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[['Capacidade', formatNumber(v.capacity)], ['Formato', SEATING_FORMATS[v.seatingFormat]], ['Camarins', v.dressingRooms], ['Estacionamento', v.parkingSpots ? `${formatNumber(v.parkingSpots)} vagas` : '—']].map(([k, val]) => (
                <div key={k} className="rounded-2xl border border-line p-4"><dt className="text-sm text-mute">{k}</dt><dd className="mt-1 text-xl font-extrabold">{val}</dd></div>
              ))}
            </dl>
            {v.description ? <p className="whitespace-pre-line leading-relaxed text-paper/90">{v.description}</p> : null}
          </Section>
          <Section title="O que este local oferece"><AmenityList keys={v.amenities.map((a) => a.amenity.key)} /></Section>
          <Section title="Ficha técnica">
            <TechSheet stage={{ w: v.stageWidth, d: v.stageDepth, h: v.stageHeight }} specs={v.techSpecs as Record<string, string> | null} sections={v.sections} />
          </Section>
          <Section title="Shows já realizados" aside={v.showsCount ? <span className="text-sm text-mute">{formatNumber(v.showsCount)} eventos registrados</span> : null}>
            <ShowsList shows={v.shows} />
          </Section>
          <Section id="avaliacoes" title={v.ratingCount ? `${formatRating(v.ratingAvg)} · ${v.ratingCount} avaliações de produtores` : 'Avaliações de produtores'}>
            {v.ratingCount ? <RatingBars avg={breakdown} /> : null}
            <ReviewList reviews={v.reviews} />
          </Section>
          <Section title="Localização">
            <p>{v.address ? `${v.address} · ` : ''}{v.city}, {v.state}</p>
            <a className="self-start font-semibold underline" target="_blank" rel="noopener"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.name} ${v.address ?? ''} ${v.city} ${v.state}`)}`}>Abrir no mapa</a>
          </Section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:w-[360px] lg:shrink-0">
          <AvailabilityCard venueId={v.id} loggedIn={!!session}
            rental={v.acceptsRental ? (price ? `Diária a partir de ${price}` : 'Valor sob consulta') : null}
            boxOffice={v.acceptsBoxOffice ? (pct ? `Divisão de ${pct} da receita` : 'Percentual sob consulta') : null} />
          <ContactCard c={v} />
        </aside>
      </div>

      {/* Barra fixa no mobile, como no layout aprovado */}
      <div className="fixed inset-x-0 bottom-[60px] z-30 flex items-center justify-between gap-3 border-t border-line bg-ink-2 px-4 py-3 lg:hidden">
        <div><p className="font-bold">{price ? `${price} / diária` : businessModelLabel(v)}</p>{pct ? <p className="text-xs text-mute">ou bilheteria {pct}</p> : null}</div>
        <a href="#consultar" className="flex h-12 items-center rounded-xl bg-stage px-5 font-bold text-white">Consultar data</a>
      </div>
    </div>
  );
}
