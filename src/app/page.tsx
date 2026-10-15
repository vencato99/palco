import { Suspense } from 'react';
import { getFeaturedVenues, getSpotlightVenues, getTopCities } from '@/server/services/venue.service';
import { SmartSearch } from '@/components/tour/SmartSearch';
import { PopularVenues, SpotlightVenues, TourCallout } from '@/components/home/HomeSections';

export const revalidate = 300;

export default async function HomePage({ searchParams }: { searchParams: { cidade?: string } }) {
  const city = searchParams.cidade?.slice(0, 80);
  // Consultas independentes em paralelo; cada uma com cache próprio.
  const [venues, cities, spotlight] = await Promise.all([getFeaturedVenues(city), getTopCities(), getSpotlightVenues()]);

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto flex max-w-page flex-col gap-8 px-4 pb-14 pt-12 md:px-6 md:pb-20 md:pt-20">
          <h1 className="max-w-4xl font-display text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.03em]">
            O palco certo para cada data da sua turnê.
          </h1>
          <p className="max-w-xl text-lg text-mute">Casas de show, teatros, auditórios e espaços para alugar no Brasil, com ficha técnica, avaliações de produtores e contato direto.</p>
          <div className="max-w-4xl"><Suspense><SmartSearch /></Suspense></div>
        </div>
      </section>
      <div className="mx-auto flex max-w-page flex-col gap-20 px-4 py-14 md:px-6">
        <PopularVenues venues={venues} cities={cities} city={city} />
        <TourCallout />
        <SpotlightVenues venues={spotlight} />
      </div>
    </>
  );
}
