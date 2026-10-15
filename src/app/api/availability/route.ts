import { z } from 'zod';
import { requestAvailability } from '@/server/services/availability.service';
import { requireUser } from '@/lib/auth';
import { ok, parseBody, route } from '@/lib/http';
import { availabilitySchema } from '@/lib/validators';

export const runtime = 'nodejs';

const bodySchema = availabilitySchema.extend({ venueIds: z.array(z.string()).min(1).max(100) });

/** Envia consulta de disponibilidade para um local ou para a turnê inteira. */
export const POST = route(async (req) => {
  const user = await requireUser();
  const { venueIds, ...rest } = await parseBody(req, bodySchema);
  return ok(await requestAvailability(venueIds, rest, user), { status: 201 });
});
