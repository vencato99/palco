import { restoreVenue } from '@/server/services/venue.service';
import { requireUser } from '@/lib/auth';
import { ok, route } from '@/lib/http';

export const runtime = 'nodejs';

export const POST = route<{ params: { id: string } }>(async (_req, { params }) => {
  await restoreVenue(params.id, await requireUser());
  return ok({ ok: true });
});
