import 'server-only';
import { Prisma, type Venue } from '@prisma/client';
import { revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { buildVenueOrder, buildVenueWhere } from '@/lib/filters';
import { PAGE_SIZE, RESERVED_SLUGS, ROUTE_ORDER } from '@/lib/constants';
import { HttpError } from '@/lib/http';
import { normalize, slugify } from '@/lib/utils';
import type { SessionPayload } from '@/lib/session';
import type { VenueFilters, VenueInput } from '@/lib/validators';

export const VENUES_TAG = 'venues';
export const venueTag = (slug: string) => `venue:${slug}`;

/** Campos mínimos para um card — evita trazer descrição, ficha etc. na listagem. */
export const venueCardSelect = {
  id: true, slug: true, name: true, type: true, city: true, state: true, capacity: true,
  seatingFormat: true, acceptsRental: true, acceptsBoxOffice: true, rentalPriceCents: true,
  ratingAvg: true, ratingCount: true, dressingRooms: true, verified: true, latitude: true, longitude: true,
  photos: { where: { isCover: true }, take: 1, select: { url: true } },
  amenities: { take: 4, select: { amenity: { select: { key: true, label: true } } } },
  _count: { select: { photos: true } },
} satisfies Prisma.VenueSelect;
export type VenueCardData = Prisma.VenueGetPayload<{ select: typeof venueCardSelect }>;

/* ---------------------------- Leitura pública ---------------------------- */

export async function searchVenues(f: VenueFilters, take = PAGE_SIZE) {
  const where = buildVenueWhere(f);
  const [items, total] = await prisma.$transaction([
    prisma.venue.findMany({
      where,
      orderBy: buildVenueOrder(f.sort),
      select: venueCardSelect,
      take: take + 1,
      ...(f.cursor ? { cursor: { id: f.cursor }, skip: 1 } : {}),
    }),
    prisma.venue.count({ where }),
  ]);
  const hasMore = items.length > take;
  if (hasMore) items.pop();
  return { items, total, nextCursor: hasMore ? items[items.length - 1]!.id : null };
}

/** Resultado agrupado por cidade e ordenado como rota (sul → norte) para montar turnês. */
export async function searchVenuesByCity(f: VenueFilters) {
  const items = await prisma.venue.findMany({
    where: buildVenueWhere(f),
    orderBy: buildVenueOrder(f.sort),
    select: venueCardSelect,
    take: 200,
  });
  const groups = new Map<string, { city: string; state: string; venues: VenueCardData[] }>();
  for (const v of items) {
    const key = `${v.state}|${v.city}`;
    if (!groups.has(key)) groups.set(key, { city: v.city, state: v.state, venues: [] });
    groups.get(key)!.venues.push(v);
  }
  const rank = (uf: string) => { const i = ROUTE_ORDER.indexOf(uf); return i < 0 ? 99 : i; };
  return [...groups.values()].sort((a, b) => rank(a.state) - rank(b.state) || a.city.localeCompare(b.city));
}

export const getFeaturedVenues = unstable_cache(
  async (city?: string) =>
    prisma.venue.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, ...(city ? { cityNormalized: normalize(city) } : {}) },
      orderBy: [{ featured: 'desc' }, { ratingAvg: 'desc' }, { ratingCount: 'desc' }],
      select: venueCardSelect,
      take: 9,
    }),
  ['featured-venues'],
  { tags: [VENUES_TAG], revalidate: 300 },
);

export const getSpotlightVenues = unstable_cache(
  async () =>
    prisma.venue.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, featured: true },
      orderBy: { ratingAvg: 'desc' },
      take: 3,
      select: {
        ...venueCardSelect,
        description: true,
        parkingSpots: true,
      },
    }),
  ['spotlight-venues'],
  { tags: [VENUES_TAG], revalidate: 300 },
);

/** Cidades com mais locais publicados, para o seletor "Todas as cidades". */
export const getTopCities = unstable_cache(
  async () => {
    const rows = await prisma.venue.groupBy({
      by: ['city', 'state'],
      where: { status: 'PUBLISHED', deletedAt: null },
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });
    return rows.map((r) => ({ city: r.city, state: r.state, count: r._count._all }));
  },
  ['top-cities'],
  { tags: [VENUES_TAG], revalidate: 3600 },
);

export const getVenueBySlug = (slug: string) =>
  unstable_cache(
    () =>
      prisma.venue.findFirst({
        where: { slug, status: 'PUBLISHED', deletedAt: null },
        include: {
          photos: { orderBy: [{ isCover: 'desc' }, { position: 'asc' }] },
          amenities: { include: { amenity: true } },
          sections: true,
          shows: { orderBy: { date: 'desc' }, take: 12 },
          reviews: {
            where: { hidden: false },
            orderBy: { createdAt: 'desc' },
            take: 6,
            include: { author: { select: { name: true, company: true, avatarUrl: true } } },
          },
        },
      }),
    ['venue-by-slug', slug],
    { tags: [venueTag(slug)], revalidate: 600 },
  )();

export async function getReviewBreakdown(venueId: string) {
  const agg = await prisma.review.aggregate({
    where: { venueId, hidden: false },
    _avg: { technical: true, service: true, payment: true, audience: true, logistics: true },
  });
  return agg._avg;
}

/* ---------------------------- Área do dono ---------------------------- */

export function listOwnerVenues(ownerId: string) {
  return prisma.venue.findMany({
    where: { ownerId, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, slug: true, name: true, type: true, city: true, state: true, capacity: true,
      status: true, updatedAt: true,
      photos: { where: { isCover: true }, take: 1, select: { url: true } },
      _count: { select: { photos: true, requests: { where: { status: 'OPEN' } } } },
    },
  });
}

