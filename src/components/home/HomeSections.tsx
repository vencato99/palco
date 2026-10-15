import Image from 'next/image';
import Link from 'next/link';
import type { VenueCardData } from '@/server/services/venue.service';
import { VenueCard, VenueGrid } from '@/components/venue/VenueCard';
import { ButtonLink, Icon } from '@/components/ui';
import { SEATING_FORMATS, VENUE_TYPES } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import { CityPicker } from './CityPicker';

export function SectionHeader({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>{text ? <p className="mt-1 text-mute">{text}</p> : null}</div>
      {action}
    </div>
  );
}

/** Equivalente ao "Populares" da referência: grade filtrável por cidade. */
export function PopularVenues({ venues, cities, city }: { venues: VenueCardData[]; cities: { city: string; state: string; count: number }[]; city?: string }) {
  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title="Mais bem avaliados" text="Locais com as melhores notas de produtores" action={<CityPicker cities={cities} value={city} />} />
      {venues.length ? (
        <VenueGrid>{venues.map((v, i) => <VenueCard key={v.id} venue={v} priority={i < 3} />)}</VenueGrid>
      ) : <p className="text-mute">Ainda não há locais publicados nesta cidade. <Link href="/sugerir" className="underline">Sugira um.</Link></p>}
      <ButtonLink href={city ? `/locais?cidade=${encodeURIComponent(city)}` : '/locais'} variant="secondary" className="self-center">Ver todos os locais</ButtonLink>
    </section>
  );
}

/** Chamada para a busca de turnê, equivalente a "Turnês acontecendo". */
export function TourCallout() {
  const routes = [
    { q: 'Teatro para mais de 1000 pessoas no Sul e Sudeste', label: 'Teatros 1.000+ no Sul e Sudeste' },
    { q: 'Casa de show de pé até 1500 pessoas no Nordeste', label: 'Casas de show no Nordeste' },
    { q: 'Auditório com bilheteria acima de 500 pessoas em SP', label: 'Auditórios com bilheteria em SP' },
  ];
  return (
    <section className="grid gap-6 overflow-hidden rounded-[2rem] border border-line bg-ink-2 p-6 md:grid-cols-[1.1fr_1fr] md:p-10">
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Monte a turnê inteira em uma busca</h2>
        <p className="max-w-md text-mute">Descreva o que você precisa. A gente separa os locais por cidade na ordem da estrada, e você envia a consulta de datas para todos de uma vez.</p>
        <ButtonLink href="/buscar" className="self-start"><Icon name="route" size={18} />Montar turnê</ButtonLink>
      </div>
      <ul className="flex flex-col gap-2">
        {routes.map((r) => (
          <li key={r.q}>
            <Link href={`/buscar?q=${encodeURIComponent(r.q)}`} className="flex items-center justify-between gap-4 rounded-2xl border border-line px-5 py-4 hover:border-mute">
              <span className="font-semibold">{r.label}</span><Icon name="next" size={18} className="text-mute" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Spot = VenueCardData & { description: string | null; parkingSpots: number };

/** Equivalente a "Projetos especiais": locais em destaque com ficha resumida. */
export function SpotlightVenues({ venues }: { venues: Spot[] }) {
  if (!venues.length) return null;
  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title="Em destaque" text="Casas verificadas pela equipe Palco" />
      <div className="grid gap-5 lg:grid-cols-2">
        {venues.slice(0, 2).map((v) => (
          <Link key={v.id} href={`/${v.slug}`} className="group grid overflow-hidden rounded-[2rem] border border-line bg-ink-2 sm:grid-cols-2">
            <div className="relative min-h-56 bg-ink-3">
              {v.photos[0] ? <Image src={v.photos[0].url} alt={v.name} fill sizes="(min-width:1024px) 320px, 50vw" className="object-cover" /> : null}
            </div>
            <div className="flex flex-col gap-3 p-6">
              <p className="text-sm text-mute">{VENUE_TYPES[v.type]}</p>
              <h3 className="font-display text-2xl font-bold">{v.name}</h3>
              {v.description ? <p className="line-clamp-3 text-sm text-mute">{v.description}</p> : null}
              <dl className="mt-auto grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-mute">Onde</dt><dd className="font-semibold">{v.city}, {v.state}</dd></div>
                <div><dt className="text-mute">Público</dt><dd className="font-semibold">{formatNumber(v.capacity)} · {SEATING_FORMATS[v.seatingFormat]}</dd></div>
                <div><dt className="text-mute">Camarins</dt><dd className="font-semibold">{v.dressingRooms}</dd></div>
                <div><dt className="text-mute">Estacionamento</dt><dd className="font-semibold">{v.parkingSpots ? `${formatNumber(v.parkingSpots)} vagas` : '—'}</dd></div>
              </dl>
              <span className="text-sm font-semibold underline-offset-4 group-hover:underline">Ver o local</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
