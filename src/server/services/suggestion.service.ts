import 'server-only';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { HttpError } from '@/lib/http';
import { normalize, slugify } from '@/lib/utils';
import type { SessionPayload } from '@/lib/session';
import type { z } from 'zod';
import type { suggestionDecisionSchema, suggestionSchema } from '@/lib/validators';
import { VENUES_TAG } from './venue.service';

export async function createSuggestion(input: z.infer<typeof suggestionSchema>, user: SessionPayload | null) {
  return prisma.venueSuggestion.create({
    data: { ...input, submittedById: user?.sub ?? null },
    select: { id: true },
  });
}

export function listSuggestions(status?: string) {
  return prisma.venueSuggestion.findMany({
    where: status ? { status: status as never } : { status: { in: ['NEW', 'IN_REVIEW', 'NEEDS_INFO'] } },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { submittedBy: { select: { name: true, role: true } } },
  });
}

export async function getSuggestion(id: string) {
  const s = await prisma.venueSuggestion.findUnique({ where: { id }, include: { submittedBy: { select: { name: true, email: true, role: true } } } });
  if (!s) throw new HttpError(404, 'Sugestão não encontrada.');
  return s;
}

/** Possíveis duplicatas: mesmo estado e nome/cidade parecidos. */
export function findDuplicates(name: string, state: string, city: string) {
  return prisma.venue.findMany({
    where: { state, deletedAt: null, OR: [{ name: { contains: name.split(' ').slice(-1)[0], mode: 'insensitive' } }, { cityNormalized: normalize(city), name: { contains: name, mode: 'insensitive' } }] },
    select: { id: true, name: true, city: true, slug: true },
    take: 5,
  });
}

export async function decideSuggestion(id: string, input: z.infer<typeof suggestionDecisionSchema>, admin: SessionPayload) {
  if (admin.role !== 'ADMIN') throw new HttpError(403, 'Apenas administradores.');
  const s = await getSuggestion(id);
  const statusMap = { approve: 'APPROVED', needs_info: 'NEEDS_INFO', reject: 'REJECTED', in_review: 'IN_REVIEW' } as const;

  if (input.action !== 'approve') {
    return prisma.venueSuggestion.update({ where: { id }, data: { status: statusMap[input.action], internalNotes: input.internalNotes } });
  }

  const o = input.overrides ?? {};
  const name = o.name ?? s.name;
  const city = o.city ?? s.city;
  const capacity = o.capacity ?? s.capacity;
  if (!capacity) throw new HttpError(422, 'Informe a capacidade antes de aprovar.', { capacity: 'Obrigatório para publicar.' });

  let slug = slugify(`${name}-${city}`);
  if (await prisma.venue.findUnique({ where: { slug }, select: { id: true } })) slug = `${slug}-${Date.now().toString(36)}`;
  const keys = o.amenities ?? (s.amenityKeys as string[]);
  const amenities = await prisma.amenity.findMany({ where: { key: { in: keys } }, select: { id: true } });

  const result = await prisma.$transaction(async (tx) => {
    const venue = await tx.venue.create({
      data: {
        slug, name, city, cityNormalized: normalize(city),
        type: o.type ?? s.type, state: o.state ?? s.state, capacity,
        seatingFormat: o.seatingFormat ?? s.seatingFormat ?? 'SEATED',
        acceptsRental: o.acceptsRental ?? s.acceptsRental ?? true,
        acceptsBoxOffice: o.acceptsBoxOffice ?? s.acceptsBoxOffice ?? false,
        dressingRooms: o.dressingRooms ?? s.dressingRooms ?? 0,
        parkingSpots: o.parkingSpots ?? 0,
        status: 'PUBLISHED', verified: true,
        ownerId: s.relation === 'MANAGER' ? s.submittedById : null,
        photos: { create: s.photoUrls.map((url, i) => ({ url, position: i, isCover: i === 0 })) },
        amenities: { create: amenities.map((a) => ({ amenityId: a.id })) },
      },
      select: { id: true, slug: true },
    });
    await tx.venueSuggestion.update({ where: { id }, data: { status: 'APPROVED', venueId: venue.id, internalNotes: input.internalNotes } });
    return venue;
  });
  revalidateTag(VENUES_TAG);
  return result;
}

export async function adminStats() {
  const [pending, needsInfo, publishedMonth, reviews] = await prisma.$transaction([
    prisma.venueSuggestion.count({ where: { status: { in: ['NEW', 'IN_REVIEW'] } } }),
    prisma.venueSuggestion.count({ where: { status: 'NEEDS_INFO' } }),
    prisma.venue.count({ where: { status: 'PUBLISHED', createdAt: { gte: new Date(new Date().setDate(1)) } } }),
    prisma.venue.count({ where: { status: 'PENDING', deletedAt: null } }),
  ]);
  return { pending, needsInfo, publishedMonth, pendingVenues: reviews };
}
