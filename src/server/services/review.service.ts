import 'server-only';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { HttpError } from '@/lib/http';
import type { SessionPayload } from '@/lib/session';
import type { z } from 'zod';
import type { reviewSchema } from '@/lib/validators';
import { VENUES_TAG, venueTag } from './venue.service';

export async function listReviews(venueId: string, cursor?: string, take = 10) {
  const items = await prisma.review.findMany({
    where: { venueId, hidden: false },
    orderBy: { createdAt: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { author: { select: { name: true, company: true, avatarUrl: true } } },
  });
  const hasMore = items.length > take;
  if (hasMore) items.pop();
  return { items, nextCursor: hasMore ? items.at(-1)!.id : null };
}

/** Cria a avaliação e atualiza a média desnormalizada do local na mesma transação. */
export async function createReview(venueId: string, input: z.infer<typeof reviewSchema>, user: SessionPayload) {
  if (user.role !== 'PRODUCER' && user.role !== 'ADMIN') throw new HttpError(403, 'Somente produtores podem avaliar locais.');
  const venue = await prisma.venue.findFirst({ where: { id: venueId, status: 'PUBLISHED', deletedAt: null }, select: { slug: true, ownerId: true } });
  if (!venue) throw new HttpError(404, 'Local não encontrado.');
  if (venue.ownerId === user.sub) throw new HttpError(403, 'Você não pode avaliar o próprio local.');

  try {
    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({ data: { ...input, venueId, authorId: user.sub } });
      const agg = await tx.review.aggregate({ where: { venueId, hidden: false }, _avg: { overall: true }, _count: true });
      await tx.venue.update({ where: { id: venueId }, data: { ratingAvg: agg._avg.overall ?? 0, ratingCount: agg._count } });
      return r;
    });
    revalidateTag(venueTag(venue.slug));
    revalidateTag(VENUES_TAG);
    return review;
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') throw new HttpError(409, 'Você já avaliou este local para essa data.');
    throw e;
  }
}
