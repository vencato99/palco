import { notFound } from 'next/navigation';
import { getVenueForEdit } from '@/server/services/venue.service';
import { requireUser } from '@/lib/auth';
import { HttpError } from '@/lib/http';
import { VenueForm } from '@/components/forms/venue-form/VenueForm';
import type { VenueDraft } from '@/components/forms/venue-form/types';
import type { AmenityKey } from '@/lib/constants';

export const metadata = { title: 'Editar local' };
export const dynamic = 'force-dynamic';

const s = (v: unknown) => (v == null ? '' : String(v));

export default async function EditVenuePage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const v = await getVenueForEdit(params.id, user).catch((e) => { if (e instanceof HttpError) notFound(); throw e; });

  // Converte o registro do banco para o rascunho do formulário (strings para inputs controlados).
  const initial: VenueDraft = {
    name: v.name, type: v.type, state: v.state, city: v.city, address: s(v.address), description: s(v.description),
    capacity: s(v.capacity), seatingFormat: v.seatingFormat, acceptsRental: v.acceptsRental, acceptsBoxOffice: v.acceptsBoxOffice,
    rentalPrice: v.rentalPriceCents != null ? String(v.rentalPriceCents / 100) : '', boxOfficePercent: s(v.boxOfficePercent),
    dressingRooms: v.dressingRooms, parkingSpots: s(v.parkingSpots), stageWidth: s(v.stageWidth), stageDepth: s(v.stageDepth), stageHeight: s(v.stageHeight),
    amenities: v.amenities.map((a) => a.amenity.key as AmenityKey), techSpecs: (v.techSpecs as Record<string, string>) ?? {},
    photos: v.photos.map((p) => ({ url: p.url, caption: p.caption })), coverIndex: Math.max(0, v.photos.findIndex((p) => p.isCover)),
    contactName: s(v.contactName), contactEmail: s(v.contactEmail), contactPhone: s(v.contactPhone), whatsapp: s(v.whatsapp), website: s(v.website), instagram: s(v.instagram),
  };
  return <div className="mx-auto max-w-[1240px] px-4 py-8 md:px-6"><VenueForm venueId={v.id} initial={initial} status={v.status} /></div>;
}
