import 'server-only';
import { prisma } from '@/lib/prisma';
import { HttpError } from '@/lib/http';
import type { SessionPayload } from '@/lib/session';
import type { z } from 'zod';
import type { tourSchema } from '@/lib/validators';

export function listTours(user: SessionPayload) {
  return prisma.tour.findMany({
    where: { ownerId: user.sub },
    orderBy: { updatedAt: 'desc' },
    include: {
      stops: {
        orderBy: { position: 'asc' },
        include: { venue: { select: { id: true, slug: true, name: true, city: true, state: true, capacity: true } } },
      },
    },
  });
}

export async function saveTour(input: z.infer<typeof tourSchema>, user: SessionPayload, id?: string) {
  if (id) {
    const t = await prisma.tour.findUnique({ where: { id }, select: { ownerId: true } });
    if (!t || t.ownerId !== user.sub) throw new HttpError(404, 'Turnê não encontrada.');
  }
  const stops = input.stops.map((s, i) => ({ venueId: s.venueId, position: i, date: s.date ?? null }));
  return prisma.$transaction(async (tx) => {
    if (id) {
      await tx.tourStop.deleteMany({ where: { tourId: id } });
      return tx.tour.update({ where: { id }, data: { name: input.name, stops: { create: stops } }, select: { id: true } });
    }
    return tx.tour.create({ data: { name: input.name, ownerId: user.sub, stops: { create: stops } }, select: { id: true } });
  });
}

export async function deleteTour(id: string, user: SessionPayload) {
  const res = await prisma.tour.deleteMany({ where: { id, ownerId: user.sub } });
  if (!res.count) throw new HttpError(404, 'Turnê não encontrada.');
}
