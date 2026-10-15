import type { SeatingFormat, VenueType } from '@prisma/client';
import type { AmenityKey } from '@/lib/constants';

export type VenueDraft = {
  name: string; type: VenueType; state: string; city: string; address: string; description: string;
  capacity: string; seatingFormat: SeatingFormat; acceptsRental: boolean; acceptsBoxOffice: boolean;
  rentalPrice: string; boxOfficePercent: string;
  dressingRooms: number; parkingSpots: string; stageWidth: string; stageDepth: string; stageHeight: string;
  amenities: AmenityKey[]; techSpecs: Record<string, string>;
  photos: { url: string; caption?: string | null }[]; coverIndex: number;
  contactName: string; contactEmail: string; contactPhone: string; whatsapp: string; website: string; instagram: string;
};

export const emptyDraft = (): VenueDraft => ({
  name: '', type: 'THEATER', state: 'PR', city: '', address: '', description: '',
  capacity: '', seatingFormat: 'SEATED', acceptsRental: true, acceptsBoxOffice: false, rentalPrice: '', boxOfficePercent: '',
  dressingRooms: 1, parkingSpots: '', stageWidth: '', stageDepth: '', stageHeight: '',
  amenities: [], techSpecs: {}, photos: [], coverIndex: 0,
  contactName: '', contactEmail: '', contactPhone: '', whatsapp: '', website: '', instagram: '',
});

export type StepProps = {
  d: VenueDraft;
  set: (patch: Partial<VenueDraft>) => void;
  errors: Record<string, string>;
};

const n = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')));

/** Converte o rascunho do formulário no payload da API (mesmo formato validado no servidor). */
export function toPayload(d: VenueDraft, intent: 'draft' | 'publish') {
  return {
    intent,
    name: d.name, type: d.type, state: d.state, city: d.city, address: d.address || null, description: d.description || null,
    capacity: d.capacity.replace(/\D/g, ''), seatingFormat: d.seatingFormat,
    acceptsRental: d.acceptsRental, acceptsBoxOffice: d.acceptsBoxOffice,
    rentalPriceCents: d.acceptsRental && d.rentalPrice ? Math.round(Number(d.rentalPrice.replace(/\./g, '').replace(',', '.')) * 100) : null,
    boxOfficePercent: d.acceptsBoxOffice ? n(d.boxOfficePercent) : null,
    dressingRooms: d.dressingRooms, parkingSpots: Number(d.parkingSpots || 0),
    stageWidth: n(d.stageWidth), stageDepth: n(d.stageDepth), stageHeight: n(d.stageHeight),
    amenities: d.amenities, techSpecs: d.techSpecs, photos: d.photos, coverIndex: d.coverIndex,
    contactName: d.contactName, contactEmail: d.contactEmail, contactPhone: d.contactPhone,
    whatsapp: d.whatsapp, website: d.website, instagram: d.instagram,
  };
}