export async function getVenueForEdit(id: string, user: SessionPayload) {
  const venue = await prisma.venue.findFirst({
    where: { id, deletedAt: null },
    include: {
      photos: { orderBy: { position: 'asc' } },
      amenities: { select: { amenity: { select: { key: true } } } },
    },
  });
  if (!venue) throw new HttpError(404, 'Local não encontrado.');
  assertCanManage(venue, user);
  return venue;
}

function assertCanManage(venue: Pick<Venue, 'ownerId'>, user: SessionPayload) {
  if (user.role !== 'ADMIN' && venue.ownerId !== user.sub) {
    throw new HttpError(403, 'Você não pode alterar este local.');
  }
}

async function uniqueSlug(name: string, city: string, ignoreId?: string) {
  let base = slugify(`${name}-${city}`) || 'local';
  if (RESERVED_SLUGS.has(base)) base = `${base}-local`;
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const hit = await prisma.venue.findUnique({ where: { slug }, select: { id: true } });
    if (!hit || hit.id === ignoreId) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Converte o input do formulário nas colunas do banco. */
function toColumns(d: VenueInput) {
  return {
    name: d.name, type: d.type, description: d.description ?? null,
    state: d.state, city: d.city, cityNormalized: normalize(d.city), address: d.address,
    capacity: d.capacity, seatingFormat: d.seatingFormat,
    acceptsRental: d.acceptsRental, acceptsBoxOffice: d.acceptsBoxOffice,
    rentalPriceCents: d.acceptsRental ? d.rentalPriceCents ?? null : null,
    boxOfficePercent: d.acceptsBoxOffice && d.boxOfficePercent != null ? new Prisma.Decimal(d.boxOfficePercent) : null,
    dressingRooms: d.dressingRooms, parkingSpots: d.parkingSpots,
    stageWidth: d.stageWidth, stageDepth: d.stageDepth, stageHeight: d.stageHeight,
    techSpecs: d.techSpecs ?? Prisma.JsonNull,
    contactName: d.contactName, contactEmail: d.contactEmail, contactPhone: d.contactPhone,
    whatsapp: d.whatsapp, website: d.website, instagram: d.instagram,
  };
}

async function amenityConnections(keys: string[]) {
  if (!keys.length) return [];
  const rows = await prisma.amenity.findMany({ where: { key: { in: keys } }, select: { id: true } });
  return rows.map((r) => ({ amenityId: r.id }));
}

const photoRows = (d: VenueInput) =>
  d.photos.map((p, i) => ({ url: p.url, caption: p.caption ?? null, position: i, isCover: i === d.coverIndex }));

/** Dono publica → vai para análise. Admin publica direto. Local já publicado continua publicado. */
function nextStatus(intent: VenueInput['intent'], user: SessionPayload, current?: Venue['status']) {
  if (intent === 'draft') return current === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
  if (user.role === 'ADMIN' || current === 'PUBLISHED') return 'PUBLISHED';
  return 'PENDING';
}

export async function createVenue(data: VenueInput, user: SessionPayload) {
  const slug = await uniqueSlug(data.name, data.city);
  const venue = await prisma.venue.create({
    data: {
      ...toColumns(data),
      slug,
      status: nextStatus(data.intent, user),
      verified: user.role === 'ADMIN',
      ownerId: user.role === 'ADMIN' ? null : user.sub,
      photos: { create: photoRows(data) },
      amenities: { create: await amenityConnections(data.amenities) },
    },
    select: { id: true, slug: true, status: true, name: true },
  });
  revalidateTag(VENUES_TAG);
  return venue;
}

export async function updateVenue(id: string, data: VenueInput, user: SessionPayload) {
  const current = await prisma.venue.findFirst({ where: { id, deletedAt: null }, select: { ownerId: true, status: true, slug: true, name: true, city: true } });
  if (!current) throw new HttpError(404, 'Local não encontrado.');
  assertCanManage(current, user);

  const slug = current.name !== data.name || current.city !== data.city ? await uniqueSlug(data.name, data.city, id) : current.slug;
  const amenities = await amenityConnections(data.amenities);

  // Fotos e comodidades são substituídas em bloco, dentro de uma transação.
  const venue = await prisma.$transaction(async (tx) => {
    await tx.venuePhoto.deleteMany({ where: { venueId: id } });
    await tx.venueAmenity.deleteMany({ where: { venueId: id } });
    return tx.venue.update({
      where: { id },
      data: {
        ...toColumns(data),
        slug,
        status: nextStatus(data.intent, user, current.status),
        photos: { create: photoRows(data) },
        amenities: { create: amenities },
      },
      select: { id: true, slug: true, status: true, name: true },
    });
  });
  revalidateTag(VENUES_TAG);
  revalidateTag(venueTag(current.slug));
  if (slug !== current.slug) revalidateTag(venueTag(slug));
  return venue;
}

/** Exclusão lógica: permite "Desfazer" e preserva avaliações e histórico. */
export async function deleteVenue(id: string, user: SessionPayload) {
  const v = await prisma.venue.findFirst({ where: { id, deletedAt: null }, select: { ownerId: true, slug: true } });
  if (!v) throw new HttpError(404, 'Local não encontrado.');
  assertCanManage(v, user);
  await prisma.venue.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidateTag(VENUES_TAG);
  revalidateTag(venueTag(v.slug));
}

export async function restoreVenue(id: string, user: SessionPayload) {
  const v = await prisma.venue.findFirst({ where: { id, deletedAt: { not: null } }, select: { ownerId: true, slug: true } });
  if (!v) throw new HttpError(404, 'Nada para restaurar.');
  assertCanManage(v, user);
  await prisma.venue.update({ where: { id }, data: { deletedAt: null } });
  revalidateTag(VENUES_TAG);
  revalidateTag(venueTag(v.slug));
}
