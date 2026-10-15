import 'server-only';
import { prisma } from '@/lib/prisma';
import { HttpError } from '@/lib/http';
import type { SessionPayload } from '@/lib/session';
import type { z } from 'zod';
import type { availabilitySchema } from '@/lib/validators';

export async function requestAvailability(venueIds: string[], input: z.infer<typeof availabilitySchema>, user: SessionPayload) {
  const venues = await prisma.venue.findMany({ where: { id: { in: venueIds }, status: 'PUBLISHED', deletedAt: null }, select: { id: true } });
  if (!venues.length) throw new HttpError(404, 'Nenhum local válido.');
  // createMany: uma única ida ao banco mesmo para uma turnê inteira.
  await prisma.availabilityRequest.createMany({
    data: venues.map((v) => ({ ...input, venueId: v.id, requesterId: user.sub })),
  });
  return { sent: venues.length };
}
