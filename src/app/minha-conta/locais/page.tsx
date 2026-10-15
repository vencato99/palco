import type { Metadata } from 'next';
import { listOwnerVenues } from '@/server/services/venue.service';
import { requireUser } from '@/lib/auth';
import { MyVenuesList } from '@/components/account/MyVenuesList';
import { ButtonLink, Icon } from '@/components/ui';

export const metadata: Metadata = { title: 'Meus locais' };
export const dynamic = 'force-dynamic';

export default async function MyVenuesPage() {
  const user = await requireUser();
  const venues = await listOwnerVenues(user.sub);
  const rows = venues.map((v) => ({
    id: v.id, slug: v.slug, name: v.name, type: v.type, city: v.city, state: v.state, capacity: v.capacity, status: v.status,
    updatedAt: v.updatedAt.toISOString(), cover: v.photos[0]?.url ?? null, photos: v._count.photos, openRequests: v._count.requests,
  }));
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-8 pb-28 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Meus locais</h1>
          <p className="text-mute">{rows.length === 1 ? '1 local cadastrado' : `${rows.length} locais cadastrados`}</p>
        </div>
        <ButtonLink href="/minha-conta/locais/novo" size="lg"><Icon name="plus" size={18} />Cadastrar novo local</ButtonLink>
      </div>
      <MyVenuesList rows={rows} />
    </div>
  );
}
