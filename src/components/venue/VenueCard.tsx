import { SafeImage as Image } from '@/components/ui/SafeImage';
import Link from 'next/link';
import type { VenueCardData } from '@/server/services/venue.service';
import { SEATING_FORMATS, VENUE_TYPES } from '@/lib/constants';
import { formatBRL, formatNumber, formatRating } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';

export function businessModelLabel(v: { acceptsRental: boolean; acceptsBoxOffice: boolean }) {
  if (v.acceptsRental && v.acceptsBoxOffice) return 'Locação + Bilheteria';
  return v.acceptsRental ? 'Locação' : 'Bilheteria';
}

/** Card sem hooks: funciona em server e client components (usado no "Carregar mais"). */
export function VenueCard({ venue, priority }: { venue: VenueCardData; priority?: boolean }) {
  const cover = venue.photos[0]?.url;
  const price = formatBRL(venue.rentalPriceCents);
  return (
    <Link href={`/${venue.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-mute/60 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,.8)] active:translate-y-0 active:scale-[.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-stage">
      <div className="relative aspect-[4/3] bg-ink-3">
        {cover ? (
          <Image src={cover} alt={`Foto de ${venue.name}`} fill priority={priority}
            sizes="(min-width:1280px) 400px, (min-width:768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center text-mute"><Icon name="stage" size={40} /></div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold backdrop-blur">{VENUE_TYPES[venue.type]}</span>
        {venue._count.photos > 1 ? (
          <span className="absolute bottom-3 right-3 rounded-lg bg-ink/85 px-2 py-1 text-[11px]">{venue._count.photos} fotos</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold transition-colors group-hover:text-stage">{venue.name}</h3>
            <p className="text-sm text-mute">{venue.city}, {venue.state}</p>
          </div>
          {venue.ratingCount > 0 ? (
            <span className="flex shrink-0 items-center gap-1 text-sm font-bold">
              <Icon name="star" size={15} fill="currentColor" />{formatRating(venue.ratingAvg)}
              <span className="font-normal text-mute">({venue.ratingCount})</span>
            </span>
          ) : <span className="text-xs text-mute">Novo</span>}
        </div>
        <ul className="flex flex-wrap gap-1.5 text-xs">
          <li className="rounded-md bg-ink-3 px-2 py-1">{formatNumber(venue.capacity)} pessoas</li>
          <li className="rounded-md bg-ink-3 px-2 py-1">{SEATING_FORMATS[venue.seatingFormat]}</li>
          <li className="rounded-md bg-sky-400/15 px-2 py-1 font-semibold text-sky-300">{businessModelLabel(venue)}</li>
        </ul>
        {venue.amenities.length ? (
          <p className="truncate text-sm text-mute">{venue.amenities.map((a) => a.amenity.label).join(', ')}</p>
        ) : null}
        <p className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-sm">
          <span>
          {price ? <>Diária a partir de <strong>{price}</strong></> : venue.acceptsBoxOffice ? 'Divisão de bilheteria' : 'Consulte valores'}
          </span>
          <span className="font-semibold text-mute transition-colors group-hover:text-paper">Ver local</span>
        </p>
      </div>
    </Link>
  );
}

export function VenueGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function VenueCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink-2" aria-hidden="true">
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="skeleton h-5 w-2/3" /><div className="skeleton h-4 w-1/3" />
        <div className="flex gap-1.5"><div className="skeleton h-6 w-20" /><div className="skeleton h-6 w-16" /><div className="skeleton h-6 w-24" /></div>
      </div>
    </div>
  );
}
