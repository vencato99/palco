import { deleteVenue, getVenueForEdit, updateVenue } from '@/server/services/venue.service';
import { requireUser } from '@/lib/auth';
import { ok, parseBody, route } from '@/lib/http';
import { venueInputSchema } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Ctx = { params: { id: string } };

export const GET = route<Ctx>(async (_req, { params }) => ok(await getVenueForEdit(params.id, await requireUser())));

export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  return ok(await updateVenue(params.id, await parseBody(req, venueInputSchema), user));
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  await deleteVenue(params.id, await requireUser());
  return ok({ ok: true });
});
