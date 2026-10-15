import type { Prisma } from '@prisma/client';
import { venueFiltersSchema, type VenueFilters } from './validators';
import { normalize } from './utils';

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

const getAll = (p: Params, k: string): string[] => {
  if (p instanceof URLSearchParams) return p.getAll(k).flatMap((v) => v.split(','));
  const v = p[k];
  return (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(',')).filter(Boolean);
};
const get = (p: Params, k: string) => getAll(p, k)[0];

/** Lê filtros da URL (fonte única da verdade → links compartilháveis e cache por URL). */
export function filtersFromParams(p: Params): VenueFilters {
  const raw = {
    q: get(p, 'q'),
    type: get(p, 'tipo'),
    capMin: get(p, 'min'),
    capMax: get(p, 'max'),
    format: get(p, 'formato'),
    model: get(p, 'modelo'),
    states: getAll(p, 'uf'),
    city: get(p, 'cidade'),
    amenities: getAll(p, 'com'),
    dressingMin: get(p, 'camarins'),
    parkingMin: get(p, 'vagas'),
    sort: get(p, 'ordem'),
    cursor: get(p, 'cursor'),
  };
  const res = venueFiltersSchema.safeParse(raw);
  // Filtro inválido não derruba a página: ignoramos só o campo problemático.
  if (res.success) return res.data;
  const clean: Record<string, unknown> = { ...raw };
  for (const issue of res.error.issues) delete clean[issue.path[0] as string];
  return venueFiltersSchema.parse(clean);
}

export function filtersToParams(f: Partial<VenueFilters>): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.type) p.set('tipo', f.type);
  if (f.capMin) p.set('min', String(f.capMin));
  if (f.capMax) p.set('max', String(f.capMax));
  if (f.format) p.set('formato', f.format);
  if (f.model) p.set('modelo', f.model);
  if (f.states?.length) p.set('uf', f.states.join(','));
  if (f.city) p.set('cidade', f.city);
  if (f.amenities?.length) p.set('com', f.amenities.join(','));
  if (f.dressingMin) p.set('camarins', String(f.dressingMin));
  if (f.parkingMin) p.set('vagas', String(f.parkingMin));
  if (f.sort && f.sort !== 'rating') p.set('ordem', f.sort);
  return p;
}

export function countActiveFilters(f: VenueFilters) {
  return [f.type, f.capMin || f.capMax, f.format, f.model, f.states?.length, f.city, f.dressingMin, f.parkingMin]
    .filter(Boolean).length + (f.amenities?.length ?? 0);
}

/** Monta o WHERE do Prisma. Só locais publicados e não excluídos. */
export function buildVenueWhere(f: VenueFilters): Prisma.VenueWhereInput {
  const and: Prisma.VenueWhereInput[] = [{ status: 'PUBLISHED', deletedAt: null }];
  if (f.type) and.push({ type: f.type });
  if (f.capMin || f.capMax) and.push({ capacity: { gte: f.capMin, lte: f.capMax } });
  if (f.format) and.push({ seatingFormat: f.format });
  if (f.model === 'rental') and.push({ acceptsRental: true });
  if (f.model === 'boxoffice') and.push({ acceptsBoxOffice: true });
  if (f.states?.length) and.push({ state: { in: f.states } });
  if (f.city) and.push({ cityNormalized: { contains: normalize(f.city) } });
  if (f.dressingMin) and.push({ dressingRooms: { gte: f.dressingMin } });
  if (f.parkingMin) and.push({ parkingSpots: { gte: f.parkingMin } });
  // Cada comodidade exigida vira um EXISTS — usa o índice de VenueAmenity.
  for (const key of f.amenities ?? []) and.push({ amenities: { some: { amenity: { key } } } });
  if (f.q && !f.type && !f.capMin) {
    and.push({ OR: [{ name: { contains: f.q, mode: 'insensitive' } }, { cityNormalized: { contains: normalize(f.q) } }] });
  }
  return { AND: and };
}

export function buildVenueOrder(sort: VenueFilters['sort']): Prisma.VenueOrderByWithRelationInput[] {
  if (sort === 'capacity') return [{ capacity: 'desc' }, { id: 'asc' }];
  if (sort === 'recent') return [{ createdAt: 'desc' }, { id: 'asc' }];
  return [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }, { id: 'asc' }];
}
