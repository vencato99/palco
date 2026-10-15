import { deleteTour, saveTour } from '@/server/services/tour.service';
import { requireUser } from '@/lib/auth';
import { ok, parseBody, route } from '@/lib/http';
import { tourSchema } from '@/lib/validators';

export const runtime = 'nodejs';
type Ctx = { params: { id: string } };

export const PUT = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  return ok(await saveTour(await parseBody(req, tourSchema), user, params.id));
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  await deleteTour(params.id, await requireUser());
  return ok({ ok: true });
});
